import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Sesuaikan dengan port backend
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Mengirim pesan ke chatbot.
 * @param {string} message - Pesan user
 * @param {Array} history - Riwayat chat
 * @returns {Promise<Object>} - Response dari API { response, sources, latency_ms }
 */
export const sendMessage = async (message, history = []) => {
    try {
        const response = await api.post('/chat', { message, history });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export default api;
