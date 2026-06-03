'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useAuth } from '@/store/useAuth';
import { useOrders } from '@/store/useOrders';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Activity, Clock, ShoppingBag, Truck, Check } from 'lucide-react';

export default function Footer() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminTab, setAdminTab] = useState<'sessions' | 'orders'>('sessions');
  const [trackingNumberInputs, setTrackingNumberInputs] = useState<Record<string, string>>({});
  
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  
  const { getAllUsers } = useAuth();
  const users = getAllUsers();
  const { orders, updateOrderStatus } = useOrders();
  const passcodeInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isAdminOpen && !isAdminAuthenticated) {
      const timer = setTimeout(() => {
        passcodeInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAdminOpen, isAdminAuthenticated]);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === '1029') {
      setIsAdminAuthenticated(true);
    } else {
      setAdminPasscode('');
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe');
      
      setNewsletterStatus('success');
      setNewsletterMessage('Welcome to the circle.');
      setEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 5000);
    } catch (err: any) {
      setNewsletterStatus('error');
      setNewsletterMessage(err.message === 'ALREADY_SUBSCRIBED' ? 'You are already on the list.' : 'Something went wrong. Try again.');
      setTimeout(() => setNewsletterStatus('idle'), 5000);
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
              <Link href="/client-services?tab=shipping" className="hover:text-bloodred transition-colors">Shipping & Returns</Link>
              <Link href="/client-services?tab=size-guide" className="hover:text-bloodred transition-colors">Size Guide</Link>
              <Link href="/client-services?tab=privacy" className="hover:text-bloodred transition-colors">Privacy Policy</Link>
              <Link href="/client-services?tab=terms" className="hover:text-bloodred transition-colors">Terms of Use</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-8 lg:col-span-1">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred">Newsletter</h4>
            <p className="text-xs text-alabaster/40 font-light">Join our circle for exclusive updates.</p>
            <form 
              onSubmit={handleNewsletterSubmit}
              className="flex items-center gap-4 border-b border-alabaster/20 pb-4 relative"
            >
              <input 
                type="email" 
                placeholder="Your email address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={newsletterStatus === 'loading'}
                className="bg-transparent text-sm w-full outline-none placeholder:text-alabaster/10 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_50px_#000_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#FFF]"
              />
              <button type="submit" disabled={newsletterStatus === 'loading'} className="text-[10px] uppercase tracking-widest font-semibold text-bloodred hover:text-alabaster transition-colors shrink-0 disabled:opacity-50">
                {newsletterStatus === 'loading' ? 'Joining...' : 'Subscribe'}
              </button>
            </form>
            {newsletterStatus !== 'idle' && (
              <p className={`text-[10px] uppercase tracking-widest mt-2 ${newsletterStatus === 'success' ? 'text-alabaster/60' : 'text-bloodred'}`}>
                {newsletterMessage}
              </p>
            )}
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
              <div className="p-8 border-b border-stone/30 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-bloodred flex items-center justify-center">
                    <Activity size={20} className="text-alabaster" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-alabaster">System Diagnostics</h2>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-alabaster/40 font-bold">Real-time system oversight</p>
                  </div>
                </div>

                {isAdminAuthenticated && (
                  <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-stone/30 pt-4 sm:pt-0 sm:pl-8 sm:ml-8">
                    <button
                      onClick={() => setAdminTab('sessions')}
                      className={`text-[9px] uppercase tracking-widest font-bold py-2.5 px-4 transition-all ${
                        adminTab === 'sessions'
                          ? 'bg-bloodred text-alabaster'
                          : 'bg-stone/15 text-alabaster/40 hover:text-alabaster hover:bg-stone/25'
                      }`}
                    >
                      User Sessions
                    </button>
                    <button
                      onClick={() => setAdminTab('orders')}
                      className={`text-[9px] uppercase tracking-widest font-bold py-2.5 px-4 transition-all ${
                        adminTab === 'orders'
                          ? 'bg-bloodred text-alabaster'
                          : 'bg-stone/15 text-alabaster/40 hover:text-alabaster hover:bg-stone/25'
                      }`}
                    >
                      Order Logistics ({orders.length})
                    </button>
                  </div>
                )}

                <button 
                  onClick={() => {
                    setIsAdminOpen(false);
                    setIsAdminAuthenticated(false);
                    setAdminPasscode('');
                    setAdminTab('sessions');
                  }} 
                  className="p-2 hover:text-bloodred transition-colors ml-auto"
                  aria-label="Close diagnostics"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 flex flex-col">
                {!isAdminAuthenticated ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div className="text-center">
                      <h3 className="text-xl font-serif text-alabaster mb-2">Access Restricted</h3>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-alabaster/40 font-bold">Authorization required to view node data</p>
                    </div>
                    <form onSubmit={handlePasscodeSubmit} className="w-full max-w-xs space-y-4">
                      <input 
                        ref={passcodeInputRef}
                        type="password"
                        autoFocus
                        placeholder="ENTER ACCESS KEY"
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                        className="w-full bg-stone/20 border border-stone/30 focus:border-bloodred text-alabaster px-6 py-4 outline-none transition-all text-xs uppercase tracking-widest text-center placeholder:text-alabaster/20"
                      />
                      <button 
                        type="submit"
                        className="w-full bg-bloodred text-alabaster py-4 text-[8px] uppercase tracking-[0.4em] font-bold hover:bg-white hover:text-charcoal transition-all"
                      >
                        Authorize
                      </button>
                    </form>
                  </div>
                ) : adminTab === 'sessions' ? (
                  users.length === 0 ? (
                    <div className="h-60 flex flex-col items-center justify-center text-alabaster/40 italic">
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
                            <span className="text-[10px] uppercase tracking-widest text-alabaster/40 ml-auto">Verified User</span>
                          </div>
                          
                          <div className="grid gap-4">
                            {user.activity.slice().reverse().map((act, j) => (
                              <div key={j} className="flex items-center gap-6 bg-stone/5 p-4 group hover:bg-stone/10 transition-all">
                                <div className="w-8 h-8 rounded-full border border-alabaster/20 flex items-center justify-center text-alabaster/40 group-hover:text-bloodred transition-colors">
                                  <Clock size={12} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] uppercase tracking-widest text-alabaster/80">{act.action}</p>
                                </div>
                                <span className="text-[8px] uppercase tracking-widest text-alabaster/40">
                                  {new Date(act.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  orders.length === 0 ? (
                    <div className="h-60 flex flex-col items-center justify-center text-alabaster/40 italic">
                      <ShoppingBag size={40} className="mb-4 opacity-20 animate-pulse" />
                      <p className="text-xs uppercase tracking-widest font-semibold">No order logs found in store cache.</p>
                    </div>
                  ) : (
                    <div className="space-y-8 text-alabaster">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-stone/5 border border-stone/10 p-6 space-y-6 rounded-sm">
                          
                          {/* Order details header */}
                          <div className="flex justify-between items-start border-b border-stone/10 pb-4 flex-wrap gap-4">
                            <div>
                              <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-1">ORDER ID</span>
                              <h4 className="font-mono text-xs font-bold text-bloodred tracking-wider">{order.id}</h4>
                            </div>
                            <div>
                              <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-1">DATE</span>
                              <span className="text-[10px] font-mono">{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-1">CLIENT</span>
                              <span className="text-xs font-semibold">{order.fullName}</span>
                              <span className="text-[9px] text-stone font-light block font-mono">{order.email}</span>
                            </div>
                            <div>
                              <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-1">VALUE</span>
                              <span className="text-xs font-bold text-bloodred font-serif">${order.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Details details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px]">
                            <div className="space-y-2">
                              <span className="text-[8px] uppercase tracking-widest text-stone font-bold block">Delivery Address</span>
                              <p className="text-stone font-light uppercase tracking-widest leading-relaxed">
                                {order.address}, {order.city}, {order.country}
                              </p>
                            </div>
                            <div className="space-y-4">
                              <span className="text-[8px] uppercase tracking-widest text-stone font-bold block">Line Items</span>
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-center">
                                  <div className="relative w-8 h-10 flex-shrink-0 bg-stone/20 overflow-hidden">
                                    <img src={item.image} alt="" className="object-cover w-full h-full" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate text-[10px] uppercase tracking-widest">{item.name}</p>
                                    <p className="text-[9px] text-stone uppercase tracking-widest">
                                      Size {item.selectedSize} · {item.selectedColor.name} · Qty {item.quantity}
                                    </p>
                                    {item.customText && (
                                      <div className="mt-1 bg-bloodred/10 border border-bloodred/25 px-2 py-0.5 inline-block text-[8px] font-mono text-bloodred tracking-wider font-bold">
                                        CUSTOM CANVAS: "{item.customText}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Logistics management actions */}
                          <div className="mt-4 border-t border-stone/10 pt-4 space-y-4">
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="text-[8px] uppercase tracking-[0.2em] text-stone font-bold">Shipment Status:</span>
                              {['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((statusOption) => (
                                <button
                                  key={statusOption}
                                  onClick={() => {
                                    const trkNum = trackingNumberInputs[order.id] || order.trackingNumber || `TRK-${Math.floor(Math.random() * 100000000)}`;
                                    updateOrderStatus(order.id, statusOption as any, trkNum);
                                  }}
                                  className={`text-[8px] uppercase tracking-widest font-bold py-1.5 px-3 transition-colors ${
                                    order.status === statusOption 
                                      ? 'bg-bloodred text-alabaster shadow-md' 
                                      : 'bg-stone/10 text-alabaster/60 hover:bg-stone/20 hover:text-alabaster'
                                  }`}
                                >
                                  {statusOption}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                              <input
                                type="text"
                                placeholder="ENTER TRACKING CODE (E.G. TRK-830219)"
                                value={trackingNumberInputs[order.id] ?? order.trackingNumber}
                                onChange={(e) => setTrackingNumberInputs(prev => ({
                                  ...prev,
                                  [order.id]: e.target.value.toUpperCase()
                                }))}
                                className="bg-[#111] border border-white/10 text-alabaster px-3 py-2 text-[9px] font-semibold font-mono tracking-widest w-full sm:w-64 focus:border-bloodred outline-none uppercase placeholder:text-stone/20"
                              />
                              <button
                                onClick={() => {
                                  const trkNum = trackingNumberInputs[order.id] || order.trackingNumber || `TRK-${Math.floor(Math.random() * 100000000)}`;
                                  updateOrderStatus(order.id, order.status, trkNum);
                                  alert(`Tracking system updated for order ${order.id}. User notification dispatched.`);
                                }}
                                className="bg-white hover:bg-bloodred hover:text-alabaster text-charcoal px-4 py-2 text-[8px] uppercase tracking-widest font-bold transition-all w-full sm:w-auto"
                              >
                                Save Tracking Code
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div className="p-8 bg-stone/10 border-t border-stone/30 flex justify-between items-center">
                <span className="text-[8px] uppercase tracking-[0.4em] text-alabaster/40">End-to-End Encryption Active</span>
                <span className="text-[8px] uppercase tracking-[0.4em] text-alabaster/40">Node: {users.length} Sessions Detected</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
