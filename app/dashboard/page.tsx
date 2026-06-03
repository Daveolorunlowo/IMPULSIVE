'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { useCurrency } from '@/store/useCurrency';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, LogOut, Award, User, Clock, Sparkles, MessageSquare, Copy, Check, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, logout, trackActivity } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  
  const [preferredSize, setPreferredSize] = useState('M');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('impulsive-pref-size');
      if (saved) setPreferredSize(saved);
    }
  }, []);

  const handleUpdateSize = (size: string) => {
    setPreferredSize(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('impulsive-pref-size', size);
    }
    trackActivity(`Updated sizing preference to size ${size}`);
  };

  const handleLogout = () => {
    trackActivity('User signed out of portal');
    logout();
    router.push('/');
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText('INSTINCT');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-charcoal text-alabaster flex flex-col items-center justify-center px-6 text-center">
        <div className="border border-bloodred/20 bg-[#0A0A0A] p-10 max-w-md space-y-6 rounded-sm">
          <ShieldAlert size={40} className="text-bloodred mx-auto" />
          <div className="space-y-1">
            <h1 className="text-2xl font-serif text-alabaster">SIGN IN REQUIRED</h1>
            <p className="text-[9px] uppercase tracking-widest text-stone font-bold">
              MEMBER ACCESS CONTROL
            </p>
          </div>
          <p className="text-xs text-alabaster/60 leading-relaxed font-light">
            Please sign in to view your profile dashboard, manage size profiles, and retrieve active styling codes.
          </p>
          <Link 
            href="/auth?redirect=/dashboard"
            className="w-full bg-bloodred hover:bg-white text-alabaster hover:text-charcoal py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center border border-bloodred/25 rounded-sm"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-alabaster pt-40 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        
        {/* Simplified Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-8 gap-6">
          <div className="space-y-1">
            <span className="text-[8px] uppercase tracking-[0.3em] font-mono text-bloodred font-bold">
              Client Portal // Session Active
            </span>
            <h1 className="text-4xl font-serif text-alabaster">
              My Profile
            </h1>
            <p className="text-xs text-alabaster/55 font-light">
              Signed in as <span className="text-alabaster font-semibold">{user.email}</span>
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 border border-white/10 hover:border-bloodred text-alabaster/70 hover:text-bloodred px-4 py-2.5 transition-colors text-[9px] uppercase tracking-widest font-bold rounded-sm"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>

        {/* Simplified 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Account Details & Size Profile */}
          <div className="space-y-8">
            
            {/* Card 1: Membership & Rewards Summary */}
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-sm space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-stone font-bold">Rewards & Status</span>
                <Award size={18} className="text-bloodred" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-1">MEMBER LEVEL</span>
                  <p className="text-xl font-serif text-alabaster">Gold Tier</p>
                </div>
                <div>
                  <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-1">ACCUMULATED POINTS</span>
                  <p className="text-xl font-serif text-bloodred font-bold">250 Points</p>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[8px] uppercase tracking-widest text-stone font-bold">
                  <span>Progress to Diamond Tier</span>
                  <span>50 pts remaining</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-bloodred h-full rounded-full" style={{ width: '83.3%' }} />
                </div>
              </div>
            </div>

            {/* Card 2: Sizing Preferences */}
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-sm space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-stone font-bold block">Size Profile</span>
                  <p className="text-[8px] text-stone leading-tight font-light lowercase">
                    Select your sizing preference to quick-fill shop actions
                  </p>
                </div>
                <User size={18} className="text-bloodred" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-1">PREFERRED SIZE</span>
                  <p className="text-3xl font-serif text-alabaster">Size {preferredSize}</p>
                </div>
                <div className="flex gap-1.5">
                  {['XS', 'S', 'M', 'L', 'XL'].map((sz) => (
                    <button
                       key={sz}
                       onClick={() => handleUpdateSize(sz)}
                       className={`w-9 h-9 text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                         preferredSize === sz
                           ? 'bg-bloodred text-alabaster'
                           : 'border border-white/10 text-alabaster/60 hover:text-bloodred hover:border-bloodred'
                       }`}
                    >
                       {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Member Perks & Stylist Line */}
          <div className="space-y-8">

            {/* Card 3: Exclusive Member Codes & Drops */}
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-sm space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-stone font-bold">Member Perks</span>
                <Sparkles size={18} className="text-bloodred animate-pulse" />
              </div>
              
              <div className="space-y-4">
                {/* Promo Code Copy Item */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-sm">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-1">ACTIVE PROMO CODE (10% OFF)</span>
                    <span className="text-xs font-mono font-bold text-alabaster tracking-wider">INSTINCT</span>
                  </div>
                  <button
                    onClick={copyPromoCode}
                    className="flex items-center justify-center gap-2 border border-white/15 hover:border-bloodred hover:text-bloodred text-alabaster/70 text-[9px] uppercase tracking-widest font-bold py-2 px-3 rounded-sm transition-colors"
                  >
                    {copied ? (
                      <>
                        <ShieldCheck size={12} className="text-emerald-400" /> COPIED
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> COPY CODE
                      </>
                    )}
                  </button>
                </div>

                {/* Upcoming Drop Countdown */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-1">EARLY ACCESS CAPSULE</span>
                    <span className="text-xs font-sans text-alabaster font-semibold">Archive Cropped Hoodie</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-bloodred font-bold">
                    <Clock size={12} /> 02d: 14h: 42m
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Stylist Help Line */}
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-sm space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-stone font-bold">Direct Stylist Connection</span>
                <MessageSquare size={18} className="text-bloodred" />
              </div>
              <p className="text-xs font-light text-alabaster/60 leading-relaxed">
                Connect directly with our studio design team for bespoke fitting options, order modifications, or material advice.
              </p>
              <Link 
                href="https://wa.me/2349018389254" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full text-center bg-bloodred hover:bg-white text-alabaster hover:text-charcoal py-3.5 text-[9px] uppercase tracking-widest font-bold transition-all block rounded-sm border border-bloodred/20"
              >
                Chat with a Stylist
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
