/**
 * rateLimit.js
 * Rate limiting middleware — 10 request per menit per IP.
 * Aturan #2: Wajib ada di setiap endpoint.
 *
 * Fix: gunakan keyGenerator custom agar kompatibel dengan Express 5
 * (req.ip bisa undefined di Express 5 tanpa trust proxy setting)
 */

import rateLimit from 'express-rate-limit';
import env from '../config/env.config.js';
import logger from '../utils/logger.js';

/**
 * Helper: ambil IP dari request secara aman (kompatibel Express 5).
 * @param {import('express').Request} req
 * @returns {string}
 */
function getClientIp(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown'
    );
}

/**
 * Rate limiter umum untuk semua route.
 * Max 10 request per menit per IP.
 */
export const generalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS, // 60 detik
    max: env.RATE_LIMIT_MAX,            // 10 request
    standardHeaders: true,
    legacyHeaders: false,

    // Fix untuk Express 5: gunakan keyGenerator custom
    keyGenerator: (req) => getClientIp(req),

    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: getClientIp(req),
            path: req.path,
            userAgent: req.get('User-Agent'),
        });

        res.status(429).json({
            error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.',
            retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
        });
    },
});

/**
 * Rate limiter lebih ketat untuk endpoint chat (5 req/menit).
 * Chat endpoint lebih berat karena memanggil LLM.
 */
export const chatLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => getClientIp(req),

    handler: (req, res) => {
        logger.warn('Chat rate limit exceeded', {
            ip: getClientIp(req),
            userAgent: req.get('User-Agent'),
        });

        res.status(429).json({
            error: 'Terlalu banyak pertanyaan. Tunggu sebentar sebelum bertanya lagi.',
            retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
        });
    },
});
