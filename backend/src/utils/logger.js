/**
 * logger.js
 * Winston logger terpusat. Semua log harus melalui ini — jangan pakai console.log di production.
 * Format: [timestamp] [level] message {metadata}
 */

import winston from 'winston';
import env from '../config/env.config.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Format log yang mudah dibaca manusia
const logFormat = printf(({ level, message, timestamp, requestId, ...meta }) => {
    const reqId = requestId ? ` [${requestId}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp}${reqId} [${level}]: ${message}${metaStr}`;
});

const logger = winston.createLogger({
    level: env.LOG_LEVEL,
    format: combine(
        errors({ stack: true }), // log stack trace untuk Error objects
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Console transport — selalu aktif
        new winston.transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'HH:mm:ss' }),
                logFormat
            ),
        }),
    ],
});

// Di production, tambah file transport
if (env.NODE_ENV === 'production') {
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        })
    );
    logger.add(
        new winston.transports.File({
            filename: 'logs/combined.log',
        })
    );
}

export default logger;
