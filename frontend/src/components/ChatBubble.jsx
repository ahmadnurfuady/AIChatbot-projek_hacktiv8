import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import clsx from 'clsx';

const ChatBubble = ({ message, role, sources }) => {
    const isUser = role === 'user';
    const [showSources, setShowSources] = useState(false);

    return (
        <div className={clsx(
            "flex w-full mb-4 animate-fade-in",
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={clsx(
                "flex max-w-[85%] md:max-w-[80%] gap-3",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar */}
                <div className={clsx(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                    isUser ? "bg-primary-600 text-white" : "bg-white border border-gray-100 text-primary-600"
                )}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Message Content */}
                <div className="flex flex-col gap-1">
                    <div className={clsx(
                        "p-3.5 px-4 rounded-2xl text-[14px] md:text-[15px] leading-relaxed shadow-sm",
                        isUser
                            ? "bg-primary-600 text-white rounded-tr-none shadow-primary-100"
                            : "bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-gray-50"
                    )}>
                        {isUser ? (
                            <p className="whitespace-pre-wrap">{message}</p>
                        ) : (
                            <div className="prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-primary-700">
                                <ReactMarkdown>{message}</ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Sources Section (Only for AI) */}
                    {!isUser && sources && sources.length > 0 && (
                        <div className="mt-1">
                            <button
                                onClick={() => setShowSources(!showSources)}
                                className="flex items-center text-[10px] uppercase tracking-wider font-bold text-gray-400 hover:text-primary-600 transition-colors px-1"
                            >
                                <FileText size={12} className="mr-1" />
                                {sources.length} SOURCES
                                {showSources ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />}
                            </button>

                            {showSources && (
                                <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                                    {sources.map((source, idx) => (
                                        <div key={idx} className="bg-white/80 border border-gray-100 p-2 rounded-xl text-[11px] text-gray-600 flex justify-between items-center hover:border-primary-200 transition-all cursor-default">
                                            <span className="truncate max-w-[180px] font-medium" title={source.id}>
                                                {source.id.split('_chunk')[0]}
                                            </span>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded-full font-bold">
                                                {(source.score * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;
