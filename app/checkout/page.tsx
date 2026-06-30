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
  ChevronRight, ShieldCheck, Truck, CreditCard,
  Loader2, User, MapPin, Phone, Mail, Globe, ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { calculateShipping } from '@/lib/utils';

/* ── Field component defined OUTSIDE the page to keep a stable reference ── */
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
      <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-charcoal/50 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40" />
        <input
          type={type}
          value={value}
          onChange={onChange(field)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-4 bg-white border text-charcoal text-[11px] uppercase tracking-widest outline-none transition-all placeholder:text-charcoal/20 ${
            error
              ? 'border-bloodred/60 focus:border-bloodred'
              : 'border-charcoal/10 focus:border-charcoal'
          }`}
        />
      </div>
      {error && (
        <p className="text-[9px] text-bloodred mt-1 uppercase tracking-widest">{error}</p>
      )}
    </div>
  );
}

interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

const EMPTY_DETAILS: ContactDetails = {
  firstName: '', lastName: '', email: '',
  phone: '', address: '', city: '',
  state: '', country: ''
};

type Step = 'details' | 'review';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, promoCode, getDiscountAmount } = useCart();
  const { formatPrice, currency } = useCurrency();
  const { user } = useAuth();
  const router = useRouter();
  const { createOrder } = useOrders();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [step, setStep] = useState<Step>('details');
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

  /* ── Mounted check loading state ── */
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] pt-40 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-charcoal mb-4" size={24} />
        <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 font-bold">Securing checkout session...</span>
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
      'firstName', 'lastName', 'email', 'phone',
      'address', 'city', 'state', 'country'
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

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep('review');
  };

  const handleCheckout = async () => {
    if (!user) return;
    setIsProcessing(true);

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
      fullName: `${details.firstName} ${details.lastName}`,
      address: details.address,
      city: details.city,
      country: details.country,
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

    // Save order locally first so it can be managed by staff and tracked by client
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
          shippingAddress: details,
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
      <div className="min-h-screen pt-40 flex flex-col items-center justify-center px-6 bg-alabaster">
        <h1 className="text-4xl font-serif text-charcoal mb-8">Your bag is empty.</h1>
        <Link href="/shop" className="btn-luxury px-12 py-4 text-xs uppercase tracking-widest">
          Return to Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#F8F8F6]">
      {/* ── Step indicator ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <div className="flex items-center gap-4">
          {(['details', 'review'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => s === 'details' && setStep('details')}
                className={`flex items-center gap-3 group ${step === s ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  step === s
                    ? 'bg-charcoal border-charcoal text-alabaster'
                    : i < (['details', 'review'] as Step[]).indexOf(step)
                      ? 'bg-bloodred border-bloodred text-alabaster'
                      : 'border-charcoal/20 text-charcoal/30'
                }`}>{i + 1}</div>
                <span className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-colors ${
                  step === s ? 'text-charcoal' : 'text-charcoal/30'
                }`}>
                  {s === 'details' ? 'Contact & Shipping' : 'Review & Pay'}
                </span>
              </button>
              {i === 0 && <div className="flex-1 h-px bg-charcoal/10 max-w-16" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-5 gap-16">

        {/* ── Left: Form / Review ───────────────────────────────────── */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Contact & Shipping ─────────────────────────── */}
            {step === 'details' && (
              <motion.form
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleContinue}
                className="space-y-10"
              >
                {/* Contact */}
                <div>
                  <h2 className="text-2xl font-serif text-charcoal mb-6 flex items-center gap-3">
                    <User size={20} strokeWidth={1} /> Contact Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="First Name" field="firstName" icon={User} placeholder="David" half value={details.firstName} error={errors.firstName} onChange={set} />
                    <Field label="Last Name" field="lastName" icon={User} placeholder="Osei" half value={details.lastName} error={errors.lastName} onChange={set} />
                    <Field label="Email Address" field="email" type="email" icon={Mail} placeholder="you@email.com" value={details.email} error={errors.email} onChange={set} />
                    <Field label="Phone Number" field="phone" type="tel" icon={Phone} placeholder="+234 900 000 0000" value={details.phone} error={errors.phone} onChange={set} />
                  </div>
                </div>

                {/* Shipping */}
                <div>
                  <h2 className="text-2xl font-serif text-charcoal mb-6 flex items-center gap-3">
                    <MapPin size={20} strokeWidth={1} /> Shipping Address
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Street Address" field="address" icon={MapPin} placeholder="12 Instinct Ave" value={details.address} error={errors.address} onChange={set} />
                    <Field label="City" field="city" icon={MapPin} placeholder="Lagos" half value={details.city} error={errors.city} onChange={set} />
                    <Field label="State / Province" field="state" icon={MapPin} placeholder="Lagos State" half value={details.state} error={errors.state} onChange={set} />
                    <Field label="Country" field="country" icon={Globe} placeholder="Nigeria" value={details.country} error={errors.country} onChange={set} />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-charcoal text-alabaster py-5 flex items-center justify-center gap-4 hover:bg-bloodred transition-all group text-[10px] uppercase tracking-[0.4em] font-bold"
                >
                  Continue to Review
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            )}

            {/* STEP 2 — Review & Pay ───────────────────────────────── */}
            {step === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                <button
                  onClick={() => setStep('details')}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-charcoal/40 hover:text-charcoal transition-colors"
                >
                  <ArrowLeft size={14} /> Edit Details
                </button>

                {/* Confirmed Details */}
                <div className="bg-white border border-charcoal/8 p-8 space-y-6">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-bloodred">Shipping To</h3>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-1">Name</p>
                      <p className="font-bold text-charcoal">{details.firstName} {details.lastName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-1">Contact</p>
                      <p className="font-bold text-charcoal">{details.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-1">Address</p>
                      <p className="font-bold text-charcoal">
                        {details.address}, {details.city}, {details.state}, {details.country}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-1">Email</p>
                      <p className="font-bold text-charcoal">{details.email}</p>
                    </div>
                  </div>
                </div>

                {/* Cart items */}
                <div className="space-y-6">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-charcoal/50">Order Items</h3>
                  {items.map(item => (
                    <div key={item.id} className="flex gap-5 items-center bg-white border border-charcoal/8 p-4">
                      <div className="relative w-16 h-20 flex-shrink-0 bg-charcoal/5">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-widest text-charcoal truncate">{item.name}</p>
                        <p className="text-[10px] text-charcoal/40 uppercase tracking-widest mt-1">
                          {item.selectedSize} · {item.selectedColor.name} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-serif text-bloodred flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Pay button */}
                {generalError && (
                  <div className="text-bloodred text-[10px] uppercase tracking-widest text-center">
                    {generalError}
                  </div>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-bloodred hover:bg-charcoal text-alabaster py-6 flex items-center justify-center gap-4 transition-all group text-[10px] uppercase tracking-[0.4em] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <><Loader2 size={16} className="animate-spin" /> Initializing Payment...</>
                  ) : (
                    <><CreditCard size={16} /> Complete Order · {formatPrice(totalPrice() - getDiscountAmount() + shippingFee)}</>
                  )}
                </button>

                <p className="text-[9px] text-charcoal/30 text-center">
                  Secured by Paystack · End-to-end encrypted · No card details stored.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Order summary (sticky) ─────────────────────────── */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="sticky top-32 space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-charcoal/50">Order Summary</h3>

            {items.map(item => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative w-16 h-20 flex-shrink-0 bg-charcoal/5">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-charcoal text-alabaster rounded-full text-[9px] flex items-center justify-center font-bold">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-charcoal truncate">{item.name}</p>
                  <p className="text-[10px] text-charcoal/40 uppercase tracking-widest">{item.selectedSize}</p>
                </div>
                <p className="text-sm font-serif text-charcoal flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}

            <div className="border-t border-charcoal/8 pt-6 space-y-3">
              <div className="flex justify-between text-[11px] text-charcoal/40 uppercase tracking-widest">
                <span>Subtotal</span><span>{formatPrice(totalPrice())}</span>
              </div>
              {promoCode && (
                <div className="flex justify-between text-[11px] text-bloodred uppercase tracking-widest">
                  <span>Discount ({promoCode})</span><span>-{formatPrice(getDiscountAmount())}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-charcoal/40 uppercase tracking-widest">
                <span>Shipping</span>
                <span>
                  {details.state.trim()
                    ? formatPrice(shippingFee)
                    : 'Calculated at payment'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-charcoal/8">
                <span className="text-sm uppercase tracking-[0.3em] font-bold text-charcoal">Total</span>
                <span className="text-2xl font-serif text-charcoal">
                  {formatPrice(totalPrice() - getDiscountAmount() + shippingFee)}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {[
                { icon: ShieldCheck, text: 'Secure encrypted checkout' },
                { icon: Truck, text: 'Global express shipping' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-[10px] text-charcoal/40 uppercase tracking-widest">
                  <Icon size={14} strokeWidth={1.5} className="text-bloodred flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
