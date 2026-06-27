'use client';

import React, { useState, useEffect } from 'react';
import { useCurrency } from '@/store/useCurrency';
import { useRouter } from 'next/navigation';
import { Package, Loader2, ChevronDown, Check, Tag, Plus, Trash2, KeyRound, LogOut, Shirt, Edit2, Save, X, Image as ImageIcon, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type AdminTab = 'orders' | 'promos' | 'products';

const calculateTotalItems = (items: any[]) => items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

export default function AdminDashboardPage() {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Promos State
  const [promos, setPromos] = useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('10');
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    id: '', slug: '', name: '', category: 'Signature', price: 0, description: '', mainImage: '', hoverImage: '', sizes: '', colors: '', details: '', status: 'New Drop'
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingHoverImage, setUploadingHoverImage] = useState(false);

  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword');
    if (savedPassword) {
      setIsAuthenticatedAdmin(true);
      fetchAllOrders(savedPassword);
      fetchAllPromos(savedPassword);
      fetchAllProducts();
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoadingOrders(true);
    setLoadingPromos(true);
    
    // Test the password by fetching orders
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'x-admin-password': adminPasswordInput }
      });
      if (res.ok) {
        sessionStorage.setItem('adminPassword', adminPasswordInput);
        setIsAuthenticatedAdmin(true);
        const data = await res.json();
        setOrders(data.orders || []);
        fetchAllPromos(adminPasswordInput);
        fetchAllProducts();
      } else {
        setLoginError('Incorrect password');
      }
    } catch (err) {
      setLoginError('Network error');
    } finally {
      setLoadingOrders(false);
      setLoadingPromos(false);
    }
  };

  async function fetchAllOrders(password: string) {
    try {
      setLoadingOrders(true);
      const res = await fetch('/api/admin/orders', {
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else if (res.status === 403 || res.status === 401) {
        setIsAuthenticatedAdmin(false);
        sessionStorage.removeItem('adminPassword');
      }
    } catch (err) {
      console.error('[Admin] Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function fetchAllPromos(password: string) {
    try {
      setLoadingPromos(true);
      const res = await fetch('/api/admin/promos', {
        headers: { 'x-admin-password': password }
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

  async function fetchAllProducts() {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('[Admin] Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const password = sessionStorage.getItem('adminPassword') || '';
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
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
      const password = sessionStorage.getItem('adminPassword') || '';
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
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
      const password = sessionStorage.getItem('adminPassword') || '';
      const res = await fetch(`/api/admin/promos?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': password
        }
      });

      if (res.ok) {
        setPromos(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'hover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'main') setUploadingMainImage(true);
    else setUploadingHoverImage(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const password = sessionStorage.getItem('adminPassword') || '';
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setProductForm(prev => ({
          ...prev,
          [type === 'main' ? 'mainImage' : 'hoverImage']: data.url
        }));
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Network error uploading image');
    } finally {
      if (type === 'main') setUploadingMainImage(false);
      else setUploadingHoverImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const password = sessionStorage.getItem('adminPassword') || '';
      const method = editingProduct ? 'PATCH' : 'POST';
      
      const payload = {
        ...productForm,
        sizes: productForm.sizes.split(',').map((s: string) => s.trim()).filter(Boolean),
        details: productForm.details.split(',').map((s: string) => s.trim()).filter(Boolean),
        colors: productForm.colors.split(',').map((s: string) => {
          const parts = s.split(':');
          return { name: parts[0]?.trim() || '', hex: parts[1]?.trim() || '#000000' };
        }).filter((c: any) => c.name),
      };

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchAllProducts();
        setShowProductForm(false);
        setEditingProduct(null);
      } else {
        alert('Failed to save product');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const password = sessionStorage.getItem('adminPassword') || '';
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticatedAdmin) {
    return (
      <div className="min-h-screen bg-charcoal text-alabaster flex flex-col items-center justify-center px-6 text-center">
        <KeyRound className="mb-6 text-stone" size={48} />
        <h1 className="text-3xl font-serif mb-2">Admin Portal</h1>
        <p className="text-xs text-stone mb-8 tracking-widest uppercase">Restricted Access</p>
        
        <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 w-full max-w-xs">
          <input
            type="password"
            placeholder="ENTER PASSWORD"
            value={adminPasswordInput}
            onChange={(e) => setAdminPasswordInput(e.target.value)}
            className="w-full bg-[#111] border border-white/10 text-alabaster text-center placeholder:text-stone/40 px-6 py-4 outline-none focus:border-bloodred transition-colors text-[10px] uppercase tracking-[0.2em] font-semibold"
            autoFocus
          />
          <button 
            type="submit"
            className="bg-bloodred hover:bg-alabaster hover:text-charcoal px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-bold transition-all w-full flex justify-center items-center gap-2"
            disabled={loadingOrders}
          >
            {loadingOrders ? <Loader2 size={14} className="animate-spin" /> : 'Access Database'}
          </button>
        </form>
        {loginError && <p className="text-bloodred text-[10px] mt-4 uppercase tracking-widest font-bold">{loginError}</p>}
      </div>
    );
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
              <p className="text-[10px] text-alabaster/40 uppercase tracking-widest mt-1 truncate">Authenticated</p>
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
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  activeTab === 'products' ? 'bg-white/10 text-alabaster' : 'text-alabaster/40 hover:bg-white/5 hover:text-alabaster'
                }`}
              >
                <Shirt size={16} className={activeTab === 'products' ? 'text-bloodred' : ''} /> Products
              </button>
            </nav>

            <div className="pt-8 border-t border-white/10">
              <button 
                onClick={() => { 
                  sessionStorage.removeItem('adminPassword');
                  setIsAuthenticatedAdmin(false);
                  router.push('/'); 
                }}
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

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h2 className="text-xl font-serif">Product Management</h2>
                  {!showProductForm && (
                    <button 
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({ id: '', slug: '', name: '', category: 'Signature', price: 0, description: '', mainImage: '', hoverImage: '', sizes: '', colors: '', details: '', status: 'New Drop' });
                        setShowProductForm(true);
                      }}
                      className="bg-bloodred text-alabaster px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-alabaster hover:text-charcoal transition-all flex items-center gap-2"
                    >
                      <Plus size={14} /> Add Product
                    </button>
                  )}
                </div>
                
                {showProductForm ? (
                  <div className="border border-white/10 p-6 bg-white/[0.02]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm uppercase tracking-widest font-bold text-stone">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h3>
                      <button onClick={() => setShowProductForm(false)} className="text-stone hover:text-bloodred transition-colors">
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">ID (e.g. 10)</label>
                          <input type="text" value={productForm.id} onChange={e => setProductForm({...productForm, id: e.target.value})} disabled={!!editingProduct} className="bg-transparent border border-white/20 px-4 py-3 text-sm text-alabaster w-full focus:outline-none focus:border-bloodred transition-colors disabled:opacity-50" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Name</label>
                          <input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="bg-transparent border border-white/20 px-4 py-3 text-sm text-alabaster w-full focus:outline-none focus:border-bloodred transition-colors" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Slug (e.g. basic-tee-black)</label>
                          <input type="text" value={productForm.slug} onChange={e => setProductForm({...productForm, slug: e.target.value})} className="bg-transparent border border-white/20 px-4 py-3 text-sm text-alabaster w-full focus:outline-none focus:border-bloodred transition-colors" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Category</label>
                          <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="bg-charcoal border border-white/20 px-4 py-3 text-sm text-alabaster w-full focus:outline-none focus:border-bloodred transition-colors">
                            <option value="Signature">Signature</option>
                            <option value="Archive">Archive</option>
                            <option value="Essentials">Essentials</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Price (NGN)</label>
                          <input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="bg-transparent border border-white/20 px-4 py-3 text-sm text-alabaster w-full focus:outline-none focus:border-bloodred transition-colors" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Status Label (e.g. New Drop)</label>
                          <input type="text" value={productForm.status} onChange={e => setProductForm({...productForm, status: e.target.value})} className="bg-transparent border border-white/20 px-4 py-3 text-sm text-alabaster w-full focus:outline-none focus:border-bloodred transition-colors" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Description</label>
                        <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="bg-transparent border border-white/20 px-4 py-3 text-sm text-alabaster w-full focus:outline-none focus:border-bloodred transition-colors resize-none" required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Main Image</label>
                          <div className="relative group border border-white/20 border-dashed hover:border-bloodred transition-colors h-32 flex flex-col items-center justify-center bg-white/[0.02] cursor-pointer overflow-hidden">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={e => handleImageUpload(e, 'main')}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            {uploadingMainImage ? (
                              <Loader2 className="animate-spin text-bloodred" size={24} />
                            ) : productForm.mainImage ? (
                              <img src={productForm.mainImage} alt="Main" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center text-stone group-hover:text-bloodred transition-colors">
                                <UploadCloud size={24} className="mb-2" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Upload Image</span>
                              </div>
                            )}
                            {productForm.mainImage && !uploadingMainImage && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-0">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-white">Change Image</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Hover Image</label>
                          <div className="relative group border border-white/20 border-dashed hover:border-bloodred transition-colors h-32 flex flex-col items-center justify-center bg-white/[0.02] cursor-pointer overflow-hidden">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={e => handleImageUpload(e, 'hover')}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            {uploadingHoverImage ? (
                              <Loader2 className="animate-spin text-bloodred" size={24} />
                            ) : productForm.hoverImage ? (
                              <img src={productForm.hoverImage} alt="Hover" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center text-stone group-hover:text-bloodred transition-colors">
                                <UploadCloud size={24} className="mb-2" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Upload Hover</span>
                              </div>
                            )}
                            {productForm.hoverImage && !uploadingHoverImage && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-0">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-white">Change Image</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Sizes (Comma separated e.g. S, M, L)</label>
                        <input type="text" value={productForm.sizes} onChange={e => setProductForm({...productForm, sizes: e.target.value})} className="bg-transparent border border-white/20 px-4 py-3 text-sm text-alabaster w-full focus:outline-none focus:border-bloodred transition-colors" required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Colors (Format: Name:#Hex, e.g. Red:#800000, Black:#000000)</label>
                        <input type="text" value={productForm.colors} onChange={e => setProductForm({...productForm, colors: e.target.value})} className="bg-transparent border border-white/20 px-4 py-3 text-sm text-alabaster w-full focus:outline-none focus:border-bloodred transition-colors" required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-alabaster/40 uppercase tracking-widest block">Details (Comma separated bullet points)</label>
                        <textarea rows={2} value={productForm.details} onChange={e => setProductForm({...productForm, details: e.target.value})} className="bg-transparent border border-white/20 px-4 py-3 text-sm text-alabaster w-full focus:outline-none focus:border-bloodred transition-colors resize-none" required />
                      </div>

                      <div className="pt-4 border-t border-white/10 flex justify-end gap-4">
                        <button type="button" onClick={() => setShowProductForm(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-stone hover:text-alabaster transition-colors">Cancel</button>
                        <button type="submit" disabled={savingProduct} className="bg-bloodred text-alabaster px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-alabaster hover:text-charcoal transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {savingProduct ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Product</>}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingProducts ? (
                      <div className="col-span-full py-20 flex justify-center"><Loader2 size={24} className="animate-spin text-bloodred" /></div>
                    ) : products.length === 0 ? (
                      <div className="col-span-full py-20 text-center"><p className="text-xs text-alabaster/40 font-light">No products found.</p></div>
                    ) : (
                      products.map((product) => (
                        <div key={product.id} className="border border-white/10 bg-white/[0.02] flex flex-col group overflow-hidden">
                          <div className="relative h-48 bg-stone/5 overflow-hidden">
                            <img src={product.mainImage} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 right-2 flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditingProduct(product);
                                  setProductForm({
                                    id: product.id,
                                    slug: product.slug,
                                    name: product.name,
                                    category: product.category,
                                    price: product.price,
                                    description: product.description || '',
                                    mainImage: product.mainImage || '',
                                    hoverImage: product.hoverImage || '',
                                    sizes: product.sizes?.join(', ') || '',
                                    colors: product.colors?.map((c: any) => `${c.name}:${c.hex}`).join(', ') || '',
                                    details: product.details?.join(', ') || '',
                                    status: product.status || ''
                                  });
                                  setShowProductForm(true);
                                }}
                                className="bg-charcoal/80 text-alabaster p-2 hover:bg-bloodred hover:text-alabaster transition-colors backdrop-blur-sm"
                                title="Edit"
                              ><Edit2 size={14} /></button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="bg-charcoal/80 text-stone p-2 hover:bg-bloodred hover:text-alabaster transition-colors backdrop-blur-sm"
                                title="Delete"
                              ><Trash2 size={14} /></button>
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="text-[8px] uppercase tracking-widest text-stone mb-1 font-bold">{product.category} • ID: {product.id}</div>
                            <h3 className="font-serif text-lg truncate mb-1">{product.name}</h3>
                            <div className="text-sm font-light text-alabaster/80 mb-4">${product.price}</div>
                            <div className="mt-auto text-[9px] uppercase tracking-widest text-stone truncate">
                              Status: {product.status || 'Active'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
