'use client';

import React, { useEffect, useState } from 'react';
import { useOrders } from '@/store/useOrders';
import { useAuth } from '@/store/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import Link from 'next/link';

export default function NotificationToast() {
  const { user } = useAuth();
  const { orders, markOrderAsRead } = useOrders();
  const [activeNotification, setActiveNotification] = useState<any>(null);

  useEffect(() => {
    if (!user || !user.email) {
      setActiveNotification(null);
      return;
    }
    
    // Find any order that belongs to the user and has an unread notification
    const unread = orders.find(
      (order) => 
        order.email.toLowerCase() === user.email.toLowerCase() && 
        order.unreadNotification === true
    );

    if (unread) {
      setActiveNotification(unread);
    } else {
      setActiveNotification(null);
    }
  }, [orders, user]);

  if (!activeNotification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-8 right-8 z-[200] w-full max-w-sm bg-[#0E0E0E] text-alabaster border border-bloodred/40 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-sm"
      >
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-bloodred/15 flex items-center justify-center text-bloodred flex-shrink-0 animate-pulse">
            <Bell size={18} />
          </div>
          
          <div className="flex-1 min-w-0">
            <span className="text-[8px] uppercase tracking-widest text-stone font-bold block mb-1">
              STATUS UPDATE RECEIVED
            </span>
            <h4 className="text-xs font-semibold text-alabaster font-mono truncate">
              {activeNotification.id}
            </h4>
            <p className="text-[10px] text-alabaster/60 leading-relaxed font-light mt-1">
              Your shipment status is now <span className="font-bold text-bloodred uppercase">{activeNotification.status}</span>.
            </p>
            
            <div className="mt-4 flex gap-4">
              <Link 
                href={`/track-order?code=${activeNotification.id}`}
                onClick={() => markOrderAsRead(activeNotification.id)}
                className="bg-bloodred hover:bg-white hover:text-charcoal text-alabaster px-4 py-2 text-[8px] uppercase tracking-widest font-bold transition-all"
              >
                Track Status
              </Link>
              <button
                onClick={() => markOrderAsRead(activeNotification.id)}
                className="text-[8px] uppercase tracking-widest text-stone hover:text-alabaster font-bold"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            onClick={() => markOrderAsRead(activeNotification.id)}
            className="text-stone hover:text-alabaster transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
