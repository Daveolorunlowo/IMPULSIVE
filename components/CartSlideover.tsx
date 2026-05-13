'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useCurrency } from '@/store/useCurrency';
import Image from 'next/image';
import Link from 'next/link';

export default function CartSlideover() {
  const { isOpen, toggleCart, items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { formatPrice } = useCurrency();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[100]"
          />

          {/* Slide-over */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-charcoal text-alabaster z-[101] flex flex-col shadow-2xl border-l border-bloodred/20"
          >
            {/* Header */}
            <div className="p-8 border-b border-bloodred/20 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif text-alabaster">Your Bag</h2>
                <span className="text-[10px] uppercase tracking-widest text-stone font-bold">{items.length} Items Selected</span>
              </div>
              <button onClick={toggleCart} className="p-2 hover:rotate-90 transition-transform text-alabaster/40 hover:text-bloodred">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={48} strokeWidth={1} className="text-stone/40 mb-6" />
                  <p className="text-lg font-serif text-alabaster/30 italic text-balance">The bag is waiting to be filled.</p>
                </div>
              ) : (
                items.map((item) => {
                  const cartItemId = `${item.id}-${item.selectedSize}-${item.selectedColor.name}`;
                  return (
                    <div key={cartItemId} className="flex gap-6 group">
                      <div className="relative w-24 h-32 bg-[#F5F5F3] overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <h3 className="text-sm font-serif text-alabaster">{item.name}</h3>
                          <div className="flex gap-3 text-[9px] uppercase tracking-widest font-bold text-stone">
                            <span>{item.selectedSize}</span>
                            <span>/</span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.selectedColor.hex }} />
                              {item.selectedColor.name}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-bloodred mt-2">{formatPrice(item.price)}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-alabaster/20 bg-charcoal">
                            <button 
                              onClick={() => updateQuantity(cartItemId, item.quantity - 1)}
                              className="p-1.5 hover:bg-bloodred hover:text-alabaster transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(cartItemId, item.quantity + 1)} 
                              className="p-1.5 hover:bg-bloodred hover:text-alabaster transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(cartItemId)} 
                            className="text-alabaster/20 hover:text-bloodred transition-colors"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-bloodred/20 bg-charcoal">
                <div className="flex justify-between items-baseline mb-8">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-stone">Subtotal</span>
                  <span className="text-3xl font-serif text-bloodred">{formatPrice(totalPrice())}</span>
                </div>
                <div className="space-y-4">
                  <Link 
                    href="/checkout" 
                    onClick={toggleCart}
                    className="block w-full bg-bloodred text-alabaster py-4 text-center text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-alabaster hover:text-charcoal transition-colors"
                  >
                    Checkout Now
                  </Link>
                  <Link 
                    href="/cart" 
                    onClick={toggleCart}
                    className="block w-full text-center py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-alabaster/40 hover:text-bloodred transition-colors"
                  >
                    View Shopping Bag
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
