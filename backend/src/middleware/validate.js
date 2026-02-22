/**
 * validate.js
 * Zod validation middleware factory.
 * Aturan #3: Input validation wajib menggunakan Zod sebelum masuk ke LLM.
 */

import { ZodError } from 'zod';
import logger from '../utils/logger.js';

console.log('[DEBUG MODULE] validate.js loaded');

/**
 * Factory function yang membuat middleware validasi dari Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod schema untuk validasi
 * @param {'body' | 'query' | 'params'} [source='body'] - Bagian request yang divalidasi
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.post('/chat', validate(chatSchema), chatHandler);
 */
export function validate(schema, source = 'body') {
    return (req, res, next) => {
        try {
            console.log(`[DEBUG VALIDATE] Source: ${source}, Type: ${typeof req[source]}, Keys: ${req[source] ? Object.keys(req[source]) : 'undefined'}`);
            // Parse dan validasi — Zod juga melakukan type coercion jika diperlukan
            const parsed = schema.parse(req[source]);

            // Ganti request data dengan data yang sudah divalidasi (clean)
            req[source] = parsed;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Defensive check because broken Zod version might not have .errors
                const zodIssues = error.errors || error.issues || [];

                if (!zodIssues.length) {
                    logger.warn('ZodError caught but no errors found', { keys: Object.keys(error) });
                }

                const messages = zodIssues.map((e) => ({
                    field: e.path ? e.path.join('.') : 'unknown',
                    message: e.message || 'Invalid input',
                }));

                logger.warn('Validation failed', { errors: messages, source });

                return res.status(400).json({
                    error: 'Input tidak valid.',
                    details: messages,
                });
            }

            // Error tidak terduga — teruskan ke errorHandler
            next(error);
        }
    };
}
