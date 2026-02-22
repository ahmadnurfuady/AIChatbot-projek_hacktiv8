/**
 * health.route.js
 * GET /health — return status semua dependencies.
 * Aturan #18: Health check endpoint wajib ada.
 */

import { Router } from 'express';
import env from '../config/env.config.js';
import { pingChroma } from '../config/chroma.config.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * Ping Gemini API untuk cek apakah service berjalan dan API key valid.
 * Menggunakan endpoint models list yang ringan — tidak generate token.
 * @returns {Promise<'ok' | 'error'>}
 */
async function checkGemini() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`,
            { signal: AbortSignal.timeout(5000) } // timeout 5 detik
        );
        // 200 = API key valid, 400/403 = key invalid
        return response.ok ? 'ok' : 'error';
    } catch {
        return 'error';
    }
}

/**
 * GET /health
 * Return status semua service dependencies.
 */
router.get('/', async (req, res) => {
    const startTime = Date.now();

    // Cek semua service secara paralel
    const [geminiOk, chromaOk] = await Promise.all([
        checkGemini(),
        pingChroma(),
    ]);


    const geminiStatus = geminiOk ? 'ok' : 'error';
    const chromaStatus = chromaOk ? 'ok' : 'error';
    const allHealthy = geminiOk && chromaOk;
    const statusCode = allHealthy ? 200 : 503;

    const healthData = {
        status: allHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${Date.now() - startTime}ms`,
        services: {
            gemini: geminiStatus,
            chromadb: chromaStatus,
            server: 'ok',
        },
        environment: env.NODE_ENV,
        model: env.GEMINI_MODEL,
    };

    logger.info('Health check', { status: healthData.status, services: healthData.services });

    res.status(statusCode).json(healthData);
});

export default router;

