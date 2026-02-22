/**
 * ingest.js
 * Script satu kali untuk upload PDF → chunk → embed → simpan ke ChromaDB.
 * Jalankan: node scripts/ingest.js <path-ke-pdf>
 *
 * Aturan #9: chunk size 400-600 token, overlap 50-100 token.
 * Pendekatan: 1 token ≈ 3-4 karakter (untuk teks campuran Indo/English).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

import { getCollection } from '../src/config/chroma.config.js';
import { embedBatch } from '../src/services/embed.service.js';
import logger from '../src/utils/logger.js';


// ============================================================
// KONFIGURASI CHUNKING (Aturan #9)
// ============================================================
const CHUNK_CHAR_SIZE = 1800;   // ≈ 450 token (1 token ≈ 4 char)
const CHUNK_OVERLAP = 300;    // ≈ 75 token overlap antar chunk

/**
 * Baca dan ekstrak teks dari file PDF atau TXT.
 * Deteksi otomatis: jika PDF menghasilkan < 100 char, kemungkinan scanned image.
 * @param {string} filePath - Path absolut ke file
 * @returns {Promise<{text: string, numPages: number}>}
 */
async function extractText(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    // Support file .txt sebagai alternatif PDF scanned
    if (ext === '.txt') {
        const text = fs.readFileSync(filePath, 'utf-8');
        return { text, numPages: 1 };
    }

    if (ext === '.pdf') {
        const buffer = fs.readFileSync(filePath);
        const uint8 = new Uint8Array(buffer);
        // Import dengan alias agar tidak bentrok nama fungsi lokal
        const { extractText: pdfExtract } = await import('unpdf');
        const result = await pdfExtract(uint8, { mergePages: true });

        if (result.text.length < 100) {
            throw new Error(
                'PDF ini tampaknya berupa scan gambar (text-layer kosong).\n' +
                'Solusi: Konversi ke teks dulu menggunakan Adobe/online OCR,\n' +
                'lalu simpan sebagai file .txt dan jalankan:\n' +
                `  node scripts/ingest.js <file>.txt`
            );
        }

        return { text: result.text, numPages: result.totalPages };
    }

    throw new Error(`Format file tidak didukung: ${ext}. Gunakan .pdf atau .txt`);
}

/**
 * Split teks menjadi chunk dengan overlap — sliding window approach.
 * Memotong di spasi (bukan di tengah kata) untuk menjaga readability.
 * @param {string} text - Teks lengkap dari PDF
 * @param {string} source - Nama file (untuk metadata)
 * @returns {Array<{text: string, metadata: object}>}
 */
function splitIntoChunks(text, source) {
    // Bersihkan whitespace berlebih dari PDF
    const cleanText = text.replace(/\s+/g, ' ').trim();

    const chunks = [];
    let start = 0;

    while (start < cleanText.length) {
        let end = start + CHUNK_CHAR_SIZE;

        // Jangan potong di tengah kata — cari spasi terdekat
        if (end < cleanText.length) {
            const lastSpace = cleanText.lastIndexOf(' ', end);
            if (lastSpace > start) end = lastSpace;
        } else {
            end = cleanText.length;
        }

        const chunkText = cleanText.slice(start, end).trim();

        if (chunkText.length > 50) { // Skip chunk yang terlalu pendek
            chunks.push({
                text: chunkText,
                metadata: {
                    source: path.basename(source),
                    chunkIndex: chunks.length,
                    charStart: start,
                    charEnd: end,
                },
            });
        }

        // Slide window — mundur sejauh OVERLAP untuk konteks sambungan
        const nextStart = end - CHUNK_OVERLAP;

        // Safety: Ensure forward progress to avoid infinite loop
        // If chunk is smaller than overlap (e.g. end of file), nextStart might be <= start
        // Force at least +1 char progress if not done
        start = (nextStart > start) ? nextStart : start + 1;

        // If we reached the end, stop
        if (end >= cleanText.length) break;
    }

    return chunks;
}

/**
 * Simpan chunk + embedding ke ChromaDB.
 * @param {Array<{text: string, metadata: object}>} chunks
 * @param {number[][]} embeddings
 * @param {string} collectionName
 */
async function saveToChroma(chunks, embeddings, collectionName) {
    const collection = await getCollection();

    // Hapus dokumen lama dengan source yang sama (untuk re-ingest)
    try {
        const existing = await collection.get({
            where: { source: path.basename(chunks[0].metadata.source) },
        });
        if (existing.ids.length > 0) {
            await collection.delete({ ids: existing.ids });
            logger.info(`Deleted ${existing.ids.length} existing chunks for re-ingest`);
        }
    } catch {
        // Collection kosong — tidak apa-apa
    }

    // Buat ID unik untuk setiap chunk
    const ids = chunks.map((chunk) =>
        `${path.basename(chunk.metadata.source)}_chunk_${chunk.metadata.chunkIndex}`
    );

    await collection.add({
        ids,
        embeddings,
        documents: chunks.map((c) => c.text),
        metadatas: chunks.map((c) => c.metadata),
    });

    logger.info(`Saved ${chunks.length} chunks to ChromaDB`, {
        collection: collectionName,
        ids: ids.slice(0, 3), // Log 3 ID pertama saja
    });
}

// ============================================================
// MAIN — Entry point
// ============================================================
async function main() {
    const pdfPath = process.argv[2];

    if (!pdfPath) {
        logger.error('Usage: node scripts/ingest.js <path-ke-pdf>');
        process.exit(1);
    }

    const absolutePath = path.resolve(pdfPath);

    if (!fs.existsSync(absolutePath)) {
        logger.error(`File tidak ditemukan: ${absolutePath}`);
        process.exit(1);
    }

    logger.info('=== INGEST DIMULAI ===', { file: path.basename(absolutePath) });

    // Step 1: Ekstrak teks dari PDF
    logger.info('Step 1/4: Membaca PDF...');
    const { text, numPages } = await extractText(absolutePath);
    logger.info(`PDF dibaca: ${numPages} halaman, ${text.length} karakter`);

    // Step 2: Split menjadi chunks
    logger.info('Step 2/4: Splitting teks menjadi chunks...');
    const chunks = splitIntoChunks(text, absolutePath);
    logger.info(`Total chunks: ${chunks.length}`, {
        avgChunkSize: Math.round(chunks.reduce((s, c) => s + c.text.length, 0) / chunks.length),
        chunkSizeTarget: `${CHUNK_CHAR_SIZE} chars (≈${Math.round(CHUNK_CHAR_SIZE / 4)} tokens)`,
    });

    // Step 3: Embed semua chunk (dengan progress log tiap 10)
    logger.info('Step 3/4: Membuat embeddings via Gemini... (ini butuh beberapa menit)');
    const embeddings = await embedBatch(chunks.map((c) => c.text));
    logger.info(`Embeddings selesai: ${embeddings.length} vectors`);

    // Step 4: Simpan ke ChromaDB
    logger.info('Step 4/4: Menyimpan ke ChromaDB...');
    await saveToChroma(chunks, embeddings, process.env.CHROMA_COLLECTION || 'pens_docs');

    logger.info('=== INGEST SELESAI ===', {
        file: path.basename(absolutePath),
        chunks: chunks.length,
        status: 'Siap untuk query',
    });
}

main().catch((err) => {
    logger.error('Ingest gagal', { error: err.message });
    process.exit(1);
});
