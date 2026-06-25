'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { useCurrency } from '@/store/useCurrency';
import { useRouter } from 'next/navigation';
import { LogOut, Package, Loader2, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';

// Helper to calculate total items
const calculateTotalItems = (items: any[]) => items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

export default function AdminDashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Hardcoded check for MVP. In a real app this would be validated exclusively server-side.
  const isAdmin = process.env.NODE_ENV === 'development' || user?.email === 'orders@wearimpulsive.site';

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
        } else {
          console.error('[Admin] Failed to fetch orders', await res.text());
        }
      } catch (err) {
        console.error('[Admin] Failed to fetch orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchAllOrders();
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
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <header className="mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/10 pb-8 gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-bloodred font-bold">Admin Portal</span>
            <h1 className="text-4xl md:text-5xl font-serif text-alabaster mb-2">Command Center</h1>
            <p className="text-xs text-alabaster/60 font-light tracking-wide">{user.email}</p>
          </div>
          <button 
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-alabaster/60 hover:text-bloodred transition-colors pb-1"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </header>

        <div className="space-y-6">
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone">Global Orders</h2>
          
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
                    {orders.map((order) => {
                      const formattedDate = new Date(order.created_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                      });

                      const email = order.metadata?.email || 'Unknown Customer';
                      const state = order.metadata?.shippingAddress?.state || 'Unknown Location';
                      const itemCount = calculateTotalItems(order.order_items);
                      
                      let statusColor = 'text-stone';
                      if (order.status === 'paid' || order.status === 'delivered') statusColor = 'text-emerald-500';
                      if (order.status === 'pending') statusColor = 'text-amber-500';
                      if (order.status === 'shipped') statusColor = 'text-bloodred';

                      const isUpdating = updatingId === order.id;

                      return (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                            <span className="font-mono text-xs text-alabaster">{order.payment_reference}</span>
                          </td>
                          <td className="p-4 text-[10px] text-alabaster/60">{formattedDate}</td>
                          <td className="p-4">
                            <div className="text-xs">{email}</div>
                            <div className="text-[9px] uppercase tracking-widest text-alabaster/40 mt-1">{state}</div>
                          </td>
                          <td className="p-4 text-xs text-alabaster/60">{itemCount} items</td>
                          <td className="p-4 font-serif text-sm">{formatPrice(order.total_price)}</td>
                          <td className="p-4">
                            <span className={`text-[9px] uppercase tracking-widest px-2 py-1 border border-white/10 ${statusColor}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                               {isUpdating ? (
                                  <Loader2 size={14} className="animate-spin text-alabaster" />
                               ) : (
                                  <select 
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    className="bg-charcoal border border-white/20 text-[9px] uppercase tracking-widest text-alabaster p-1 cursor-pointer hover:border-alabaster transition-colors"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                               )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
