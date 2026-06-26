'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/store/useProducts';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['All', 'Signature', 'Archive', 'Essentials'];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { products } = useProducts();

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="pt-40 pb-40 min-h-screen bg-charcoal text-alabaster">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header - Minimal Luxury */}
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold block">Collection Archive</span>
            <h1 className="text-6xl md:text-8xl font-serif text-alabaster tracking-tight">The Inventory</h1>
          </div>
          
          {/* Categories - Minimal Pill Buttons */}
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 text-[10px] uppercase tracking-widest font-semibold border transition-all duration-500 ${
                  activeCategory === cat 
                    ? 'bg-bloodred border-bloodred text-alabaster shadow-lg shadow-bloodred/20' 
                    : 'border-alabaster/20 text-alabaster/40 hover:border-bloodred hover:text-bloodred'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Product Grid - Clean 4-Column */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-8 md:gap-x-12 gap-y-16 md:gap-y-24">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-60 text-center border-t border-stone/20">
            <p className="text-xl font-serif text-alabaster/30">
              No pieces found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
