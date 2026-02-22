// Native fetch is available in Node 18+

const API_URL = 'http://localhost:3000/api/chat';

async function testChat(message, history = []) {
    console.log(`\n💬 Testing Chat: "${message}"`);
    console.log(`   History length: ${history.length}`);

    try {
        const start = Date.now();
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history })
        });

        const data = await response.json();
        const latency = Date.now() - start;

        if (!response.ok) {
            console.error(`❌ Error ${response.status}:`, data);
            return;
        }

        console.log(`✅ Response (${latency}ms):`);
        console.log(`   AI: ${data.response.substring(0, 100)}...`); // Truncate login

        if (data.sources && data.sources.length > 0) {
            console.log(`   📚 Sources used: ${data.sources.length}`);
            data.sources.forEach(s => console.log(`      - ${s.id} (${s.score.toFixed(2)})`));
        } else {
            console.log(`   ⚠️ No sources used (Generative only)`);
        }

        return data.response;

    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

// Scenario: 
// 1. Ask about registration (should use RAG)
// 2. Follow up (should use history + context?)
async function run() {
    // Check if server is running
    try {
        await fetch('http://localhost:3000/health');
    } catch {
        console.error("❌ Server not running! Please run 'npm run dev' first.");
        return;
    }

    const answer1 = await testChat("Apa syarat daftar ulang SNBT?");

    // Test follow up with history
    if (answer1) {
        const history = [
            { role: 'user', parts: [{ text: "Apa syarat daftar ulang SNBT?" }] },
            { role: 'model', parts: [{ text: answer1 }] }
        ];

        await testChat("Berapa biaya UKT-nya?", history);
    }
}

run();
