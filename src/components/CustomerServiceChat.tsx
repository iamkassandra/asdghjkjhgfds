import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}

interface CustomerServiceChatProps {
  onAddToCart: (productId: string) => void;
}

export default function CustomerServiceChat({ onAddToCart }: CustomerServiceChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: "Welcome to Aetheria Ops, seeker. I am Aetheria, your automated conversion and orchestration counselor. Looking to automate your browser pipelines, build real-time webhook social dispatchers, or run automated metrics? Tell me what you're building, and I will recommend the perfect automation blueprint or issue you a direct discount coupon!",
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: inputMessage,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    const promptToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Proxying conversation memory as a sequence of dialogue roles
      const response = await fetch('/api/gemini/sales-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptToSend,
          history: messages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error(" concierge is refreshing operations. Please try again.");
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        text: data.text || "I apologize, my system neural path is focusing. How else may I direct your business scaling?",
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      setError(err.message || "Network timeout.");
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: 'model',
          text: "My neural link experienced a high-traffic routing delay. Feel free to use checkout directly, or enter coupon 'AETHER10' to receive 10% off of any purchase!",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectShortcut = (text: string) => {
    setInputMessage(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="chat-trigger-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 bg-blue-600 text-white rounded-sm p-4 md:px-5 md:py-3 shadow-lg hover:bg-blue-700 transition-all border border-blue-500 max-w-xs cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden md:inline font-sans font-semibold text-xs tracking-wider uppercase">Ask Aetheria Assistant</span>
            <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="customer-service-chat-card"
            initial={{ opacity: 0, y: 100, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-[92vw] sm:w-[380px] h-[520px] bg-white rounded-sm border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs tracking-wider uppercase text-white">Aetheria AI</h3>
                  <p className="font-mono text-[9px] text-blue-400 tracking-wider">CONVERSION ADVISOR</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
                id="close-chat-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto fancy-scrollbar space-y-4 bg-slate-50/80">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-sm px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className="block text-[8px] text-slate-400 mt-1.5 text-right font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-sm rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-1.5 text-rose-600 text-[10px] py-1 bg-rose-50 px-3 rounded-sm border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Neural routing delay; coupon active.</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
              <button
                onClick={() => selectShortcut("Which blueprint automates LinkedIn/prospects?")}
                className="text-[10px] bg-white hover:bg-slate-55 text-slate-700 rounded-sm px-2.5 py-1 border border-slate-200 cursor-pointer transition font-mono"
              >
                LinkedIn Prospector
              </button>
              <button
                onClick={() => selectShortcut("Can I have a discounts coupon?")}
                className="text-[10px] bg-white hover:bg-slate-55 text-slate-700 rounded-sm px-2.5 py-1 border border-slate-200 cursor-pointer transition font-mono"
              >
                Claim Coupon
              </button>
              <button
                onClick={() => selectShortcut("How do I download files after payment?")}
                className="text-[10px] bg-white hover:bg-slate-55 text-slate-700 rounded-sm px-2.5 py-1 border border-slate-200 cursor-pointer transition font-mono"
              >
                Downloads Info
              </button>
            </div>

            {/* Active Checkout Trigger inside Chat (Conversion) */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span className="flex items-center gap-1 text-[11px]">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                Bundle discounts apply!
              </span>
              <button
                onClick={() => onAddToCart("asset_prospector")}
                className="text-blue-600 hover:text-blue-700 font-bold uppercase text-[10px] hover:underline cursor-pointer tracking-wider"
              >
                Add Best Seller +
              </button>
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                id="chat-input-field"
                type="text"
                placeholder="Message Aetheria..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-sm px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                id="submit-chat-btn"
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-slate-900 text-white p-2 rounded-sm hover:bg-blue-600 disabled:opacity-40 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
