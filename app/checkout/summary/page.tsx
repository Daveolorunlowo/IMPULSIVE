'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/store/useCart';
import { useCurrency } from '@/store/useCurrency';
import { useAuth } from '@/store/useAuth';
import { useOrders } from '@/store/useOrders';
import { useCheckout } from '@/store/useCheckout';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, Loader2, Tag, X, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { calculateShipping } from '@/lib/utils';

export default function CheckoutSummaryPage() {
  const { items, totalPrice, promoCode, getDiscountAmount, applyPromoCode, removePromoCode } = useCart();
  const { formatPrice, currency } = useCurrency();
  const { user } = useAuth();
  const router = useRouter();
  const { createOrder } = useOrders();
  const { details } = useCheckout();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const shippingFee = calculateShipping(details.state);

  const [generalError, setGeneralError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // If no shipping details, redirect back to checkout
  useEffect(() => {
    if (mounted && !details.fullName) {
      router.push('/checkout');
    }
  }, [mounted, details, router]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoMessage(null);
    try {
      const success = await applyPromoCode(promoInput.toUpperCase());
      if (success) {
        setPromoMessage({ text: 'Promo applied', type: 'success' });
        setPromoInput('');
      } else {
        setPromoMessage({ text: 'Invalid promo code', type: 'error' });
      }
    } catch (err) {
      setPromoMessage({ text: 'Error applying code', type: 'error' });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setGeneralError('Please log in to continue.');
      return;
    }
    setIsProcessing(true);
    setGeneralError('');

    let token = '';
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        token = session.access_token;
      }
    } catch (e) {
      console.warn('Failed to retrieve session token:', e);
    }

    const generatedOrderId = `IMP-${Date.now()}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
    const currentCurrency = useCurrency.getState().currency;
    const convert = useCurrency.getState().convertPrice;

    const localOrderData = {
      id: generatedOrderId,
      email: details.email,
      fullName: details.fullName,
      address: details.address,
      city: details.city,
      country: 'Nigeria',
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: convert(item.price),
        quantity: item.quantity,
        image: item.image,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        customText: item.customText
      })),
      totalPrice: convert(totalPrice() - getDiscountAmount() + shippingFee),
      currency: currentCurrency,
    };

    createOrder(localOrderData);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          customerId: user.id,
          email: details.email,
          totalPrice: convert(totalPrice() - getDiscountAmount() + shippingFee),
          currency: currentCurrency,
          promoCode: useCart.getState().promoCode,
          shippingAddress: { ...details, country: 'Nigeria' },
          items: items.map(item => ({
            variantId: item.id,
            productId: item.id,
            quantity: item.quantity,
            claimedPrice: convert(item.price),
            customText: item.customText,
          })),
        }),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch(e) {}
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL missing from response.');
      }
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setGeneralError(err.message);
      setIsProcessing(false);
    }
  };

  if (!mounted || !details.fullName) {
    return (
      <div className="h-screen w-full bg-[#E5E5E2] flex items-center justify-center">
        <Loader2 className="animate-spin text-charcoal" size={24} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#E5E5E2]">
        <h1 className="text-3xl font-serif text-charcoal mb-6">Your bag is empty.</h1>
        <Link href="/shop" className="text-[10px] uppercase tracking-[0.3em] font-bold text-charcoal/50 hover:text-charcoal transition-colors border-b border-charcoal pb-1">
          Return to Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#E5E5E2] flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Decorative background blur */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-bloodred/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-charcoal/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Centered Floating Card */}
      <div className="w-full max-w-[500px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden max-h-[95vh] relative z-10">
        
        <div className="p-8 md:p-12 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <Link href="/checkout" className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-charcoal/40 hover:text-charcoal transition-colors mb-8">
            <ArrowLeft size={12} /> Edit Shipping Details
          </Link>

          <h3 className="text-2xl font-serif text-charcoal mb-8 tracking-tight">Order Summary</h3>

          <div className="flex-1 space-y-5">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative w-14 h-16 flex-shrink-0 bg-white rounded-md overflow-hidden border border-charcoal/5">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-charcoal text-alabaster rounded-full text-[8px] flex items-center justify-center font-bold">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-charcoal truncate">{item.name}</p>
                  <p className="text-[9px] text-charcoal/40 uppercase tracking-widest mt-0.5">{item.selectedSize}</p>
                </div>
                <p className="text-xs font-serif text-charcoal flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-charcoal/5">
            {!promoCode ? (
              <form onSubmit={handleApplyPromo} className="mb-6 relative">
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full bg-[#F9F9F8] border border-charcoal/10 rounded-full pl-5 pr-20 py-3 text-[10px] tracking-widest text-charcoal outline-none focus:border-bloodred/40 transition-all placeholder:text-charcoal/20"
                />
                <button
                  type="submit"
                  disabled={promoLoading || !promoInput.trim()}
                  className="absolute right-1 top-1 bottom-1 bg-charcoal text-alabaster px-4 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold disabled:opacity-30 hover:bg-bloodred transition-all"
                >
                  {promoLoading ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Apply'}
                </button>
                <AnimatePresence>
                  {promoMessage && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`text-[9px] uppercase tracking-widest flex items-center gap-1.5 mt-2 ml-4 ${promoMessage.type === 'error' ? 'text-bloodred' : 'text-green-600'}`}
                    >
                      {promoMessage.type === 'error' ? <X size={10} /> : <Tag size={10} />}
                      {promoMessage.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="mb-6 flex justify-between items-center bg-bloodred/5 border border-bloodred/10 rounded-full px-5 py-3"
              >
                <div className="flex items-center gap-2">
                  <Tag size={12} className="text-bloodred" />
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-bloodred">{promoCode}</span>
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); removePromoCode(); setPromoMessage(null); }}
                  className="text-[9px] uppercase tracking-widest text-charcoal/40 hover:text-bloodred transition-colors flex items-center gap-1"
                >
                  Remove <X size={10} />
                </button>
              </motion.div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-charcoal/40 uppercase tracking-widest font-medium">
                <span>Subtotal</span><span>{formatPrice(totalPrice())}</span>
              </div>
              {promoCode && (
                <div className="flex justify-between text-[10px] text-bloodred uppercase tracking-widest font-medium">
                  <span>Discount</span><span>-{formatPrice(getDiscountAmount())}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] text-charcoal/40 uppercase tracking-widest font-medium">
                <span>Shipping</span>
                <span>{details.state.trim() ? formatPrice(shippingFee) : 'Calculated next'}</span>
              </div>
              <div className="flex justify-between items-end pt-4 mt-4 border-t border-charcoal/5">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-charcoal">Total</span>
                <span className="text-2xl font-serif text-charcoal">
                  {formatPrice(totalPrice() - getDiscountAmount() + shippingFee)}
                </span>
              </div>
            </div>

            {generalError && (
              <div className="text-bloodred text-[10px] uppercase tracking-widest text-center mt-6 font-bold">
                {generalError}
              </div>
            )}
            
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full mt-6 bg-charcoal hover:bg-bloodred text-alabaster py-5 rounded-xl flex items-center justify-center gap-3 transition-all group text-[10px] uppercase tracking-[0.3em] font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-charcoal/10 hover:shadow-bloodred/20"
            >
              {isProcessing ? (
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : (
                <><CreditCard size={14} /> Pay {formatPrice(totalPrice() - getDiscountAmount() + shippingFee)}</>
              )}
            </button>

            <div className="flex justify-center items-center gap-4 mt-6">
              <div className="flex items-center gap-1.5 text-[8px] text-charcoal/30 uppercase tracking-widest font-bold">
                <ShieldCheck size={12} /> Encrypted
              </div>
              <div className="w-1 h-1 rounded-full bg-charcoal/10" />
              <div className="flex items-center gap-1.5 text-[8px] text-charcoal/30 uppercase tracking-widest font-bold">
                <Truck size={12} /> Global
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
