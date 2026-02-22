
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load env
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

// Logging helpers
function log(msg) {
    console.log(msg);
    try { fs.appendFileSync('debug_error.log', `INFO: ${msg}\n`); } catch { }
}

function logError(msg) {
    console.error(msg);
    try { fs.appendFileSync('debug_error.log', `ERROR: ${msg}\n`); } catch { }
}

async function main() {
    log(`--- STARTED DEBUG AT ${new Date().toISOString()} ---`);

    // 1. Check Env
    if (!process.env.GEMINI_API_KEY) {
        logError("GEMINI_API_KEY is missing in .env");
        return;
    }
    if (process.env.GEMINI_API_KEY.startsWith('ISI_')) {
        logError("GEMINI_API_KEY is placeholder (ISI_API_KEY...). Update .env!");
        return;
    }
    log(`API Key loaded (prefix: ${process.env.GEMINI_API_KEY.substring(0, 8)}...)`);

    // 2. Raw HTTP Check (Crucial for 404 diagnosis)
    log("2. Testing Raw HTTP Connectivity to Gemini API...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const resp = await fetch(url);

        if (!resp.ok) {
            logError(`Raw Fetch Failed: ${resp.status} ${resp.statusText}`);
            const body = await resp.text();
            logError(`Response Body: ${body}`);
            // If this fails, SDK will definitely fail
        } else {
            const data = await resp.json();
            const models = data.models?.map(m => m.name) || [];
            log(`✅ Raw Fetch Success. Found ${models.length} models.`);
            log(`Available models: ${models.join(', ')}`);

            const hasFlash = models.some(m => m.includes('gemini-1.5-flash'));
            const hasEmbed = models.some(m => m.includes('text-embedding-004'));
            log(`- gemini-1.5-flash available? ${hasFlash}`);
            log(`- text-embedding-004 available? ${hasEmbed}`);
        }
    } catch (e) {
        logError(`Raw Fetch Exception: ${e.message}`);
    }

    // 3. SDK Check - Generation
    log("3. Testing SDK Generation (gemini-2.0-flash)...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello check");
        log(`✅ SDK Generation Success: ${result.response.text()}`);
    } catch (e) {
        logError(`SDK Generation Failed: ${e.message}`);
        if (e.response) {
            try { logError(`Detailed Response: ${await e.response.text()}`); } catch { }
        }
    }

    // 4. SDK Check - Embedding
    log("4. Testing SDK Embedding (gemini-embedding-001)...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent({
            content: { parts: [{ text: "test" }] },
            taskType: 'RETRIEVAL_DOCUMENT'
        });
        log(`✅ SDK Embedding Success. Vector length: ${result.embedding.values.length}`);
    } catch (e) {
        logError(`SDK Embedding Failed: ${e.message}`);
        if (e.response) {
            try { logError(`Detailed Response: ${await e.response.text()}`); } catch { }
        }
    }

    log("--- FINISHED DEBUG ---");
}

main().catch(err => logError(`Fatal Error: ${err.message}`));
