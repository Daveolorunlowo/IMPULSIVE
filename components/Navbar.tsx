'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { useCart } from '@/store/useCart';
import { useCurrency } from '@/store/useCurrency';
import { useAuth } from '@/store/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, ArrowLeft, LogOut, User, ArrowUpRight, Terminal, Heart, Truck } from 'lucide-react';
import { useWishlist } from '@/store/useWishlist';
import { useOrders } from '@/store/useOrders';
import { useProducts } from '@/store/useProducts';

export default function Navbar() {
  const { products } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useCallback((node: HTMLInputElement | null) => {
    if (node) {
      setTimeout(() => node.focus(), 150);
    }
  }, []);
  
  const { toggleCart, items } = useCart();
  const { currency, toggleCurrency, formatPrice } = useCurrency();
  const { isAuthenticated, logout, user } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { orders } = useOrders();
  const unreadOrdersCount = orders.filter(
    (o) => o.unreadNotification && user && o.email.toLowerCase() === user.email.toLowerCase()
  ).length;
  const router = useRouter();
  const pathname = usePathname();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isHome = pathname === '/';

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Lookbook', href: '/lookbook' },
    { name: 'Philosophy', href: '/philosophy' },
  ];

  // Sizing/Search Command Palette Keyboard Shortcut Listener [Ctrl + K]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/80 backdrop-blur-md border-b border-bloodred/20 isolate text-alabaster">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          
          {/* Left Section */}
          <div className="flex items-center justify-start gap-4">
            {/* Left Actions (Mobile) */}
            <div className="flex items-center gap-4 md:hidden">
              {!isHome && (
                <button onClick={() => router.back()} className="p-2 text-alabaster/60 hover:text-bloodred transition-colors" aria-label="Go back">
                  <ArrowLeft size={20} strokeWidth={1.5} />
                </button>
              )}
              <button onClick={() => setIsOpen(true)} aria-label="Open menu">
                <Menu size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Left Nav (Desktop) */}
            <div className="hidden md:flex items-center gap-12">
            {!isHome && (
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-semibold text-alabaster/60 hover:text-bloodred transition-colors"
              >
                <ArrowLeft size={16} strokeWidth={1.5} /> Back
              </button>
            )}
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-[10px] uppercase tracking-[0.3em] font-semibold text-alabaster/60 hover:text-bloodred transition-colors"
              >
                {link.name}
              </Link>
            ))}
            </div>
          </div>

          {/* Center Logo - Responsive Scaling */}
          <div className="flex justify-center items-center">
            <Link 
              href="/" 
              className="flex items-center group z-10"
            >
              <Logo 
                variant="light" 
                className="h-7 sm:h-8 md:h-12 lg:h-14 w-auto transition-all duration-500 group-hover:scale-110"
              />
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 md:gap-8">
            <button 
              onClick={toggleCurrency}
              className="hidden md:block text-[10px] uppercase tracking-widest font-bold text-alabaster/60 hover:text-bloodred transition-colors w-8 text-center"
              suppressHydrationWarning
            >
              {currency}
            </button>

            {/* ksome-style Search Input Trigger (Desktop) */}
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden xl:flex items-center gap-3 bg-stone/10 border border-stone/20 rounded-full pl-4 pr-12 py-2.5 text-[9px] uppercase tracking-widest font-bold text-alabaster/40 hover:border-bloodred transition-all cursor-pointer"
            >
              <Search size={14} strokeWidth={1.5} className="text-stone" />
              <span>Search [Ctrl+K]</span>
            </button>

            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="text-alabaster/60 hover:text-bloodred transition-colors xl:hidden"
              aria-label="Search items"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            
            {/* Auth Action */}
            <div className="hidden sm:block">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link 
                    href="/dashboard"
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-alabaster/60 hover:text-bloodred transition-colors"
                    title={`Logged in as ${user?.email} - Go to Portal`}
                  >
                    <User size={18} strokeWidth={1.5} />
                  </Link>
                </div>
              ) : (
                <Link 
                  href="/auth"
                  className="text-[10px] uppercase tracking-widest font-bold text-alabaster/60 hover:text-bloodred transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Wishlist */}
            <Link 
              href="/wishlist" 
              className="relative group text-alabaster/60 hover:text-bloodred transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-bloodred text-alabaster text-[8px] flex items-center justify-center rounded-full font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Track Order */}
            <Link 
              href="/track-order" 
              className="relative group text-alabaster/60 hover:text-bloodred transition-colors"
              aria-label="Track Order"
              title="Track Order Status"
            >
              <Truck size={20} strokeWidth={1.5} />
              {unreadOrdersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-bloodred text-alabaster text-[8px] flex items-center justify-center rounded-full font-bold animate-pulse">
                  {unreadOrdersCount}
                </span>
              )}
            </Link>

            <button 
              onClick={toggleCart}
              className="relative group text-alabaster/60 hover:text-bloodred transition-colors"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-bloodred text-alabaster text-[8px] flex items-center justify-center rounded-full font-bold">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-charcoal text-alabaster flex flex-col p-12"
          >
            <div className="flex justify-between items-center mb-12">
              <Logo 
                variant="light" 
                className="h-14 w-auto"
              />
              <button onClick={() => setIsOpen(false)} className="hover:text-bloodred transition-colors" aria-label="Close menu">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex flex-col gap-12">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-4xl font-serif hover:text-bloodred transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <Link 
                  href="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="text-4xl font-serif hover:text-bloodred transition-colors"
                >
                  Wishlist ({wishlistItems.length})
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (navLinks.length + 1) * 0.1 }}
              >
                <Link 
                  href="/track-order"
                  onClick={() => setIsOpen(false)}
                  className="text-4xl font-serif hover:text-bloodred transition-colors"
                >
                  Track Order
                </Link>
              </motion.div>

              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (navLinks.length + 2) * 0.1 }}
                >
                  <Link 
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-4xl font-serif text-bloodred hover:text-alabaster transition-colors"
                  >
                    Portal
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (navLinks.length + 2) * 0.1 }}
                >
                  <Link 
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="text-4xl font-serif text-bloodred hover:text-alabaster transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
              )}
            </div>

            <div className="mt-auto pt-12 border-t border-stone/20 flex flex-wrap justify-between items-end gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-alabaster/40 mb-4">Inquiries</p>
                <p className="text-sm hover:text-bloodred transition-colors cursor-pointer">concierge@impulsive.com</p>
              </div>

              <div className="flex flex-col items-start sm:items-end">
                <p className="text-[10px] uppercase tracking-widest text-alabaster/40 mb-4">Currency</p>
                <button 
                  onClick={toggleCurrency}
                  className="bg-stone/10 border border-stone/20 hover:border-bloodred/50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-alabaster transition-all flex items-center gap-2"
                  suppressHydrationWarning
                >
                  <span>{currency}</span>
                  <span className="text-[8px] opacity-40">Change</span>
                </button>
              </div>

              {isAuthenticated && (
                <button 
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                    router.push('/');
                  }}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-bloodred"
                >
                  <LogOut size={16} /> Log Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Sizing/Search Command Palette Modal Overlay */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setIsCommandPaletteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-stone/95 border border-bloodred/25 p-8 rounded-sm shadow-2xl flex flex-col gap-6 relative text-alabaster"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-bloodred/10">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-bloodred flex items-center gap-2">
                  <Search size={12} /> Search Items
                </span>
                <span className="text-[8px] uppercase tracking-widest text-stone font-bold">
                  Press [ESC] to close
                </span>
              </div>

              {/* Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bloodred" size={20} />
                <input 
                  ref={searchInputRef}
                  autoFocus
                  type="text"
                  placeholder="SEARCH ITEMS (e.g. Tee, Signature)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-charcoal border border-bloodred/20 pl-14 pr-6 py-4 text-xs font-semibold uppercase tracking-widest text-alabaster placeholder:text-stone/30 focus:outline-none focus:border-bloodred transition-all"
                />
              </div>

              {/* Recommended Quick Tags */}
              {searchQuery.length === 0 && (
                <div className="space-y-3 py-2">
                  <span className="text-[8px] uppercase tracking-widest text-stone font-bold">System Quick Tags</span>
                  <div className="flex flex-wrap gap-3">
                    {['Signature', 'Archive', 'Tee', 'Red', 'Black'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="bg-charcoal border border-alabaster/10 hover:border-bloodred hover:text-bloodred px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results List */}
              {searchQuery.length > 0 && (
                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-bloodred">
                  {products
                    .filter(p => 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      p.category.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((product) => (
                      <Link 
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setIsCommandPaletteOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-4 p-3 bg-charcoal border border-alabaster/5 hover:border-bloodred transition-colors group/item"
                      >
                        <div className="relative w-12 h-16 bg-stone/20 flex-shrink-0">
                          <Image src={product.mainImage} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-alabaster group-hover/item:text-bloodred transition-colors truncate">
                            {product.name}
                          </h4>
                          <p className="text-[9px] text-stone uppercase tracking-widest mt-0.5">{product.category}</p>
                        </div>
                        <div className="text-[10px] font-bold text-bloodred">
                          {formatPrice(product.price)}
                        </div>
                        <ArrowUpRight size={14} className="text-stone opacity-0 group-hover/item:opacity-100 transition-all" />
                      </Link>
                    ))
                  }
                  {products.filter(p => 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    p.category.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-stone italic">No items found matching the current string</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

