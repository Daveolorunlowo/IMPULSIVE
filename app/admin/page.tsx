'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { useCurrency } from '@/store/useCurrency';
import { useRouter } from 'next/navigation';
import { LogOut, Package, Loader2, ChevronDown, Check, Tag, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to calculate total items
const calculateTotalItems = (items: any[]) => items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

type AdminTab = 'orders' | 'promos';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Promos State
  const [promos, setPromos] = useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('10');
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Use NEXT_PUBLIC_ADMIN_EMAIL for client-side check. Default to orders@wearimpulsive.site
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'orders@wearimpulsive.site';
  const isAdmin = process.env.NODE_ENV === 'development' || user?.email === adminEmail;

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isAdmin) {
      router.push('/');
      return;
    }

    async function fetchAllOrders() {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const res = await fetch('/api/admin/orders', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('[Admin] Failed to fetch orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    async function fetchAllPromos() {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const res = await fetch('/api/admin/promos', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (res.ok) {
          const data = await res.json();
          setPromos(data.promos || []);
        }
      } catch (err) {
        console.error('[Admin] Failed to fetch promos:', err);
      } finally {
        setLoadingPromos(false);
      }
    }

    fetchAllOrders();
    fetchAllPromos();
  }, [user, isAuthenticated, isAdmin, router]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode || !newPromoDiscount) return;
    setCreatingPromo(true);
    setPromoError('');

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          code: newPromoCode, 
          discount_percentage: Number(newPromoDiscount),
          is_active: true
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPromos([data.promo, ...promos]);
        setNewPromoCode('');
        setNewPromoDiscount('10');
      } else {
        setPromoError(data.error === 'PROMO_CODE_EXISTS' ? 'Code already exists' : 'Failed to create code');
      }
    } catch (err) {
      setPromoError('Network error');
    } finally {
      setCreatingPromo(false);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`/api/admin/promos?id=${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        setPromos(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-charcoal text-alabaster flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-serif mb-6">Admin Access</h1>
        <Link 
          href="/auth?redirect=/admin"
          className="border border-alabaster text-alabaster px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:bg-alabaster hover:text-charcoal"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-charcoal text-alabaster pt-40 pb-32 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-12">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-bloodred font-bold">Admin Portal</span>
              <h1 className="text-3xl font-serif text-alabaster mt-2">Command Center</h1>
              <p className="text-[10px] text-alabaster/40 uppercase tracking-widest mt-1 truncate">{user.email}</p>
            </div>

            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  activeTab === 'orders' ? 'bg-white/10 text-alabaster' : 'text-alabaster/40 hover:bg-white/5 hover:text-alabaster'
                }`}
              >
                <Package size={16} className={activeTab === 'orders' ? 'text-bloodred' : ''} /> Global Orders
              </button>
              <button
                onClick={() => setActiveTab('promos')}
                className={`flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  activeTab === 'promos' ? 'bg-white/10 text-alabaster' : 'text-alabaster/40 hover:bg-white/5 hover:text-alabaster'
                }`}
              >
                <Tag size={16} className={activeTab === 'promos' ? 'text-bloodred' : ''} /> Discounts
              </button>
            </nav>

            <div className="pt-8 border-t border-white/10">
              <button 
                onClick={() => { logout(); router.push('/'); }}
                className="flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest font-bold text-alabaster/40 hover:text-bloodred transition-colors w-full"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            
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
                <h2 className="text-xl font-serif border-b border-white/10 pb-4">Global Orders</h2>
                
                <div className="border border-white/10 bg-white/[0.02]">
                  {loadingOrders ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                      <Loader2 size={24} className="animate-spin text-bloodred" />
                      <p className="text-[10px] uppercase tracking-widest text-stone">Decrypting archives...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-20 text-center flex flex-col justify-center">
                      <p className="text-xs text-alabaster/40 font-light">No orders found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-alabaster/50">
                            <th className="p-4 font-normal">Reference</th>
                            <th className="p-4 font-normal">Date</th>
                            <th className="p-4 font-normal">Customer</th>
                            <th className="p-4 font-normal">Items</th>
                            <th className="p-4 font-normal">Total</th>
                            <th className="p-4 font-normal">Status</th>
                            <th className="p-4 font-normal text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4 font-mono text-[10px] tracking-wider text-alabaster/80">
                                {order.payment_reference}
                              </td>
                              <td className="p-4 text-[10px] text-alabaster/50">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-xs font-light text-alabaster">
                                {order.metadata?.email || 'N/A'}
                              </td>
                              <td className="p-4 text-[10px] text-stone">
                                {calculateTotalItems(order.order_items)}
                              </td>
                              <td className="p-4 text-xs text-alabaster">
                                {formatPrice(order.total_price)}
                              </td>
                              <td className="p-4">
                                <span className={`text-[9px] uppercase tracking-widest px-2 py-1 border ${
                                  order.status === 'paid' || order.status === 'delivered' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' :
                                  order.status === 'pending' ? 'text-amber-500 border-amber-500/30 bg-amber-500/5' :
                                  'text-bloodred border-bloodred/30 bg-bloodred/5'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-4 text-right relative min-w-[120px]">
                                {updatingId === order.id ? (
                                  <Loader2 size={16} className="animate-spin text-stone inline-block" />
                                ) : (
                                  <div className="relative inline-block">
                                    <select
                                      className="appearance-none bg-transparent border border-white/20 text-[10px] uppercase tracking-widest text-alabaster py-2 pl-3 pr-8 cursor-pointer hover:border-bloodred transition-colors focus:outline-none"
                                      value={order.status}
                                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    >
                                      <option value="pending" className="bg-charcoal text-alabaster">Pending</option>
                                      <option value="paid" className="bg-charcoal text-alabaster">Paid</option>
                                      <option value="shipped" className="bg-charcoal text-alabaster">Shipped</option>
                                      <option value="delivered" className="bg-charcoal text-alabaster">Delivered</option>
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone pointer-events-none" />
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* PROMOS TAB */}
            {activeTab === 'promos' && (
              <motion.div
                key="promos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h2 className="text-xl font-serif">Marketing & Discounts</h2>
                </div>
                
                {/* Create Promo Form */}
                <div className="border border-white/10 p-6 bg-white/[0.02]">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-stone mb-4">Generate New Code</h3>
                  <form onSubmit={handleCreatePromo} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="space-y-2 w-full sm:w-auto">
                      <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Promo Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. SUMMER20"
                        value={newPromoCode}
                        onChange={(e) => setNewPromoCode(e.target.value)}
                        className="bg-transparent border border-white/20 px-4 py-3 text-sm text-alabaster font-mono uppercase tracking-wider w-full sm:w-48 focus:outline-none focus:border-bloodred transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2 w-full sm:w-auto">
                      <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Discount %</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="1"
                          max="100"
                          value={newPromoDiscount}
                          onChange={(e) => setNewPromoDiscount(e.target.value)}
                          className="bg-transparent border border-white/20 px-4 py-3 pl-8 text-sm text-alabaster w-full sm:w-32 focus:outline-none focus:border-bloodred transition-colors"
                          required
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone text-sm">%</span>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={creatingPromo}
                      className="bg-bloodred text-alabaster px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-alabaster hover:text-charcoal transition-all disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      {creatingPromo ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Create</>}
                    </button>
                  </form>
                  {promoError && <p className="text-xs text-bloodred mt-4">{promoError}</p>}
                </div>

                {/* Promos List */}
                <div className="border border-white/10 bg-white/[0.02]">
                  {loadingPromos ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                      <Loader2 size={24} className="animate-spin text-bloodred" />
                    </div>
                  ) : promos.length === 0 ? (
                    <div className="py-20 text-center flex flex-col justify-center">
                      <p className="text-xs text-alabaster/40 font-light">No promo codes active.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-alabaster/50">
                            <th className="p-4 font-normal">Code</th>
                            <th className="p-4 font-normal">Discount</th>
                            <th className="p-4 font-normal">Status</th>
                            <th className="p-4 font-normal text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {promos.map((promo) => (
                            <tr key={promo.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4 font-mono text-sm tracking-wider text-alabaster font-bold">
                                {promo.code}
                              </td>
                              <td className="p-4 text-xs text-alabaster/80">
                                {promo.discount_percentage}% OFF
                              </td>
                              <td className="p-4">
                                <span className={`text-[9px] uppercase tracking-widest px-2 py-1 border ${
                                  promo.is_active ? 'text-emerald-500 border-emerald-500/30' : 'text-stone border-stone/30'
                                }`}>
                                  {promo.is_active ? 'Active' : 'Disabled'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleDeletePromo(promo.id)}
                                  className="text-stone hover:text-bloodred transition-colors p-2"
                                  title="Delete Code"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
