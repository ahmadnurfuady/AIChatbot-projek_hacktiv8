/**
 * env.config.js
 * Validasi dan ekspor semua environment variable.
 * App akan crash saat startup jika ada variable wajib yang hilang —
 * lebih baik gagal cepat daripada error misterius di production.
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Validasi satu env variable. Throw error jika wajib tapi tidak ada.
 * @param {string} key - Nama env variable
 * @param {string} [defaultValue] - Nilai default jika tidak wajib
 * @returns {string}
 */
function requireEnv(key, defaultValue = undefined) {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined || value === '') {
    throw new Error(`[env.config] Missing required environment variable: ${key}`);
  }
  return value;
}

const env = {
  // Server
  PORT: parseInt(requireEnv('PORT', '3000'), 10),
  NODE_ENV: requireEnv('NODE_ENV', 'development'),

  // CORS — parse comma-separated string menjadi array
  ALLOWED_ORIGINS: requireEnv('ALLOWED_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim()),

  // Google Gemini
  // Google Gemini IDs (based on available models from API Key)
  GEMINI_API_KEY: requireEnv('GEMINI_API_KEY'),
  GEMINI_MODEL: requireEnv('GEMINI_MODEL', 'gemini-2.0-flash'),
  GEMINI_EMBED_MODEL: requireEnv('GEMINI_EMBED_MODEL', 'gemini-embedding-001'),

  // ChromaDB
  CHROMA_URL: requireEnv('CHROMA_URL', 'http://localhost:8000'),
  CHROMA_COLLECTION: requireEnv('CHROMA_COLLECTION', 'pens_docs'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(requireEnv('RATE_LIMIT_WINDOW_MS', '60000'), 10),
  RATE_LIMIT_MAX: parseInt(requireEnv('RATE_LIMIT_MAX', '10'), 10),

  // Cache
  CACHE_TTL_MS: parseInt(requireEnv('CACHE_TTL_MS', '3600000'), 10),

  // Logging
  LOG_LEVEL: requireEnv('LOG_LEVEL', 'info'),

  // Kontak fallback PENS
  PENS_CONTACT: requireEnv('PENS_CONTACT', 'https://www.pens.ac.id atau hubungi (031) 5947280'),
};

export default env;
