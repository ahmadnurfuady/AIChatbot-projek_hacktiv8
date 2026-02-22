import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send, Paperclip, Smile, MoreVertical, ChevronDown } from 'lucide-react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

const FloatingChat = ({ messages, loading, onSend, isOpen, setIsOpen }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    return (
        <>
            {/* Toggle Button - Only shown when closed */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl bg-primary-600 text-white shadow-primary-300 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 animate-fade-in"
                >
                    <MessageSquare size={32} />
                </button>
            )}

            {/* Chat Window */}
            <div className={`fixed top-24 bottom-6 right-6 z-50 w-[90vw] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-500 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-20 pointer-events-none'
                }`}>
                {/* Header - Compact & Professional */}
                <div className="p-4 bg-gradient-to-br from-primary-600 to-primary-400 rounded-t-3xl text-white relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
                                    alt="Assistant"
                                    className="w-10 h-10 rounded-full border-2 border-white/50 bg-white"
                                />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold leading-tight">PENS Assistant</h3>
                                <p className="text-[10px] text-white/80 font-medium">Aktif Sekarang • Balas Cepat</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                <MoreVertical size={18} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                <ChevronDown size={22} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/50">
                    {messages.map((msg, index) => (
                        <ChatBubble
                            key={index}
                            message={msg.message}
                            role={msg.role}
                            sources={msg.sources}
                        />
                    ))}

                    {loading && (
                        <div className="flex justify-start items-center gap-2 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                            <div className="bg-gray-100 h-10 w-24 rounded-2xl rounded-tl-none"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer / Input */}
                <div className="p-4 bg-white border-t border-gray-100 rounded-b-3xl flex-shrink-0">
                    <ChatInput onSend={onSend} loading={loading} />

                    <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400 font-medium px-1">
                        <div className="flex items-center gap-3">
                            <Smile size={14} className="cursor-pointer hover:text-gray-600" />
                            <Paperclip size={14} className="cursor-pointer hover:text-gray-600" />
                        </div>
                        <div className="flex items-center gap-1 opacity-60 uppercase tracking-tighter">
                            <span>POWERED BY</span>
                            <span className="font-bold text-primary-600">CHATNEX</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FloatingChat;
