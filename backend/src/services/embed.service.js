/**
 * embed.service.js
 * Wrapper untuk Gemini Embedding API.
 * Aturan #15: satu tanggung jawab — hanya handle embedding, tidak ada logika lain.
 * Mengganti model embedding cukup ubah GEMINI_EMBED_MODEL di .env.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.config.js';
import logger from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// text-embedding-004 adalah model terbaru Gemini untuk semantic search
const embeddingModel = genAI.getGenerativeModel({
    model: env.GEMINI_EMBED_MODEL || 'text-embedding-004',
});

/**
 * Embed satu string teks menjadi vector float.
 * @param {string} text - Teks yang akan di-embed
 * @param {'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'} taskType
 *   - RETRIEVAL_DOCUMENT: untuk chunk dokumen saat ingest
 *   - RETRIEVAL_QUERY : untuk query user saat search
 * @returns {Promise<number[]>} - Vector embedding
 */
export async function embedText(text, taskType = 'RETRIEVAL_DOCUMENT') {
    try {
        const result = await embeddingModel.embedContent({
            content: { parts: [{ text }], role: 'user' },
            taskType,
        });

        return result.embedding.values;
    } catch (error) {
        logger.error('Embedding failed', { error: error.message, textLength: text.length });
        throw new Error(`Gagal membuat embedding: ${error.message}`);
    }
}

/**
 * Embed batch teks (lebih efisien untuk ingest banyak chunk).
 * Proses sequential dengan jeda kecil untuk hindari rate limit Gemini.
 * @param {string[]} texts
 * @param {'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'} taskType
 * @returns {Promise<number[][]>}
 */
export async function embedBatch(texts, taskType = 'RETRIEVAL_DOCUMENT') {
    const embeddings = [];

    for (let i = 0; i < texts.length; i++) {
        const embedding = await embedText(texts[i], taskType);
        embeddings.push(embedding);

        // Jeda 200ms antar request — hindari rate limit Gemini free tier
        if (i < texts.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Log progress setiap 10 chunk
        if ((i + 1) % 10 === 0 || i === texts.length - 1) {
            logger.info(`Embedding progress`, { done: i + 1, total: texts.length });
        }
    }

    return embeddings;
}
