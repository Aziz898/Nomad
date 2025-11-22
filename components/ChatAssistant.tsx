
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Check, X } from 'lucide-react';
import { ChatMessage, Flight, Hotel, Activity } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onSendMessage: (msg: string) => Promise<void>;
  messages: ChatMessage[];
  isTyping: boolean;
  onAcceptSuggestion: (type: 'flight' | 'hotel' | 'activity', item: any) => void;
}

export const ChatAssistant: React.FC<Props> = ({ onSendMessage, messages, isTyping, onAcceptSuggestion }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const txt = input;
    setInput('');
    await onSendMessage(txt);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-brand-500 text-white flex items-center gap-2">
        <Sparkles size={18} />
        <h3 className="font-bold text-sm">AI Travel Assistant</h3>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-4">
            Ask me to change your hotel, find a different flight, or add specific activities!
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
              msg.role === 'user' 
                ? 'bg-gray-900 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
            }`}>
              <p>{msg.text}</p>
              
              {/* Suggestion Card */}
              {msg.suggestedItem && (
                <div className="mt-3 p-3 bg-brand-50 rounded-lg border border-brand-100">
                  <div className="text-xs font-bold text-brand-700 uppercase mb-1">
                    Suggestion: {msg.suggestedItem.type === 'hotel' ? 'New Hotel' : msg.suggestedItem.type === 'flight' ? 'New Flight' : 'Activity'}
                  </div>
                  <div className="font-bold text-gray-900">
                    {'name' in msg.suggestedItem.data ? msg.suggestedItem.data.name : msg.suggestedItem.data.airline}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {'price' in msg.suggestedItem.data ? `$${msg.suggestedItem.data.price}` : ''} 
                    {'totalPrice' in msg.suggestedItem.data ? `$${msg.suggestedItem.data.totalPrice}` : ''}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => onAcceptSuggestion(msg.suggestedItem!.type, msg.suggestedItem!.data)}
                      className="flex-1 bg-brand-500 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-brand-600"
                    >
                      <Check size={12} /> Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-xl rounded-tl-none shadow-sm">
              <Loader2 size={16} className="animate-spin text-brand-500" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          placeholder="Type a request..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
