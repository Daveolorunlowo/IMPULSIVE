'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrders, Order } from '@/store/useOrders';
import { useCurrency } from '@/store/useCurrency';
import { Search, Package, Truck, Compass, CheckCircle2, Calendar, Clipboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { key: 'Processing', label: 'Processing', desc: 'Garment queued for structural layout & custom printing.' },
  { key: 'Shipped', label: 'Shipped', desc: 'Handed over to carrier logisitics. Transit in progress.' },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Arrived at your local delivery hub.' },
  { key: 'Delivered', label: 'Delivered', desc: 'Parcel successfully hand-delivered.' }
];

export default function TrackClient() {
  const searchParams = useSearchParams();
  const { getOrderById, markOrderAsRead } = useOrders();
  const { formatPrice } = useCurrency();
  
  const formatOrderPrice = (amount: number, orderCurrency?: string) => {
    return `₦${Math.round(amount).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
  };

  const [orderCode, setOrderCode] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill order code if passed in URL query
  useEffect(() => {
    const code = searchParams.get('code') || searchParams.get('orderId');
    if (code) {
      setOrderCode(code);
      handleTrack(code);
    }
  }, [searchParams]);

  const handleTrack = (code: string) => {
    setErrorMsg('');
    setSearchedOrder(null);
    const cleanedCode = code.trim().toUpperCase();

    if (!cleanedCode) {
      setErrorMsg('Please enter a valid order reference code.');
      return;
    }

    const order = getOrderById(cleanedCode);
    if (order) {
      setSearchedOrder(order);
      markOrderAsRead(order.id);
    } else {
      setErrorMsg('No order found matching that reference. Please check and try again.');
    }
  };

  const getStepIndex = (status: Order['status']) => {
    return STEPS.findIndex(s => s.key === status);
  };

  return (
    <div className="pt-40 pb-40 min-h-screen bg-charcoal text-alabaster">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <header className="mb-16 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold block mb-4">Logistics Tracking Portal</span>
          <h1 className="text-5xl md:text-7xl font-serif text-alabaster">Track Order</h1>
        </header>

        {/* Search Bar */}
        <div className="bg-[#111] p-8 border border-white/5 shadow-xl mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" size={18} />
              <input
                type="text"
                placeholder="ENTER ORDER REFERENCE (E.G. IMP-12345)"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                className="w-full bg-stone/10 border border-white/10 text-alabaster placeholder:text-stone/40 px-12 py-4 outline-none focus:border-bloodred transition-colors text-[10px] uppercase tracking-[0.2em] font-semibold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTrack(orderCode);
                }}
              />
            </div>
            <button
              onClick={() => handleTrack(orderCode)}
              className="bg-bloodred hover:bg-alabaster hover:text-charcoal px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-bold transition-all"
            >
              Track Package
            </button>
          </div>
          {errorMsg && (
            <p className="text-[9px] uppercase tracking-widest text-bloodred font-bold mt-4">{errorMsg}</p>
          )}
        </div>

        {/* Search Results */}
        <AnimatePresence mode="wait">
          {searchedOrder ? (
            <motion.div
              key={searchedOrder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              {/* Status Header */}
              <div className="bg-[#111] border border-white/5 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-stone font-semibold">Order Reference</span>
                  <h2 className="text-2xl font-serif text-bloodred">{searchedOrder.id}</h2>
                  <p className="text-[10px] text-alabaster/40 uppercase tracking-widest mt-1">Placed on {new Date(searchedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-[9px] uppercase tracking-widest text-stone font-semibold">Current State</span>
                  <div className="text-xl font-serif text-alabaster mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-bloodred animate-ping" />
                    {searchedOrder.status}
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="bg-[#111] border border-white/5 p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 bg-bloodred h-full opacity-10" />
                
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred mb-12">Logistics Progress</h3>
                
                <div className="flex flex-col gap-12 relative z-10">
                  {STEPS.map((step, idx) => {
                    const currentIdx = getStepIndex(searchedOrder.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step.key} className="flex gap-8 items-start relative">
                        {/* Connecting Line */}
                        {idx < STEPS.length - 1 && (
                          <div className={`absolute left-4 top-8 bottom-[-32px] w-[2px] transition-colors duration-500 ${
                            idx < currentIdx ? 'bg-bloodred' : 'bg-white/10'
                          }`} />
                        )}

                        {/* Step Icon */}
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-bloodred border-bloodred text-alabaster shadow-lg shadow-bloodred/20' 
                            : 'border-white/20 text-stone bg-[#111]'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 size={16} strokeWidth={2.5} />
                          ) : (
                            <span className="text-xs font-mono">{idx + 1}</span>
                          )}
                        </div>

                        {/* Step Label */}
                        <div className="space-y-1">
                          <h4 className={`text-sm font-semibold uppercase tracking-wider ${
                            isCurrent ? 'text-bloodred' : isCompleted ? 'text-alabaster' : 'text-stone/60'
                          }`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-alabaster/40 font-light max-w-xl leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Package & Shipment Details */}
              <div className="bg-[#111] border border-white/5 p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred mb-6">Delivery Address</h3>
                  <div className="text-sm font-light text-alabaster/60 space-y-2">
                    <p className="font-semibold text-alabaster">{searchedOrder.fullName}</p>
                    <p>{searchedOrder.address}</p>
                    <p>{searchedOrder.city}, {searchedOrder.country}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred mb-6">Shipment Carrier</h3>
                  {searchedOrder.trackingNumber ? (
                    <div className="space-y-4">
                      <div className="bg-stone/5 border border-white/10 p-4 flex justify-between items-center">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-stone">DHL Express</p>
                          <p className="text-sm font-mono font-semibold text-alabaster mt-1">{searchedOrder.trackingNumber}</p>
                        </div>
                        <Truck size={20} className="text-bloodred" />
                      </div>
                      <a
                        href={`https://www.dhl.com/en/express/tracking.html?AWB=${searchedOrder.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-[10px] uppercase tracking-[0.2em] font-bold text-bloodred hover:underline"
                      >
                        Follow on Carrier Website ➔
                      </a>
                    </div>
                  ) : (
                    <div className="bg-stone/5 border border-white/10 p-4">
                      <p className="text-xs text-alabaster/40 italic">A tracking number will be assigned once logistics dispatch occurs.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-[#111] border border-white/5 p-8">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred mb-8">Items in Shipment</h3>
                <div className="divide-y divide-white/5">
                  {searchedOrder.items.map((item) => (
                    <div key={item.id} className="py-4 flex justify-between items-center gap-6">
                      <div>
                        <h4 className="text-sm font-serif text-alabaster">{item.name}</h4>
                        <div className="flex gap-4 text-[9px] uppercase tracking-widest text-stone mt-1">
                          <span>Size: {item.selectedSize}</span>
                          <span>Color: {item.selectedColor.name}</span>
                          {item.customText && (
                            <span className="text-bloodred font-semibold">Custom Text: "{item.customText}"</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-alabaster/60 font-light">{item.quantity}x</p>
                        <p className="text-sm font-semibold mt-1">{formatOrderPrice(item.price * item.quantity, searchedOrder.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/5 flex justify-between items-center font-serif text-lg mt-6">
                  <span>Total Shipment Value</span>
                  <span className="text-bloodred">{formatOrderPrice(searchedOrder.totalPrice, searchedOrder.currency)}</span>
                </div>
              </div>

            </motion.div>
          ) : (
            searchParams.get('code') && !errorMsg ? (
              <div className="py-20 text-center text-stone">Searching tracking systems...</div>
            ) : null
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
