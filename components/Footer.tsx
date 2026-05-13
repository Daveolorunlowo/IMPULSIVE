'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useAuth } from '@/store/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Activity, Clock } from 'lucide-react';

export default function Footer() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const { getAllUsers } = useAuth();
  const users = getAllUsers();

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === '1029') {
      setIsAdminAuthenticated(true);
    } else {
      setAdminPasscode('');
    }
  };


  return (
    <footer className="pt-40 pb-20 bg-charcoal text-alabaster overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 items-start mb-40">
          
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-8">
            <Link href="/" className="inline-block">
              <Logo 
                variant="light" 
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm text-alabaster/40 font-light leading-relaxed">
              Redefining modern elegance through curated collections and technical precision.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred">Navigation</h4>
            <div className="flex flex-col gap-4 text-sm font-light text-alabaster/60">
              <Link href="/shop" className="hover:text-bloodred transition-colors">The Collection</Link>
              <Link href="/lookbook" className="hover:text-bloodred transition-colors">Archive</Link>
              <Link href="/philosophy" className="hover:text-bloodred transition-colors">Our Story</Link>
              <Link href="/contact" className="hover:text-bloodred transition-colors">Contact</Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred">Client Services</h4>
            <div className="flex flex-col gap-4 text-sm font-light text-alabaster/60">
              <Link href="#" className="hover:text-bloodred transition-colors">Shipping & Returns</Link>
              <Link href="#" className="hover:text-bloodred transition-colors">Size Guide</Link>
              <Link href="#" className="hover:text-bloodred transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-bloodred transition-colors">Terms of Use</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-8 lg:col-span-1">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred">Newsletter</h4>
            <p className="text-xs text-alabaster/40 font-light">Join our circle for exclusive updates.</p>
            <div className="flex items-center border-b border-alabaster/20 pb-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-transparent text-sm w-full outline-none placeholder:text-alabaster/10"
              />
              <button className="text-[10px] uppercase tracking-widest font-semibold text-bloodred hover:text-alabaster transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-alabaster/5 flex flex-col md:flex-row justify-between items-center gap-8 relative">
          <div className="text-[10px] uppercase tracking-[0.3em] text-alabaster/20 font-semibold">
            © 2026 Impulsive Studio. All Rights Reserved.
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] text-alabaster/40 font-semibold">
            <Link href="https://wa.me/2349018389254" target="_blank" rel="noopener noreferrer" className="hover:text-bloodred transition-colors">WhatsApp</Link>
            <Link href="https://www.instagram.com/wearimpulsive_/" target="_blank" rel="noopener noreferrer" className="hover:text-bloodred transition-colors">Instagram</Link>
            <Link href="https://www.tiktok.com/@wearimpulsive_" target="_blank" rel="noopener noreferrer" className="hover:text-bloodred transition-colors">TikTok</Link>
          </div>

          {/* Admin Dot */}
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="absolute -bottom-10 right-0 w-2 h-2 bg-bloodred/20 hover:bg-bloodred rounded-full transition-all cursor-pointer"
            title="System Diagnostics"
          />
        </div>
      </div>

      {/* Admin Activity Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-stone/20 border border-stone/30 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-stone/30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-bloodred flex items-center justify-center">
                    <Activity size={20} className="text-alabaster" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-alabaster">System Diagnostics</h2>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-stone font-bold">Real-time user activities</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsAdminOpen(false);
                    setIsAdminAuthenticated(false);
                    setAdminPasscode('');
                  }} 
                  className="p-2 hover:text-bloodred transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex flex-col">
                {!isAdminAuthenticated ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div className="text-center">
                      <h3 className="text-xl font-serif text-alabaster mb-2">Access Restricted</h3>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-stone font-bold">Authorization required to view node data</p>
                    </div>
                    <form onSubmit={handlePasscodeSubmit} className="w-full max-w-xs space-y-4">
                      <input 
                        type="password"
                        autoFocus
                        placeholder="ENTER ACCESS KEY"
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                        className="w-full bg-stone/20 border border-stone/30 focus:border-bloodred text-alabaster px-6 py-4 outline-none transition-all text-xs uppercase tracking-widest text-center placeholder:text-stone/50"
                      />
                      <button 
                        type="submit"
                        className="w-full bg-bloodred text-alabaster py-4 text-[8px] uppercase tracking-[0.4em] font-bold hover:bg-white hover:text-charcoal transition-all"
                      >
                        Authorize
                      </button>
                    </form>
                  </div>
                ) : users.length === 0 ? (
                  <div className="h-60 flex flex-col items-center justify-center text-stone italic">
                    <User size={40} className="mb-4 opacity-20" />
                    <p>No active session data found.</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {users.map((user, i) => (
                      <div key={i} className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-stone/10 pb-4">
                          <div className="w-2 h-2 rounded-full bg-bloodred" />
                          <span className="text-xs uppercase tracking-widest font-bold text-alabaster">{user.email}</span>
                          <span className="text-[10px] uppercase tracking-widest text-stone ml-auto">Verified User</span>
                        </div>
                        
                        <div className="grid gap-4">
                          {user.activity.slice().reverse().map((act, j) => (
                            <div key={j} className="flex items-center gap-6 bg-stone/5 p-4 group hover:bg-stone/10 transition-all">
                              <div className="w-8 h-8 rounded-full border border-stone/20 flex items-center justify-center text-stone group-hover:text-bloodred transition-colors">
                                <Clock size={12} />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-widest text-alabaster/80">{act.action}</p>
                              </div>
                              <span className="text-[8px] uppercase tracking-widest text-stone">
                                {new Date(act.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 bg-stone/10 border-t border-stone/30 flex justify-between items-center">
                <span className="text-[8px] uppercase tracking-[0.4em] text-stone">End-to-End Encryption Active</span>
                <span className="text-[8px] uppercase tracking-[0.4em] text-stone">Node: {users.length} Sessions Detected</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
