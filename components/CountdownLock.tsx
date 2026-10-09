'use client';

import React, { useState, useEffect } from 'react';

// Change this to your actual launch date
const TARGET_DATE = new Date('2026-10-11T00:00:00Z');

export default function CountdownLock({ children }: { children: React.ReactNode }) {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Secret escape hatch: you can unlock the site for development by running this in the browser console:
    // localStorage.setItem('IMPULSIVE_UNLOCK', 'true')
    if (typeof window !== 'undefined' && localStorage.getItem('IMPULSIVE_UNLOCK') === 'true') {
      setIsUnlocked(true);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const difference = TARGET_DATE.getTime() - now.getTime();

      if (difference <= 0) {
        setIsUnlocked(true);
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // If unlocked (time reached or admin bypassed), show the site
  if (isUnlocked) {
    return <>{children}</>;
  }

  // Prevent hydration mismatch by showing a blank screen for a split second on initial load
  if (!timeLeft) {
     return <div className="min-h-screen bg-charcoal flex items-center justify-center"></div>;
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-charcoal text-alabaster flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-charcoal-light/20 via-charcoal to-charcoal pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="font-syne text-3xl md:text-5xl uppercase tracking-[0.3em] mb-16 text-center text-alabaster/90">
          WEARIMPULSIVE
        </h1>
        
        <div className="flex gap-4 md:gap-8 font-mono text-center mb-16">
          <div className="flex flex-col items-center w-20 md:w-24">
            <span className="text-5xl md:text-7xl font-light text-alabaster">{timeLeft.days.toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-stone mt-4">Days</span>
          </div>
          <span className="text-5xl md:text-7xl font-light text-stone/50">:</span>
          <div className="flex flex-col items-center w-20 md:w-24">
            <span className="text-5xl md:text-7xl font-light text-alabaster">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-stone mt-4">Hours</span>
          </div>
          <span className="text-5xl md:text-7xl font-light text-stone/50 hidden md:block">:</span>
          <div className="flex flex-col items-center w-20 md:w-24 hidden md:flex">
            <span className="text-5xl md:text-7xl font-light text-alabaster">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-stone mt-4">Mins</span>
          </div>
          <span className="text-5xl md:text-7xl font-light text-stone/50 hidden md:block">:</span>
          <div className="flex flex-col items-center w-20 md:w-24 hidden md:flex">
            <span className="text-5xl md:text-7xl font-light text-alabaster">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-stone mt-4">Secs</span>
          </div>
        </div>

        {/* Mobile Minutes/Seconds Row */}
        <div className="flex md:hidden gap-4 font-mono text-center mb-16">
          <div className="flex flex-col items-center w-20">
            <span className="text-5xl font-light text-alabaster">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone mt-4">Mins</span>
          </div>
          <span className="text-5xl font-light text-stone/50">:</span>
          <div className="flex flex-col items-center w-20">
            <span className="text-5xl font-light text-alabaster">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone mt-4">Secs</span>
          </div>
        </div>

        <div className="h-px w-24 bg-stone/30 mb-8"></div>
        <p className="font-inter text-xs md:text-sm uppercase tracking-[0.2em] text-stone text-center">
          The collection is almost ready.
        </p>
      </div>
    </div>
  );
}
