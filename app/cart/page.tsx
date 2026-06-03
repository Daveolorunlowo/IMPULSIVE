'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/useCart';
import { useCurrency } from '@/store/useCurrency';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    totalPrice, 
    promoCode, 
    getDiscountAmount, 
    applyPromoCode, 
    removePromoCode 
  } = useCart();
  const { formatPrice } = useCurrency();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="pt-40 pb-40 min-h-screen bg-alabaster flex items-center justify-center">
        <div className="text-stone animate-pulse uppercase tracking-[0.2em] text-xs font-bold">
          Loading Bag...
        </div>
      </div>
    );
  }
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(false);
    setPromoSuccess(false);
    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoSuccess(true);
      setPromoInput('');
    } else {
      setPromoError(true);
    }
  };

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
                  const cartItemId = `${item.id}-${item.selectedSize}-${item.selectedColor.name}-${item.customText || ''}`;
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
                                <div className={`w-3 h-3 rounded-full border border-stone/20 ${
                                  item.selectedColor.hex === '#800000' ? 'bg-[#800000]' : 
                                  item.selectedColor.hex === '#0A0A0A' ? 'bg-[#0A0A0A]' : 
                                  item.selectedColor.hex === '#F9F9F7' ? 'bg-[#F9F9F7]' : 'bg-stone'
                                }`} />
                                {item.selectedColor.name}
                              </span>
                            </div>
                            {item.customText && (
                              <div className="mt-4 bg-bloodred/10 border border-bloodred/25 px-3 py-1.5 inline-block text-[9px] font-mono text-bloodred tracking-wider font-bold">
                                STUDIO CUSTOM TEXT: "{item.customText}"
                              </div>
                            )}
                            <p className="text-sm text-charcoal/40 font-light mt-6">Price: {formatPrice(item.price)}</p>
                          </div>
                          <button 
                            onClick={() => removeItem(cartItemId)}
                            className="p-3 text-charcoal/20 hover:text-charcoal transition-colors"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 size={20} strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex justify-between items-end mt-12">
                          <div className="flex items-center border border-charcoal/10 bg-charcoal text-alabaster shadow-sm">
                            <button 
                              onClick={() => updateQuantity(cartItemId, item.quantity - 1)}
                              className="p-4 hover:bg-bloodred hover:text-alabaster transition-colors text-alabaster"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-12 text-center font-semibold text-sm text-alabaster">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                              className="p-4 hover:bg-bloodred hover:text-alabaster transition-colors text-alabaster"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-semibold text-charcoal/40 block uppercase tracking-widest mb-1">Subtotal</span>
                            <span className="text-3xl font-serif text-charcoal">{formatPrice(item.price * item.quantity)}</span>
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
            <div className="bg-white p-6 sm:p-10 md:p-12 shadow-sm border border-stone/10 sticky top-40 text-charcoal">
              <h2 className="text-2xl md:text-3xl font-serif text-charcoal mb-8 md:mb-12 pb-6 border-b border-stone/10">Order Summary</h2>
              
              <div className="space-y-6 mb-12">
                <div className="flex justify-between gap-4 text-xs font-semibold text-charcoal/40 uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span className="text-right">{formatPrice(totalPrice())}</span>
                </div>
                <div className="flex justify-between gap-4 text-xs font-semibold text-charcoal/40 uppercase tracking-wider">
                  <span>Shipping</span>
                  <span className="text-stone text-right">Complimentary</span>
                </div>
                <div className="flex justify-between gap-4 text-xs font-semibold text-charcoal/40 uppercase tracking-wider">
                  <span>Tax</span>
                  <span className="text-right">{formatPrice(0)}</span>
                </div>

                {promoCode ? (
                  <div className="flex flex-wrap justify-between items-center gap-3 text-xs font-semibold text-bloodred uppercase tracking-wider bg-bloodred/5 p-3 rounded-sm border border-bloodred/10">
                    <span>Discount ({promoCode})</span>
                    <div className="flex items-center gap-2">
                      <span>-{formatPrice(getDiscountAmount())}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          removePromoCode();
                          setPromoSuccess(false);
                        }} 
                        className="text-stone hover:text-bloodred p-1 font-bold underline underline-offset-2 transition-colors"
                        title="Remove code"
                      >
                        [Remove]
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="pt-8 border-t border-stone/10 flex flex-wrap justify-between items-center gap-4">
                  <span className="text-base sm:text-lg font-serif text-charcoal">Estimated Total</span>
                  <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal tracking-tight break-all">{formatPrice(totalPrice() - getDiscountAmount())}</span>
                </div>
              </div>

              {/* Promo Code Form */}
              {items.length > 0 && !promoCode && (
                <form onSubmit={handleApplyPromo} className="mb-8 pt-6 border-t border-stone/10">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ENTER PROMO CODE" 
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className={`flex-1 bg-alabaster border px-4 py-3 text-[10px] tracking-widest font-semibold text-charcoal focus:outline-none uppercase placeholder:text-stone/30 ${
                        promoError ? "border-bloodred text-bloodred" : "border-stone/20 focus:border-charcoal"
                      }`}
                    />
                    <button 
                      type="submit"
                      className="bg-charcoal text-alabaster px-6 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-bloodred transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[9px] uppercase tracking-widest text-bloodred font-bold mt-2">
                      Invalid Code. Try "INSTINCT" or "ARCHIVE10".
                    </p>
                  )}
                </form>
              )}

              {items.length > 0 ? (
                <Link 
                  href="/checkout"
                  className="w-full btn-luxury flex items-center justify-center gap-6 group"
                >
                  Checkout Now <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              ) : (
                <button 
                  disabled
                  className="w-full btn-luxury flex items-center justify-center gap-6 group disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Checkout Now <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              )}
              
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
