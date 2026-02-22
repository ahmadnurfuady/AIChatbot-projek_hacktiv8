/**
 * errorHandler.js
 * Global error handler — middleware terakhir di Express.
 * Aturan #20: Error tidak boleh expose stack trace ke user.
 */

import logger from '../utils/logger.js';
import env from '../config/env.config.js';

/**
 * Global error handling middleware.
 * Harus dipasang TERAKHIR di Express app (setelah semua route).
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, next) {
    // Log error lengkap secara internal (termasuk stack trace)
    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        requestId: req.requestId,
    });

    // Tentukan status code
    const statusCode = err.statusCode || err.status || 500;

    // Response ke user — TIDAK boleh expose stack trace
    const response = {
        error:
            statusCode >= 500
                ? 'Terjadi kesalahan pada server. Silakan coba lagi.'
                : err.message || 'Terjadi kesalahan.',
    };

    // Di development, tambah sedikit info untuk debugging (tapi tetap bukan full stack trace)
    if (env.NODE_ENV === 'development') {
        response.debug = err.message;
    }

    res.status(statusCode).json(response);
}

/**
 * Middleware untuk handle route yang tidak ditemukan (404).
 */
export function notFoundHandler(req, res) {
    logger.warn('Route not found', { path: req.path, method: req.method });
    res.status(404).json({ error: `Route ${req.method} ${req.path} tidak ditemukan.` });
}
