/**
 * sanitize.js
 * Sanitasi input user sebelum diproses LLM.
 * Mencegah prompt injection dan karakter berbahaya.
 */

/**
 * Daftar pola berbahaya yang harus distrip dari input user.
 * Ini adalah lapisan pertahanan pertama sebelum Zod validation.
 */
const DANGEROUS_PATTERNS = [
    // Prompt injection attempts
    /ignore\s+(all\s+)?previous\s+instructions?/gi,
    /forget\s+(all\s+)?previous\s+instructions?/gi,
    /you\s+are\s+now\s+/gi,
    /act\s+as\s+(if\s+you\s+are\s+)?/gi,
    /pretend\s+(to\s+be|you\s+are)\s+/gi,
    /disregard\s+(all\s+)?previous/gi,
    /new\s+instructions?:/gi,
    /system\s*:/gi,
    /\[INST\]/gi,
    /<<SYS>>/gi,
    // HTML/Script injection
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<[^>]+>/g,
    // SQL injection patterns (precaution)
    /;\s*(DROP|DELETE|INSERT|UPDATE|SELECT)\s+/gi,
];

/**
 * Sanitasi string input dari user.
 * @param {string} input - Raw input dari user
 * @returns {string} - Input yang sudah dibersihkan
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';

    let sanitized = input;

    // Strip pola berbahaya
    for (const pattern of DANGEROUS_PATTERNS) {
        sanitized = sanitized.replace(pattern, '[REMOVED]');
    }

    // Trim whitespace berlebih
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Batasi panjang input maksimal 1000 karakter
    if (sanitized.length > 1000) {
        sanitized = sanitized.substring(0, 1000);
    }

    return sanitized;
}

/**
 * Cek apakah input mengandung pola berbahaya (tanpa memodifikasi).
 * @param {string} input
 * @returns {boolean}
 */
export function containsDangerousPattern(input) {
    if (typeof input !== 'string') return false;
    return DANGEROUS_PATTERNS.some((pattern) => pattern.test(input));
}
