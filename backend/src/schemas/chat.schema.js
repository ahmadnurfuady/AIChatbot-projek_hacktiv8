
import { z } from 'zod';

export const chatSchema = z.object({
    message: z.string().min(1, 'Pesan tidak boleh kosong').max(500, 'Pesan terlalu panjang (maks 500 karakter)'),
    history: z.array(z.object({
        role: z.enum(['user', 'model', 'assistant']),
        parts: z.array(z.object({ text: z.string() })).optional(),
        message: z.string().optional() // Support alternate format
    })).optional().default([]),
});
