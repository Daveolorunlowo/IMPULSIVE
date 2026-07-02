'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Shirt, Scissors } from 'lucide-react';
import { useAuth } from '@/store/useAuth';

interface Message {
  id: string;
  sender: 'stylist' | 'user';
  text: string;
  timestamp: Date;
}

const PRESETS = [
  { label: 'Suggest a styling combination', query: 'Can you suggest a styling combination for the collection?' },
  { label: 'How does the heavy cotton drape?', query: 'How does the 450GSM heavy cotton drape and fit?' },
  { label: 'Studio Print Customization details', query: 'How does the Print Studio customization work?' },
];

export default function CustomerServiceChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { trackActivity } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'stylist',
        text: 'Welcome to IMPULSIVE Customer Service. I am your personal design and fitting advisor. How can I assist you with custom print canvases, fits, or styling combinations today?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    trackActivity(`Consulted customer service with: "${text.slice(0, 30)}..."`);

    // Simulate customer service response
    setTimeout(() => {
      let responseText = "Our customer service team is reviewing your profile. For immediate fit assistance, we suggest using our Fit Advisor on the product detail sizing hub.";
      
      const query = text.toLowerCase();
      if (query.includes('style') || query.includes('combination') || query.includes('pair')) {
        responseText = "For an elevated minimalist look, we recommend layering the Crimson Distressed Tee underneath the Charcoal Cropped Hoodie. The contrast of the rich crimson hem below the raw boxy crop of the hoodie defines our signature proportion play.";
      } else if (query.includes('cotton') || query.includes('heavy') || query.includes('drape') || query.includes('gsm')) {
        responseText = "Our garments are engineered from 450GSM heavy loopback cotton. It provides a structured, sculptural drape that holds its shape, emphasizing a dropped-shoulder silhouette without clinging. It is pre-shrunk for archival durability.";
      } else if (query.includes('custom') || query.includes('print') || query.includes('studio') || query.includes('customize')) {
        responseText = "The Studio Print Customizer allows you to overlay a high-density screen-printed label (up to 15 characters) directly on the chest of your garment. It adds a customized industrial design element. Personalizations require 2 additional business days for studio finish.";
      } else if (query.includes('size') || query.includes('fit') || query.includes('measurement')) {
        responseText = "Our sizing is intended to be oversized. If you prefer a traditional standard fit, we recommend selecting one size down. You can input your height and weight into the Fit Advisor tool on the sizing guide for an automated recommendation.";
      }

      const stylistMsg: Message = {
        id: `stylist-${Date.now()}`,
        sender: 'stylist',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, stylistMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-8 right-8 z-[190] flex flex-col items-end gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-charcoal border border-bloodred/40 text-alabaster flex items-center justify-center shadow-lg hover:border-bloodred transition-all duration-300 relative group"
          title="Stylist Chat"
        >
          <div className="absolute inset-0 bg-bloodred/5 scale-0 group-hover:scale-100 transition-transform duration-300" />
          <MessageSquare size={20} className="text-bloodred group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Chat Box Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-8 z-[190] w-full max-w-[400px] h-[550px] bg-[#0E0E0E] border border-bloodred/25 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-sm"
          >
            {/* Header */}
            <div className="p-6 border-b border-bloodred/20 flex justify-between items-center bg-[#070707]">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-bloodred animate-pulse" />
                <div>
                  <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-alabaster">
                    IMPULSIVE CUSTOMER SERVICE
                  </h3>
                  <span className="text-[8px] uppercase tracking-widest text-stone font-bold">
                    PERSONAL STYLE & FIT HUB
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone hover:text-alabaster transition-colors"
                aria-label="Close customer service chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-[7px] uppercase tracking-widest text-stone font-bold mb-1">
                    {msg.sender === 'user' ? 'CLIENT' : 'CUSTOMER SERVICE'} ·{' '}
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div
                    className={`p-4 text-xs leading-relaxed font-light ${
                      msg.sender === 'user'
                        ? 'bg-bloodred text-alabaster border border-bloodred/20'
                        : 'bg-[#141414] text-alabaster/80 border border-white/5'
                    } rounded-sm`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex flex-col items-start mr-auto max-w-[85%]">
                  <span className="text-[7px] uppercase tracking-widest text-stone font-bold mb-1">
                    CUSTOMER SERVICE TYPING
                  </span>
                  <div className="bg-[#141414] p-4 text-xs text-stone border border-white/5 rounded-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Presets / Prompts shortcuts */}
            {messages.length === 1 && !isTyping && (
              <div className="px-6 pb-2 space-y-2">
                <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-2">
                  SUGGESTED ENQUIRIES
                </span>
                {PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(preset.query)}
                    className="w-full text-left bg-charcoal hover:bg-stone/10 border border-white/5 p-3 text-[10px] text-alabaster/60 hover:text-alabaster transition-all rounded-sm block"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            {/* Footer Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="p-6 border-t border-bloodred/20 bg-[#070707] flex gap-3"
            >
              <input
                type="text"
                placeholder="Ask about styling or fit..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#111111] border border-white/10 text-alabaster placeholder:text-stone/30 px-4 py-3 outline-none focus:border-bloodred transition-colors text-[10px] font-semibold"
              />
              <button
                type="submit"
                className="w-12 h-12 bg-bloodred hover:bg-white text-alabaster hover:text-charcoal transition-all duration-300 flex items-center justify-center border border-bloodred/25"
                aria-label="Send query"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
