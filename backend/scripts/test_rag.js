
import { retrieveContext, getDocumentCount } from '../src/services/rag.service.js';
import { getCollection, pingChroma } from '../src/config/chroma.config.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const query = process.argv[2] || "Apa syarat daftar ulang?";

console.log('🔄 Checking connection...');
try {
    const isAlive = await pingChroma();
    console.log(`📡 ChromaDB Alive: ${isAlive}`);

    if (isAlive) {
        const count = await getDocumentCount();
        console.log(`📄 Total Documents in Collection: ${count}`);

        if (count === 0) {
            console.warn('⚠️  Collection kosong! Ingest mungkin gagal.');
        }
    }
} catch (e) {
    console.error('❌ Chroma check failed:', e.message);
}

console.log(`\n🔎 Query: "${query}"`);

try {
    const res = await retrieveContext(query);
    if (!res.context) {
        console.log("❌ Tidak ada context ditemukan.");
    } else {
        console.log("✅ Context ditemukan:\n");
        console.log(res.context);
        console.log("\n📚 Sources:");
        res.sources?.forEach(s => console.log(`- Score: ${s.score.toFixed(3)} | ID: ${s.id}`));
    }
} catch (err) {
    console.error("❌ Error retrieval:", err);
}
