/**
 * server.js
 * Entry point utama backend chatbot PENS.
 * Semua middleware dipasang di sini dengan urutan yang benar.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';

import env from './src/config/env.config.js';
import logger from './src/utils/logger.js';
import { generalLimiter } from './src/middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';

// Import routes
import healthRouter from './src/routes/health.route.js';
import chatRouter from './src/routes/chat.route.js';

const app = express();

// ============================================================
// MIDDLEWARE STACK (urutan penting!)
// ============================================================

// 1. Helmet — set security headers (XSS protection, HSTS, dll)
app.use(helmet());

// 2. CORS — hanya izinkan origin yang ada di whitelist (Aturan #4)
app.use(
    cors({
        origin: (origin, callback) => {
            // Izinkan request tanpa origin (Postman, curl) hanya di development
            if (!origin && env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            if (env.ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }
            logger.warn('CORS blocked request', { origin });
            callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS policy.`));
        },
        credentials: true,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// 3. Rate limiting global (Aturan #2)
// app.use(generalLimiter);

// 4. Parse JSON body
app.use(express.json({ limit: '10kb' })); // Batasi ukuran body
app.use((req, res, next) => {
    console.log(`[DEBUG GLOBAL] Path: ${req.path}, Body type: ${typeof req.body}, Body keys: ${req.body ? Object.keys(req.body) : 'null'}`);
    next();
});

// 5. Request ID + logging setiap request (Aturan #19)
app.use((req, res, next) => {
    req.requestId = uuidv4().substring(0, 8); // ID pendek untuk tracking
    const startTime = Date.now();

    res.on('finish', () => {
        logger.info('Request completed', {
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            responseTime: `${Date.now() - startTime}ms`,
            ip: req.ip,
        });
    });

    next();
});

// ============================================================
// ROUTES
// ============================================================

app.use('/health', healthRouter);
app.use('/api', chatRouter);

// Placeholder untuk route chat (akan dibuat Hari 3)
app.get('/', (req, res) => {
    res.json({
        message: 'PENS Chatbot API',
        version: '1.0.0',
        docs: '/health',
    });
});

// ============================================================
// ERROR HANDLERS (harus di paling bawah)
// ============================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

app.listen(env.PORT, () => {
    logger.info(`🚀 PENS Chatbot server running`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        allowedOrigins: env.ALLOWED_ORIGINS,
    });
});

export default app;
