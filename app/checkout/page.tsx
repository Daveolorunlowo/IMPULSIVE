'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { useCheckout, ContactDetails } from '@/store/useCheckout';
import { useRouter } from 'next/navigation';
import { Loader2, User, MapPin, Phone, Mail, ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { details, updateDetail, setDetails } = useCheckout();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && !details.email) {
      updateDetail('email', user.email);
    }
  }, [mounted, user, details.email, updateDetail]);

  const [errors, setErrors] = useState<Partial<ContactDetails>>({});

  if (!mounted) {
    return (
      <div className="h-screen w-full bg-[#E5E5E2] flex items-center justify-center">
        <Loader2 className="animate-spin text-charcoal" size={24} />
      </div>
    );
  }

  const set = (field: keyof ContactDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      updateDetail(field, e.target.value);
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

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      router.push('/checkout/summary');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#E5E5E2] flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Decorative background blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bloodred/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-charcoal/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Centered Floating Card */}
      <div className="w-full max-w-[600px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden max-h-[95vh] relative z-10">
        
        <div className="p-8 md:p-12 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <Link href="/cart" className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-charcoal/40 hover:text-charcoal transition-colors mb-10">
            <ArrowLeft size={12} /> Back to Cart
          </Link>

          <h2 className="text-3xl font-serif text-charcoal mb-8 tracking-tight">Shipping Details</h2>
          
          <form onSubmit={handleContinue} className="space-y-10">
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

            <button
              type="submit"
              className="w-full mt-6 bg-charcoal hover:bg-bloodred text-alabaster py-5 rounded-xl flex items-center justify-center gap-3 transition-all group text-[10px] uppercase tracking-[0.3em] font-bold shadow-lg shadow-charcoal/10 hover:shadow-bloodred/20"
            >
              Continue to Summary <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
