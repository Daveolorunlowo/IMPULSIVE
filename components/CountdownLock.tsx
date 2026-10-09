'use client';

import React, { useState, useEffect } from 'react';

// Target date from the previous template
const TARGET_DATE = new Date('2026-10-11T19:00:00+01:00');

export default function CountdownLock({ children }: { children: React.ReactNode }) {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Secret escape hatch
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

  if (isUnlocked) {
    return <>{children}</>;
  }

  // Prevent hydration mismatch
  if (!timeLeft) {
     return <div className="min-h-screen bg-black flex items-center justify-center"></div>;
  }

  const padZero = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col items-center justify-center overflow-hidden font-inter p-[clamp(1rem,5vw,3rem)]">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.02); opacity: 0.8; color: #800000; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-custom-pulse {
            animation: customPulse 1s infinite;
        }
        .countdown-container {
            display: flex;
            gap: clamp(0.75rem, 3vw, 1.5rem);
            justify-content: center;
            flex-wrap: wrap; 
            width: 100%;
        }
        .countdown-block {
            background-color: #1A1A1A;
            border: 2px solid transparent;
            padding: clamp(1rem, 3vw, 1.5rem);
            flex: 1 1 auto;
            min-width: 100px;
            max-width: 180px;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: all 0.3s ease-in-out;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        .countdown-block:hover {
            border-color: #800000;
            box-shadow: 0 0 30px rgba(128, 0, 0, 0.2);
        }
        @media (max-width: 480px) {
            .countdown-container {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
            }
            .countdown-block {
                min-width: unset;
                max-width: 100%;
            }
        }
      `}} />

      <video autoPlay loop muted playsInline className="fixed top-0 left-0 w-screen h-screen object-cover z-[1] grayscale brightness-50">
          <source src="/New-hero-video.mp4" type="video/mp4" />
      </video>

      <div className="fixed top-0 left-0 w-screen h-screen z-[2] bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.4)_0%,rgba(0,0,0,0.95)_80%,#000000_100%)]"></div>

      <div 
        className="fixed top-0 left-0 w-screen h-screen z-[10] opacity-10 pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      ></div>

      <div className="relative z-[20] flex flex-col items-center w-full max-w-[1200px] animate-in fade-in duration-[1500ms] text-center">
        <img 
          src="/images/impulsive-logo-new-removebg-preview.png" 
          alt="IMPULSIVE Logo" 
          className="w-[clamp(100px,15vw,150px)] max-w-[80vw] mb-[clamp(1.5rem,4vw,2.5rem)] object-contain drop-shadow-[0_0_10px_rgba(128,0,0,0.3)]" 
        />

        <h1 
          className="font-syne font-extrabold uppercase tracking-[0.02em] mb-4 leading-[1.15] text-[clamp(1.4rem,7vw,5rem)] text-transparent bg-clip-text bg-gradient-to-b from-white to-[#A0A0A0]"
          style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.8)' }}
        >
          SITE IS TEMPORARILY CLOSED
        </h1>
        
        <div className="w-[clamp(60px,15vw,100px)] h-[2px] bg-[#800000] mx-auto mb-[clamp(1.5rem,4vw,2rem)]"></div>
        
        <p className="text-[#A0A0A0] text-[clamp(0.85rem,2vw+0.5rem,1.25rem)] font-normal mb-[clamp(2.5rem,6vw,4rem)] max-w-[800px] leading-[1.6] px-2">
          LOCK IN. THE NEXT COLLECTION DROPS.<br/>EXCLUSIVE PIECES. NO RESTOCKS. STAY READY.
        </p>

        <div className="countdown-container">
          <div className="countdown-block">
            <div className="font-syne font-extrabold text-white leading-none mb-2 tabular-nums text-[clamp(2rem,8vw,4.5rem)]">
              {padZero(timeLeft.days)}
            </div>
            <div className="text-[clamp(0.6rem,1.5vw+0.3rem,0.85rem)] uppercase text-[#800000] tracking-[0.2em] font-bold">Days</div>
          </div>
          
          <div className="countdown-block">
            <div className="font-syne font-extrabold text-white leading-none mb-2 tabular-nums text-[clamp(2rem,8vw,4.5rem)]">
              {padZero(timeLeft.hours)}
            </div>
            <div className="text-[clamp(0.6rem,1.5vw+0.3rem,0.85rem)] uppercase text-[#800000] tracking-[0.2em] font-bold">Hours</div>
          </div>
          
          <div className="countdown-block">
            <div className="font-syne font-extrabold text-white leading-none mb-2 tabular-nums text-[clamp(2rem,8vw,4.5rem)]">
              {padZero(timeLeft.minutes)}
            </div>
            <div className="text-[clamp(0.6rem,1.5vw+0.3rem,0.85rem)] uppercase text-[#800000] tracking-[0.2em] font-bold">Minutes</div>
          </div>
          
          <div className="countdown-block">
            <div className="font-syne font-extrabold text-white leading-none mb-2 tabular-nums text-[clamp(2rem,8vw,4.5rem)] animate-custom-pulse">
              {padZero(timeLeft.seconds)}
            </div>
            <div className="text-[clamp(0.6rem,1.5vw+0.3rem,0.85rem)] uppercase text-[#800000] tracking-[0.2em] font-bold">Seconds</div>
          </div>
        </div>

      </div>
    </div>
  );
}
