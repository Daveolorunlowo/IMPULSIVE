'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/store/useWishlist';
import { products } from '@/lib/products';
import { useCurrency } from '@/store/useCurrency';
import { Trash2, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistClient() {
  const { items, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="pt-40 pb-40 min-h-screen bg-charcoal flex items-center justify-center text-alabaster">
        <div className="animate-pulse uppercase tracking-[0.2em] text-xs font-bold text-stone">
          Syncing Wishlist...
        </div>
      </div>
    );
  }

  // Resolve product objects from IDs
  const wishlistProducts = products.filter(p => items.includes(p.id));

  return (
    <div className="pt-40 pb-40 min-h-screen bg-charcoal text-alabaster">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <header className="mb-24 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold block mb-4">Your Curated Collection</span>
          <h1 className="text-6xl md:text-8xl font-serif text-alabaster tracking-tight">Wishlist</h1>
        </header>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
          <AnimatePresence mode="popLayout">
            {wishlistProducts.length > 0 ? (
              wishlistProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: idx * 0.05 }}
                  className="group relative"
                >
                  {/* Image container */}
                  <div className="relative aspect-[3/4] w-full bg-[#111111] overflow-hidden mb-8 border border-white/5">
                    <Link href={`/products/${product.slug}`}>
                      <Image 
                        src={product.mainImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      />
                    </Link>
                    
                    {/* Action buttons */}
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 right-4 z-20 w-10 h-10 bg-charcoal/80 hover:bg-bloodred backdrop-blur-md flex items-center justify-center rounded-full transition-colors border border-white/10 group-2"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={16} className="text-alabaster" />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone font-semibold">{product.category}</span>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-xl font-serif hover:text-bloodred transition-colors text-alabaster">{product.name}</h3>
                      </Link>
                      <p className="text-sm font-light text-alabaster/40">{formatPrice(product.price)}</p>
                    </div>

                    <Link 
                      href={`/products/${product.slug}`}
                      className="p-3 bg-white/5 hover:bg-bloodred transition-colors border border-white/10 flex items-center justify-center"
                      title="Select options"
                    >
                      <ShoppingBag size={16} className="text-alabaster" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : null}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {wishlistProducts.length === 0 && (
          <div className="py-60 text-center border border-dashed border-white/10 rounded-sm">
            <Heart size={48} className="mx-auto text-bloodred/20 mb-6 animate-pulse" />
            <p className="text-2xl font-serif text-alabaster/30 italic mb-8">Your wishlist is currently empty.</p>
            <Link 
              href="/shop" 
              className="px-10 py-5 bg-bloodred hover:bg-alabaster hover:text-charcoal transition-all text-alabaster uppercase tracking-[0.2em] text-[10px] font-bold"
            >
              Discover The Collection
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
