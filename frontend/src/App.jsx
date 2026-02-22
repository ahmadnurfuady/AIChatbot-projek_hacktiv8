import { useState, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FloatingChat from './components/FloatingChat';
import { sendMessage } from './services/api';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      message: 'Halo! Ada yang bisa saya bantu seputar PENS? 🎓'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSend = async (text) => {
    const userMsg = { role: 'user', message: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }]
      }));

      const data = await sendMessage(text, history);

      const aiMsg = {
        role: 'model',
        message: data.response,
        sources: data.sources
      };
      setMessages([...newMessages, aiMsg]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = {
        role: 'model',
        message: '⚠️ Maaf, terjadi kesalahan koneksi atau server sedang sibuk. Silakan coba beberapa saat lagi.'
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden">
      <Navbar />

      <main>
        <Hero onOpenChat={() => setIsChatOpen(true)} />

        {/* Additional sections can be added here if needed */}
      </main>

      <FloatingChat
        messages={messages}
        loading={loading}
        onSend={handleSend}
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
      />

      {/* Footer (Simplified for now) */}
      <footer className="py-12 border-t border-gray-100 bg-gray-50/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2024 PENS Chatbot Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
