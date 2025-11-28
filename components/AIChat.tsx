import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { streamChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIChatProps {
    context: string;
}

export const AIChat: React.FC<AIChatProps> = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: 'Hello! I am the BMU AI Assistant. I have access to the current dashboard data. How can I help you?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        let accumulatedText = "";
        
        // Add a placeholder message for streaming
        const botMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', isTyping: true }]);

        await streamChatResponse(history, userMsg.text, context, (chunk) => {
            accumulatedText += chunk;
            setMessages(prev => prev.map(msg => 
                msg.id === botMsgId 
                ? { ...msg, text: accumulatedText, isTyping: false } 
                : msg
            ));
        });
        
        setIsTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 sm:w-96 h-[500px] flex flex-col mb-4 overflow-hidden animate-fade-in-up">
                    <div className="bg-ocean-700 text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <h3 className="font-semibold">BMU Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-ocean-600 p-1 rounded">
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-ocean-600 text-white rounded-br-none' 
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                }`}>
                                    <div className="whitespace-pre-wrap">{msg.text || (msg.isTyping && <Loader2 className="animate-spin w-4 h-4" />)}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about landings, members..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isTyping || !input.trim()}
                            className="bg-ocean-600 text-white p-2 rounded-full hover:bg-ocean-700 disabled:opacity-50 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-ocean-600 hover:bg-ocean-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
};
