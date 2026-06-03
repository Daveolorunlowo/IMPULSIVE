'use client';

import React, { useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, ArrowLeft, Clipboard } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/store/useCart';

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('reference');

  useEffect(() => {
    // Clear cart on successful checkout land
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-xl w-full text-center space-y-12">
      
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative inline-block"
      >
        <div className="absolute inset-0 bg-bloodred/20 blur-3xl rounded-full" />
        <div className="relative w-32 h-32 bg-stone/20 rounded-full flex items-center justify-center border border-bloodred/30">
          <CheckCircle2 size={64} className="text-bloodred" strokeWidth={1} />
        </div>
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-serif text-alabaster leading-tight">Order Confirmed.</h1>
        <p className="text-alabaster/40 text-[10px] uppercase tracking-[0.4em] font-bold">Welcome to the Inner Circle.</p>
      </div>

      {orderId && (
        <div className="bg-[#111] border border-white/5 p-6 space-y-2 rounded-sm text-center">
          <span className="text-[8px] uppercase tracking-widest text-stone block">Your Order Reference Code</span>
          <p className="font-mono text-lg font-bold text-bloodred tracking-wider flex items-center justify-center gap-3">
            {orderId}
          </p>
          <p className="text-[9px] text-stone uppercase tracking-widest">Use this code to track shipment progress</p>
        </div>
      )}

      <div className="bg-stone/5 border border-stone/10 p-8 rounded-sm space-y-6">
        <div className="flex items-center gap-6 text-left mb-6">
          <div className="w-12 h-12 bg-bloodred/10 rounded-full flex items-center justify-center text-bloodred">
            <Package size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-alabaster">Processing Shipment</h4>
            <p className="text-[10px] text-alabaster/40 font-light mt-1">Your archival pieces are being curated for dispatch.</p>
          </div>
        </div>
        
        <div className="pt-6 border-t border-alabaster/5 flex flex-col gap-4">
          {orderId && (
            <Link 
              href={`/track-order?code=${orderId}`} 
              className="w-full bg-bloodred hover:bg-alabaster hover:text-charcoal text-alabaster py-4 uppercase tracking-[0.3em] text-[10px] font-bold transition-all flex items-center justify-center gap-4"
            >
              Track Your Package
              <ArrowRight size={14} />
            </Link>
          )}
          
          <Link 
            href="/shop" 
            className="w-full border border-white/10 hover:border-bloodred hover:text-bloodred text-alabaster py-4 uppercase tracking-[0.3em] text-[10px] font-bold transition-all flex items-center justify-center gap-4"
          >
            Continue Shopping
          </Link>
          
          <Link 
            href="/" 
            className="w-full text-alabaster/40 hover:text-alabaster py-2 uppercase tracking-[0.3em] text-[8px] font-bold transition-all flex items-center justify-center gap-4"
          >
            <ArrowLeft size={12} />
            Return Home
          </Link>
        </div>
      </div>

      <p className="text-[10px] text-alabaster/20 font-light">
        A confirmation email has been sent to your registered address. Track your movement status in the logistics tracker.
      </p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center px-6 pt-20">
      <Suspense fallback={
        <div className="text-center text-stone uppercase tracking-widest text-xs animate-pulse">
          Completing Order Transaction...
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
