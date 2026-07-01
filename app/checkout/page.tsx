'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/store/useCart';
import { useCurrency } from '@/store/useCurrency';
import { useAuth } from '@/store/useAuth';
import { useOrders } from '@/store/useOrders';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Truck, CreditCard,
  Loader2, User, MapPin, Phone, Mail,
  Tag, X, ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { calculateShipping } from '@/lib/utils';

/* ── Minimalist Field Component ── */
interface FieldProps {
  label: string;
  field: keyof ContactDetails;
  type?: string;
  icon: React.ElementType;
  placeholder: string;
  half?: boolean;
  value: string;
  error?: string;
  onChange: (field: keyof ContactDetails) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Field({ label, field, type = 'text', icon: Icon, placeholder, half = false, value, error, onChange }: FieldProps) {
  return (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative group">
        <Icon size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-bloodred' : 'text-charcoal/20 group-focus-within:text-charcoal'}`} />
        <input
          type={type}
          value={value}
          onChange={onChange(field)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3.5 bg-transparent border-b-2 text-charcoal text-[11px] font-medium outline-none transition-all placeholder:text-charcoal/10 ${
            error
              ? 'border-bloodred/40 focus:border-bloodred'
              : 'border-charcoal/5 focus:border-charcoal'
          }`}
        />
      </div>
      {error && (
        <p className="text-[9px] text-bloodred mt-1 font-semibold tracking-wide ml-1">{error}</p>
      )}
    </div>
  );
}

interface ContactDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

const EMPTY_DETAILS: ContactDetails = {
  fullName: '', email: '',
  phone: '', address: '', city: '', state: ''
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, promoCode, getDiscountAmount, applyPromoCode, removePromoCode } = useCart();
  const { formatPrice, currency } = useCurrency();
  const { user } = useAuth();
  const router = useRouter();
  const { createOrder } = useOrders();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [details, setDetails] = useState<ContactDetails>({
    ...EMPTY_DETAILS,
    email: user?.email ?? ''
  });

  const shippingFee = calculateShipping(details.state);

  useEffect(() => {
    if (mounted && user) {
      setDetails(prev => ({ ...prev, email: prev.email || user.email || '' }));
    }
  }, [mounted, user]);

  const [errors, setErrors] = useState<Partial<ContactDetails>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

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

  /* ── Mounted check loading state ── */
  if (!mounted) {
    return (
      <div className="h-screen w-full bg-[#E5E5E2] flex items-center justify-center">
        <Loader2 className="animate-spin text-charcoal" size={24} />
      </div>
    );
  }

  /* ── Helpers ─────────────────────────────────────────────────────── */
  const set = (field: keyof ContactDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setDetails(prev => ({ ...prev, [field]: e.target.value }));
      setErrors(prev => ({ ...prev, [field]: '' }));
    };

  const validate = (): boolean => {
    const required: (keyof ContactDetails)[] = [
      'fullName', 'email', 'phone', 'address', 'city', 'state'
    ];
    const newErrors: Partial<ContactDetails> = {};
    required.forEach(f => {
      if (!details[f].trim()) newErrors[f] = 'Required';
    });
    if (details.email && !/\S+@\S+\.\S+/.test(details.email))
      newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validate()) return;
    if (!user) return;
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

  /* ── Empty cart state ─────────────────────────────────────────────── */
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
    <div className="h-screen w-full bg-[#E5E5E2] flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Decorative background blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bloodred/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-charcoal/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Centered Floating Card */}
      <div className="w-full max-w-[1000px] bg-white shadow-2xl rounded-2xl flex flex-col md:flex-row overflow-hidden max-h-full relative z-10">
        
        {/* ── Left: Form ───────────────────────────────────── */}
        <div className="flex-[3] p-8 md:p-12 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <Link href="/cart" className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-charcoal/40 hover:text-charcoal transition-colors mb-10">
            <ArrowLeft size={12} /> Back to Cart
          </Link>

          <h2 className="text-3xl font-serif text-charcoal mb-8 tracking-tight">Checkout</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <Field label="Full Name" field="fullName" icon={User} placeholder="David Osei" value={details.fullName} error={errors.fullName} onChange={set} />
              <Field label="Email Address" field="email" type="email" icon={Mail} placeholder="you@email.com" value={details.email} error={errors.email} onChange={set} />
              <Field label="Phone Number" field="phone" type="tel" icon={Phone} placeholder="+234 900 000 0000" value={details.phone} error={errors.phone} onChange={set} />
              
              <div className="col-span-2 pt-2">
                <Field label="Delivery Address" field="address" icon={MapPin} placeholder="12 Instinct Ave" value={details.address} error={errors.address} onChange={set} />
              </div>
              <Field label="City" field="city" icon={MapPin} placeholder="Lagos" half value={details.city} error={errors.city} onChange={set} />
              <Field label="State / Province" field="state" icon={MapPin} placeholder="Lagos State" half value={details.state} error={errors.state} onChange={set} />
            </div>
          </div>
        </div>

        {/* ── Right: Order summary & Pay Button ─────────────────────────── */}
        <div className="flex-[2] bg-[#F9F9F8] border-l border-charcoal/5 p-8 md:p-12 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-charcoal/40 mb-6">Order Summary</h3>

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
                  className="w-full bg-white border border-charcoal/10 rounded-full pl-5 pr-20 py-3 text-[10px] uppercase tracking-widest text-charcoal outline-none focus:border-bloodred/40 transition-all placeholder:text-charcoal/20"
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
