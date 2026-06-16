'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/store/useProducts';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { products } = useProducts();

  const filteredProducts = query.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="pt-40 pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Search Header */}
        <div className="mb-20 max-w-4xl">
          <div className="relative flex items-center border-b-4 border-black pb-4">
            <Search className="absolute left-0 text-zinc-300" size={40} />
            <input 
              type="text"
              placeholder="SEARCH THE SYSTEM"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent pl-16 text-4xl md:text-6xl font-black uppercase tracking-tighter italic outline-none placeholder:text-zinc-100"
              autoFocus
            />
          </div>
          <p className="mt-8 text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400">
            {query.trim() === '' ? 'Enter keywords to filter the collection' : `${filteredProducts.length} Results for "${query}"`}
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {query.trim() !== '' && filteredProducts.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-zinc-100">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300">
              No results found. The system is empty for this query.
            </p>
          </div>
        )}

        {/* Popular Tags */}
        {query.trim() === '' && (
          <div className="mt-20">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-300 mb-8">Popular Filters</h3>
            <div className="flex flex-wrap gap-4">
              {['Performance', 'Bottoms', 'Accessories', 'Essentials', 'Trench', 'Cargo'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-6 py-2 border-2 border-zinc-100 text-[10px] uppercase tracking-[0.2em] font-bold hover:border-black transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
