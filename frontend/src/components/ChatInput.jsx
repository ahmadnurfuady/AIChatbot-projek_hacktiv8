import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const ChatInput = ({ onSend, loading, disabled }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    }, [message]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || loading || disabled) return;

        onSend(message);
        setMessage('');

        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 w-full">
            <div className="flex-grow bg-gray-50 border border-gray-100 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all duration-200">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading || disabled}
                    placeholder="Tulis pesan Anda..."
                    rows={1}
                    className="w-full py-3 px-4 bg-transparent outline-none resize-none text-[14px] text-gray-700 placeholder-gray-400 min-h-[44px] max-h-[100px] scrollbar-hide rounded-2xl"
                />
            </div>

            <button
                type="submit"
                disabled={!message.trim() || loading || disabled}
                className={clsx(
                    "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                    (!message.trim() || loading || disabled)
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                        : "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-200 transform active:scale-90"
                )}
            >
                {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Send size={18} className="ml-0.5" />
                )}
            </button>
        </form>
    );
};

export default ChatInput;
