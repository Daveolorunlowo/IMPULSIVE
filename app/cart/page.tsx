'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/useCart';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  return (
    <div className="pt-40 pb-40 min-h-screen bg-alabaster">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-24 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold block mb-4">Your Shopping Bag</span>
          <h1 className="text-6xl md:text-8xl font-serif text-charcoal">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-12">
            <AnimatePresence mode="popLayout">
              {items.length > 0 ? (
                items.map((item) => {
                  const cartItemId = `${item.id}-${item.selectedSize}-${item.selectedColor.name}`;
                  return (
                    <motion.div
                      key={cartItemId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col md:flex-row gap-12 border-b border-stone/10 pb-12 group"
                    >
                      <div className="relative aspect-[3/4] w-full md:w-48 bg-[#F5F5F3] overflow-hidden">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-widest text-stone font-bold">Verified Product</span>
                            <h3 className="text-3xl font-serif text-charcoal">{item.name}</h3>
                            <div className="flex gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone mt-2">
                              <span>Size: {item.selectedSize}</span>
                              <span className="flex items-center gap-2">
                                Color: 
                                <div className="w-3 h-3 rounded-full border border-stone/20" style={{ backgroundColor: item.selectedColor.hex }} />
                                {item.selectedColor.name}
                              </span>
                            </div>
                            <p className="text-sm text-charcoal/40 font-light mt-6">Price: ${item.price.toFixed(2)}</p>
                          </div>
                          <button 
                            onClick={() => removeItem(cartItemId)}
                            className="p-3 text-charcoal/20 hover:text-charcoal transition-colors"
                          >
                            <Trash2 size={20} strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex justify-between items-end mt-12">
                          <div className="flex items-center border border-charcoal/10 bg-white">
                            <button 
                              onClick={() => updateQuantity(cartItemId, item.quantity - 1)}
                              className="p-4 hover:bg-stone/10 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-12 text-center font-semibold text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                              className="p-4 hover:bg-stone/10 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-semibold text-charcoal/40 block uppercase tracking-widest mb-1">Subtotal</span>
                            <span className="text-3xl font-serif text-charcoal">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-40 text-center border border-dashed border-stone/20 rounded-sm">
                  <p className="text-2xl font-serif text-charcoal/20 mb-8 italic">Your bag is currently empty.</p>
                  <Link 
                    href="/shop" 
                    className="btn-luxury"
                  >
                    Return To Shop
                  </Link>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-12 shadow-sm border border-stone/10 sticky top-40">
              <h2 className="text-3xl font-serif text-charcoal mb-12 pb-6 border-b border-stone/10">Order Summary</h2>
              
              <div className="space-y-6 mb-12">
                <div className="flex justify-between text-xs font-semibold text-charcoal/40 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>${totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-charcoal/40 uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-stone">Complimentary</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-charcoal/40 uppercase tracking-widest">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="pt-8 border-t border-stone/10 flex justify-between items-baseline">
                  <span className="text-lg font-serif text-charcoal">Estimated Total</span>
                  <span className="text-5xl font-serif text-charcoal">${totalPrice().toFixed(2)}</span>
                </div>
              </div>

              <button 
                disabled={items.length === 0}
                className="w-full btn-luxury flex items-center justify-center gap-6 group disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Checkout Now <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
              
              <p className="mt-8 text-[10px] text-charcoal/30 text-center leading-relaxed font-light italic">
                Secure SSL Encrypted Checkout. We accept all major credit cards and digital payment protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
