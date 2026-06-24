'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { useCurrency } from '@/store/useCurrency';
import { useRouter } from 'next/navigation';
import { LogOut, Package, Heart, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';

export default function DashboardPage() {
  const { user, isAuthenticated, logout, trackActivity } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  
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

  return (
    <div className="min-h-screen bg-charcoal text-alabaster pt-40 pb-32 font-sans">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <header className="mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/10 pb-8 gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-bloodred font-bold">My Account</span>
            <h1 className="text-4xl md:text-5xl font-serif text-alabaster mb-2">Profile</h1>
            <p className="text-xs text-alabaster/60 font-light tracking-wide">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-alabaster/60 hover:text-bloodred transition-colors pb-1"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </header>

        <div className="space-y-16">
          
          {/* Quick Actions & Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Sizing Profile */}
            <div className="border border-white/10 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone mb-6">My Size</h2>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map((sz) => (
                    <button
                       key={sz}
                       onClick={() => handleUpdateSize(sz)}
                       className={`w-10 h-10 flex items-center justify-center text-xs font-light transition-all ${
                         preferredSize === sz
                           ? 'bg-alabaster text-charcoal'
                           : 'border border-white/10 text-alabaster/60 hover:border-alabaster hover:text-alabaster'
                       }`}
                    >
                       {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Membership */}
            <div className="border border-white/10 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone mb-6">Membership Tier</h2>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-serif text-alabaster">Gold</span>
                  <span className="text-sm font-light text-bloodred font-bold">250 pts</span>
                </div>
              </div>
              <div className="mt-6 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-alabaster/60 uppercase tracking-widest">Promo Code</span>
                  <button onClick={copyPromoCode} className="text-[10px] font-mono hover:text-bloodred transition-colors">
                    {copied ? 'COPIED' : 'INSTINCT (10%)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="border border-white/10 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone mb-4">Customer Support</h2>
                <p className="text-xs text-alabaster/60 leading-relaxed font-light">
                  Need help with sizing or have a question? Contact our team.
                </p>
              </div>
              <div className="mt-6">
                <Link 
                  href="https://wa.me/2349018389254" 
                  target="_blank"
                  className="text-[10px] uppercase tracking-widest font-bold text-bloodred hover:text-alabaster transition-colors flex items-center gap-1"
                >
                  Contact Us <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Productivity Section: Orders & Wishlist */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Orders */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone">Recent Orders</h2>
                <Link href="/track-order" className="text-[10px] uppercase tracking-widest text-alabaster/50 hover:text-alabaster transition-colors">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {loadingOrders ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 border border-white/5 bg-white/[0.02]">
                    <Loader2 size={20} className="animate-spin text-bloodred" />
                    <p className="text-[10px] uppercase tracking-widest text-stone">Synchronizing orders...</p>
                  </div>
                ) : dbOrders.length === 0 ? (
                  <div className="py-12 text-center border border-white/5 bg-white/[0.02] flex flex-col justify-center">
                    <p className="text-xs text-alabaster/40 font-light">No order records found in the archive.</p>
                    <Link href="/shop" className="mt-4 text-[10px] uppercase tracking-widest font-bold text-bloodred hover:text-alabaster transition-colors">
                      Explore Inventory ➔
                    </Link>
                  </div>
                ) : (
                  dbOrders.map((order) => {
                    const formattedDate = new Date(order.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    // Map Supabase database order status to CSS status strings & colors
                    let statusColor = 'text-stone';
                    let displayStatus = order.status;

                    if (order.status === 'paid' || order.status === 'delivered') {
                      statusColor = 'text-emerald-500';
                      displayStatus = order.status === 'paid' ? 'Paid' : 'Delivered';
                    } else if (order.status === 'pending') {
                      statusColor = 'text-amber-500';
                      displayStatus = 'Pending';
                    } else if (order.status === 'shipped') {
                      statusColor = 'text-bloodred';
                      displayStatus = 'Shipped';
                    } else if (order.status === 'cancelled') {
                      statusColor = 'text-stone';
                      displayStatus = 'Cancelled';
                    }

                    return (
                      <Link 
                        key={order.id} 
                        href={`/track-order?code=${order.payment_reference}`}
                        className="block"
                      >
                        <div className="flex justify-between items-center p-5 bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group">
                          <div className="flex items-center gap-5">
                            <div className="bg-charcoal p-3 border border-white/10 group-hover:border-bloodred/40 transition-colors">
                              <Package size={16} className="text-alabaster/60" />
                            </div>
                            <div>
                              <p className="text-sm font-mono text-alabaster tracking-wider group-hover:text-bloodred transition-colors">{order.payment_reference}</p>
                              <p className="text-[10px] text-alabaster/50 uppercase tracking-widest mt-1">{formattedDate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-serif text-alabaster">{formatPrice(order.total_price)}</p>
                            <p className={`text-[10px] uppercase tracking-widest mt-1 ${statusColor}`}>
                              {displayStatus}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Wishlist Quick Access */}
            <div className="space-y-6">
               <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone">Saved Items</h2>
                <Link href="/wishlist" className="text-[10px] uppercase tracking-widest text-alabaster/50 hover:text-alabaster transition-colors">
                  Go to Wishlist
                </Link>
              </div>
              <div className="border border-white/5 bg-white/[0.02] p-8 text-center space-y-5 h-[200px] flex flex-col justify-center">
                <Heart size={20} className="mx-auto text-alabaster/30" />
                <p className="text-xs text-alabaster/60 font-light">
                  You have <span className="text-alabaster font-bold">3 items</span> in your wishlist.
                </p>
                <Link href="/wishlist" className="inline-block border border-white/20 hover:border-alabaster hover:bg-alabaster hover:text-charcoal px-6 py-3 text-[9px] uppercase tracking-widest font-bold transition-all mx-auto">
                  Review Items
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
