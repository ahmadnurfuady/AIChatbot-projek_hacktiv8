
import express from 'express';
import { chatSchema } from '../schemas/chat.schema.js';
import { validate } from '../middleware/validate.js';
import { chatLimiter } from '../middleware/rateLimit.js';
import { retrieveContext } from '../services/rag.service.js';
import { generateChatResponse } from '../services/llm.service.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/chat
 * Endpoint utama chatbot.
 * Flow: Validate -> Rate Limit -> Retrieve Context -> Generate AI Response
 */
// router.post('/chat', chatLimiter, validate(chatSchema), async (req, res, next) => {
router.post('/chat', validate(chatSchema), async (req, res, next) => { // Rate limit disabled, validate enabled
    try {
        const { message, history } = req.body;
        const start = Date.now();
        console.log(`[DEBUG] Received chat request: "${message}", history len: ${history?.length}`);

        // 1. Retrieve Context (RAG)
        logger.info(`Processing chat: "${message}"`);
        let context = '';
        let sources = [];

        try {
            console.log('[DEBUG] Calling retrieveContext...');
            const retrievalResult = await retrieveContext(message);
            console.log('[DEBUG] retrieveContext result:', JSON.stringify(retrievalResult, null, 2));

            if (retrievalResult) {
                context = retrievalResult.context || '';
                sources = retrievalResult.sources || [];
            }
        } catch (ragError) {
            console.error('[DEBUG] RAG Error:', ragError);
            logger.error('RAG Retrieval failed but continuing', { error: ragError.message });
        }

        // 2. Generate AI Response
        console.log('[DEBUG] Calling generateChatResponse...');
        const aiResponse = await generateChatResponse(message, history, context);
        console.log('[DEBUG] AI Response received length:', aiResponse.length);

        // 3. Return JSON
        const safeSources = Array.isArray(sources) ? sources : [];
        const formattedSources = safeSources.map(s => ({
            id: s?.id || 'unknown',
            score: s?.score || 0
        }));

        res.json({
            response: aiResponse,
            sources: formattedSources,
            latency_ms: Date.now() - start
        });

        logger.info('Chat response sent', {
            messageLength: message.length,
            responseLength: aiResponse.length,
            sourcesCount: formattedSources.length
        });

    } catch (error) {
        console.error('[DEBUG] General Catch:', error);
        logger.error('Chat endpoint error', { error: error.message });
        next(error); // Pass to global error handler
    }
});

export default router;
