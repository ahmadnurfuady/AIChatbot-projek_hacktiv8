/**
 * rag.service.js
 * Retrieval-Augmented Generation service.
 * Aturan #12: business logic di /services, bukan di route.
 * Aturan #15: satu tanggung jawab — query ChromaDB untuk context retrieval.
 */

import { getCollection } from '../config/chroma.config.js';
import { embedText } from './embed.service.js';
import logger from '../utils/logger.js';

/**
 * Cari dokumen paling relevan dari ChromaDB berdasarkan query user.
 * @param {string} query - Pertanyaan dari user
 * @param {number} [topK=3] - Jumlah dokumen yang diambil
 * @returns {Promise<{ context: string, sources: Array<{id: string, score: number, metadata: object}> }>}
 */
export async function retrieveContext(query, topK = 3) {
    try {
        // Embed query dengan taskType RETRIEVAL_QUERY (berbeda dari DOCUMENT)
        const queryEmbedding = await embedText(query, 'RETRIEVAL_QUERY');

        const collection = await getCollection();

        // Query ChromaDB — ambil top-K chunk paling relevan
        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: topK,
            include: ['documents', 'metadatas', 'distances'],
        });

        // Tidak ada hasil — kembalikan context kosong
        if (!results.documents?.[0]?.length) {
            logger.warn('RAG: No documents found', { query });
            return { context: '', sources: [] };
        }

        const documents = results.documents[0];
        const metadatas = results.metadatas[0];
        const distances = results.distances[0];

        // Format dokumen menjadi string context untuk LLM
        const contextParts = documents.map((doc, i) => {
            const source = metadatas[i]?.source || 'Dokumen';
            const page = metadatas[i]?.page ? ` Hal. ${metadatas[i].page}` : '';
            return `[${source}${page}]\n${doc}`;
        });

        const context = contextParts.join('\n\n---\n\n');

        // Buat array sources untuk logging/debugging
        const sources = documents.map((_, i) => ({
            id: results.ids[0][i],
            score: 1 - (distances[i] || 0), // cosine: 1 - distance = similarity
            metadata: metadatas[i] || {},
        }));

        logger.info('RAG: Context retrieved', {
            query: query.substring(0, 80),
            docsFound: documents.length,
            topScore: sources[0]?.score.toFixed(3),
        });

        return { context, sources };
    } catch (error) {
        logger.error('RAG retrieval failed', { error: error.message });
        throw new Error(`Gagal mengambil konteks: ${error.message}`);
    }
}

/**
 * Cek apakah collection sudah punya dokumen ter-ingest.
 * Dipakai oleh /health endpoint (Hari 3).
 * @returns {Promise<number>} - Jumlah dokumen di collection
 */
export async function getDocumentCount() {
    try {
        const collection = await getCollection();
        return await collection.count();
    } catch {
        return 0;
    }
}
