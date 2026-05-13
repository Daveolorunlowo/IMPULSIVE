'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { useCart } from '@/store/useCart';
import { useCurrency } from '@/store/useCurrency';
import { useAuth } from '@/store/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, ArrowLeft, LogOut, User, ArrowUpRight } from 'lucide-react';
import { products } from '@/lib/products';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { toggleCart, items } = useCart();
  const { currency, toggleCurrency } = useCurrency();
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isHome = pathname === '/';

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Lookbook', href: '/lookbook' },
    { name: 'Philosophy', href: '/philosophy' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/80 backdrop-blur-md border-b border-bloodred/20 isolate text-alabaster">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          {/* Left Actions (Mobile) */}
          <div className="flex items-center gap-4 md:hidden">
            {!isHome && (
              <button onClick={() => router.back()} className="p-2 text-alabaster/60 hover:text-bloodred transition-colors">
                <ArrowLeft size={20} strokeWidth={1.5} />
              </button>
            )}
            <button onClick={() => setIsOpen(true)}>
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

          {/* Center Logo - Responsive Scaling */}
          <Link 
            href="/" 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center group z-10"
          >
            <Logo 
              variant="light" 
              className="h-10 md:h-14 lg:h-16 w-auto transition-all duration-500 group-hover:scale-110"
            />
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-6 md:gap-8">
            <button 
              onClick={toggleCurrency}
              className="text-[10px] uppercase tracking-widest font-bold text-alabaster/60 hover:text-bloodred transition-colors w-8 text-center"
            >
              {currency}
            </button>

            {/* ksome-style Search Input (Desktop XL+) */}
            <div className="hidden xl:block relative group">
              <div className="relative flex items-center">
                <Search className="absolute left-4 text-stone group-focus-within:text-bloodred transition-colors" size={16} strokeWidth={1.5} />
                <input 
                  type="text"
                  placeholder="SEARCH..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-stone/10 border border-stone/20 rounded-full pl-12 pr-6 py-2 text-[10px] uppercase tracking-widest font-bold text-alabaster outline-none focus:border-bloodred focus:ring-1 focus:ring-bloodred/20 w-48 transition-all"
                />
              </div>

              {/* Real-time Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-4 w-[400px] bg-charcoal/95 backdrop-blur-xl border border-bloodred/20 shadow-2xl z-[100] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-6 py-3 border-b border-stone/20 bg-stone/5 flex justify-between items-center">
                      <span className="text-[8px] uppercase tracking-[0.3em] text-stone font-bold">
                        Found {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length} Result(s)
                      </span>
                    </div>

                    {/* Results List */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {products
                        .filter(p => 
                          p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((product) => (
                          <Link 
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-stone/10 transition-colors border-b border-stone/10 last:border-0 group/item"
                          >
                            <div className="relative w-12 h-12 bg-stone/20 flex-shrink-0">
                              <Image 
                                src={product.mainImage} 
                                alt={product.name} 
                                fill 
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[10px] uppercase tracking-widest font-bold text-alabaster group-hover/item:text-bloodred transition-colors truncate">
                                {product.name}
                              </h4>
                              <p className="text-[9px] text-stone uppercase tracking-widest mt-0.5">{product.category}</p>
                            </div>
                            <div className="text-[10px] font-bold text-bloodred">
                              ${product.price}
                            </div>
                            <ArrowUpRight size={14} className="text-stone opacity-0 group-hover/item:opacity-100 transition-all" />
                          </Link>
                        ))
                      }
                      {products.filter(p => 
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.category.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="px-6 py-12 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-stone italic">No matches in current archive</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <Link 
                      href="/shop"
                      className="block px-6 py-4 bg-stone/5 hover:bg-bloodred hover:text-alabaster transition-all text-center text-[8px] uppercase tracking-[0.4em] font-bold text-stone"
                    >
                      View All Collection →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="text-alabaster/60 hover:text-bloodred transition-colors xl:hidden"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            
            {/* Auth Action */}
            <div className="hidden sm:block">
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-alabaster/60 hover:text-bloodred transition-colors"
                  title={`Logged in as ${user?.email}`}
                >
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              ) : (
                <Link 
                  href="/auth"
                  className="text-[10px] uppercase tracking-widest font-bold text-alabaster/60 hover:text-bloodred transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            <button 
              onClick={toggleCart}
              className="relative group text-alabaster/60 hover:text-bloodred transition-colors"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-bloodred text-alabaster text-[8px] flex items-center justify-center rounded-full">
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
              <button onClick={() => setIsOpen(false)} className="hover:text-bloodred transition-colors">
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
            </div>

            <div className="mt-auto pt-12 border-t border-stone/20 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-alabaster/40 mb-4">Inquiries</p>
                <p className="text-sm hover:text-bloodred transition-colors cursor-pointer">concierge@impulsive.com</p>
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
      {/* Mobile/Tablet Search Modal */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-charcoal/98 backdrop-blur-xl p-6 md:p-12 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <Logo variant="light" className="h-10 w-auto" />
              <button 
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-3 bg-stone/20 rounded-full hover:text-bloodred transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative mb-12">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-bloodred" size={24} />
              <input 
                autoFocus
                type="text"
                placeholder="SEARCH THE SYNDICATE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-stone/30 focus:border-bloodred text-2xl md:text-4xl font-serif text-alabaster pl-12 py-4 outline-none transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {products
                  .filter(p => 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    p.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 8)
                  .map((product) => (
                    <Link 
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setIsMobileSearchOpen(false)}
                      className="flex items-center gap-4 bg-stone/5 p-4 border border-stone/10 hover:border-bloodred transition-colors"
                    >
                      <div className="relative w-16 h-16 bg-stone/20 flex-shrink-0">
                        <Image src={product.mainImage} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-alabaster">{product.name}</h4>
                        <p className="text-[10px] text-bloodred font-bold">${product.price}</p>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

