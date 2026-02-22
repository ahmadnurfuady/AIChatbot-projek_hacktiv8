/**
 * chroma.config.js
 * Singleton ChromaDB client.
 * Gunakan getCollection() untuk mengakses collection — bukan chromaClient langsung.
 * Aturan #15: satu tanggung jawab per module.
 */

import { ChromaClient } from 'chromadb';
import env from './env.config.js';
import logger from '../utils/logger.js';

// Parse CHROMA_URL → host & port (chromadb v2 tidak pakai 'path' lagi)
const chromaUrl = new URL(env.CHROMA_URL);

// Singleton client — dibuat sekali, dipakai ulang
const chromaClient = new ChromaClient({
    host: chromaUrl.hostname,
    port: parseInt(chromaUrl.port || '8000', 10),
    ssl: chromaUrl.protocol === 'https:',
});

/**
 * Ambil (atau buat jika belum ada) ChromaDB collection.
 * Menggunakan cosine distance — lebih baik untuk semantic similarity text.
 * @returns {Promise<import('chromadb').Collection>}
 */
export async function getCollection() {
    try {
        const collection = await chromaClient.getOrCreateCollection({
            name: env.CHROMA_COLLECTION,
            metadata: {
                description: 'PENS document knowledge base',
                'hnsw:space': 'cosine', // metric untuk semantic similarity
            },
        });

        logger.info('ChromaDB collection ready', {
            collection: env.CHROMA_COLLECTION,
            url: env.CHROMA_URL,
        });

        return collection;
    } catch (error) {
        logger.error('Failed to connect to ChromaDB', {
            url: env.CHROMA_URL,
            error: error.message,
        });
        throw error;
    }
}

/**
 * Ping ChromaDB untuk health check — tidak throw, hanya return boolean.
 * @returns {Promise<boolean>}
 */
export async function pingChroma() {
    try {
        await chromaClient.heartbeat();
        return true;
    } catch {
        return false;
    }
}

export default chromaClient;
