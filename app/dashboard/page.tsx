'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { useCurrency } from '@/store/useCurrency';
import { useRouter } from 'next/navigation';
import { LogOut, Package, Heart, ChevronRight, Loader2, LayoutGrid, Settings as SettingsIcon, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'overview' | 'orders' | 'settings';

export default function DashboardPage() {
  const { user, isAuthenticated, logout, trackActivity } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [preferredSize, setPreferredSize] = useState('M');
  const [copied, setCopied] = useState(false);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('impulsive-pref-size');
      if (saved) setPreferredSize(saved);
    }
  }, []);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!isAuthenticated || !user) return;
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const res = await fetch('/api/orders', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          setDbOrders(data.orders || []);
        }
      } catch (err) {
        console.error('[Dashboard] Failed to fetch orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchUserOrders();
  }, [user, isAuthenticated]);

  const handleUpdateSize = (size: string) => {
    setPreferredSize(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('impulsive-pref-size', size);
    }
    trackActivity(`Updated sizing preference to size ${size}`);
  };

  const handleLogout = () => {
    trackActivity('User signed out of portal');
    logout();
    router.push('/');
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText('INSTINCT');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-charcoal text-alabaster flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-serif mb-6 text-alabaster">Sign In Required</h1>
        <p className="text-sm font-light mb-10 max-w-sm text-alabaster/60 leading-relaxed">
          Please sign in to view your dashboard, set your sizing preference, and check your orders.
        </p>
        <Link
          href="/auth?redirect=/dashboard"
          className="border border-alabaster text-alabaster px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:bg-alabaster hover:text-charcoal"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Calculate stats for overview
  const totalSpent = dbOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);

  let membershipTier = 'New Member';
  let tierIconColor = 'text-stone';
  if (dbOrders.length >= 100) { // Originally 5
    membershipTier = 'Platinum Member';
    tierIconColor = 'text-purple-500';
  } else if (dbOrders.length >= 40) { // Originally 2
    membershipTier = 'Gold Member';
    tierIconColor = 'text-amber-500';
  } else if (dbOrders.length >= 20) { // Originally 1
    membershipTier = 'Silver Member';
    tierIconColor = 'text-stone-300';
  }

  return (
    <div className="min-h-screen bg-charcoal text-alabaster pt-32 pb-32 font-sans selection:bg-bloodred selection:text-alabaster">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-12 lg:gap-24">

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-bloodred font-bold">My Account</span>
              <h1 className="text-3xl font-serif text-alabaster mt-2 truncate" title={user.email}>{user.email.split('@')[0]}</h1>
              <p className="text-[10px] text-alabaster/40 uppercase tracking-widest mt-1 truncate">{user.email}</p>
            </div>

            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-white/10 text-alabaster' : 'text-alabaster/40 hover:bg-white/5 hover:text-alabaster'
                  }`}
              >
                <LayoutGrid size={16} className={activeTab === 'overview' ? 'text-bloodred' : ''} /> Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-white/10 text-alabaster' : 'text-alabaster/40 hover:bg-white/5 hover:text-alabaster'
                  }`}
              >
                <Package size={16} className={activeTab === 'orders' ? 'text-bloodred' : ''} /> Order History
                {dbOrders.length > 0 && (
                  <span className="ml-auto bg-bloodred/20 text-bloodred px-2 py-0.5 rounded text-[10px]">{dbOrders.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-white/10 text-alabaster' : 'text-alabaster/40 hover:bg-white/5 hover:text-alabaster'
                  }`}
              >
                <SettingsIcon size={16} className={activeTab === 'settings' ? 'text-bloodred' : ''} /> Settings
              </button>
            </nav>

            <div className="pt-8 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest font-bold text-alabaster/40 hover:text-bloodred transition-colors w-full"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <h2 className="text-xl font-serif border-b border-white/10 pb-4">Welcome back to WEARIMPULSIVE.</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Status Card */}
                  <div className="border border-white/10 p-6 bg-white/[0.02]">
                    <p className="text-[10px] uppercase tracking-widest text-stone mb-2">Total Spent</p>
                    <p className="text-3xl font-serif text-alabaster">{formatPrice(totalSpent)}</p>
                  </div>

                  {/* Membership Card */}
                  <div className="border border-white/10 p-6 bg-white/[0.02] flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-stone mb-2">Status</p>
                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-serif text-alabaster">{membershipTier}</p>
                        <Heart size={20} className={tierIconColor} />
                      </div>
                    </div>
                  </div>
                </div>

                {dbOrders.length > 0 ? (
                  <div className="border border-white/10 p-8 bg-gradient-to-br from-white/[0.03] to-transparent">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <h3 className="text-sm uppercase tracking-widest font-bold text-alabaster mb-2">Active Promo Code</h3>
                        <p className="text-xs text-alabaster/60 font-light">Use this code at checkout for 10% off your entire order.</p>
                      </div>
                      <button
                        onClick={copyPromoCode}
                        className="flex items-center gap-3 border border-white/20 hover:border-bloodred hover:text-bloodred px-6 py-3 transition-colors group"
                      >
                        <span className="font-mono text-sm tracking-wider">INSTINCT</span>
                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-stone group-hover:text-bloodred" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-white/5 bg-white/[0.01] p-8 text-center border-dashed">
                    <p className="text-xs text-alabaster/50 font-light mb-4">Place your first order to unlock exclusive member promo codes.</p>
                    <Link href="/shop" className="text-[10px] uppercase tracking-widest font-bold text-bloodred hover:text-alabaster transition-colors">
                      Shop Now →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h2 className="text-xl font-serif">Order History</h2>
                </div>

                {loadingOrders ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 size={24} className="animate-spin text-bloodred" />
                    <p className="text-[10px] uppercase tracking-widest text-stone">Synchronizing orders...</p>
                  </div>
                ) : dbOrders.length === 0 ? (
                  <div className="py-20 text-center border border-white/5 bg-white/[0.02] flex flex-col justify-center items-center">
                    <Package size={32} className="text-stone mb-4" />
                    <p className="text-sm text-alabaster/40 font-light mb-6">No order records found in the archive.</p>
                    <Link href="/shop" className="text-[10px] uppercase tracking-widest font-bold bg-bloodred text-alabaster px-8 py-3 hover:bg-alabaster hover:text-charcoal transition-colors">
                      Explore Collection
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dbOrders.map((order) => {
                      const formattedDate = new Date(order.created_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                      });

                      let statusColor = 'text-stone border-stone';
                      let displayStatus = order.status;

                      if (order.status === 'paid' || order.status === 'delivered') {
                        statusColor = 'text-emerald-500 border-emerald-500/30';
                        displayStatus = order.status === 'paid' ? 'Paid' : 'Delivered';
                      } else if (order.status === 'pending') {
                        statusColor = 'text-amber-500 border-amber-500/30';
                        displayStatus = 'Pending';
                      } else if (order.status === 'shipped') {
                        statusColor = 'text-bloodred border-bloodred/30';
                        displayStatus = 'Shipped';
                      }

                      return (
                        <Link
                          key={order.id}
                          href={`/track-order?code=${order.payment_reference}`}
                          className="block group"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20 gap-6">
                            <div className="flex items-center gap-6">
                              <div className="hidden sm:flex bg-charcoal p-4 border border-white/10 group-hover:border-bloodred/40 transition-colors">
                                <Package size={20} className="text-alabaster/60" />
                              </div>
                              <div>
                                <p className="text-sm font-mono text-alabaster tracking-wider group-hover:text-bloodred transition-colors mb-1">
                                  {order.payment_reference}
                                </p>
                                <p className="text-[10px] text-alabaster/50 uppercase tracking-widest">{formattedDate}</p>
                              </div>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-2">
                              <p className="text-lg font-serif text-alabaster">{formatPrice(order.total_price)}</p>
                              <p className={`text-[9px] uppercase tracking-widest px-2 py-1 border ${statusColor}`}>
                                {displayStatus}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <div>
                  <h2 className="text-xl font-serif border-b border-white/10 pb-4 mb-8">Preferences & Settings</h2>

                  <div className="space-y-4 max-w-md">
                    <h3 className="text-[10px] uppercase tracking-widest text-stone font-bold">Default Sizing Profile</h3>
                    <p className="text-xs text-alabaster/50 font-light mb-4">Set your preferred size. We will use this to recommend fits across the collection.</p>
                    <div className="flex gap-3">
                      {['S', 'M', 'L', 'XL'].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => handleUpdateSize(sz)}
                          className={`w-12 h-12 flex items-center justify-center text-sm font-light transition-all ${preferredSize === sz
                            ? 'bg-alabaster text-charcoal shadow-lg shadow-alabaster/20'
                            : 'border border-white/10 text-alabaster/60 hover:border-alabaster hover:text-alabaster'
                            }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-4 border-b border-white/10 pb-4">Customer Support</h3>
                  <p className="text-xs text-alabaster/50 leading-relaxed font-light mb-6 max-w-lg">
                    Need help with an order, sizing inquiries, or general questions? Our concierge team is available to assist you.
                  </p>
                  <Link
                    href="https://wa.me/2349018389254"
                    target="_blank"
                    className="inline-flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold border border-white/20 px-6 py-4 hover:border-bloodred hover:text-bloodred transition-colors"
                  >
                    Contact via WhatsApp <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
