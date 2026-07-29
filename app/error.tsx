'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative min-h-screen w-full bg-[#080808] text-white flex flex-col items-center justify-center overflow-hidden px-6">

      {/* Noise grain */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '150px'
        }}
      />

      {/* Ghost text background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="text-[30vw] font-black text-white/[0.03] leading-none tracking-tighter"
        >
          ERR
        </motion.span>
      </div>

      {/* Red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-bloodred/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="w-10 h-[1px] bg-bloodred" />
          <span className="text-[9px] uppercase tracking-[0.5em] text-bloodred font-black">Something Went Wrong</span>
          <div className="w-10 h-[1px] bg-bloodred" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl sm:text-8xl md:text-[10vw] font-black uppercase leading-[0.85] tracking-tighter mb-6"
        >
          <span className="block text-white">HOLD</span>
          <span
            className="block"
            style={{ WebkitTextStroke: '2px #d00000', color: 'transparent' }}
          >
            UP.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-white/40 text-xs uppercase tracking-[0.3em] mb-14 max-w-xs mx-auto leading-relaxed"
        >
          An unexpected error occurred. Hit the button below to try again.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={reset}
            className="group relative px-10 py-4 bg-bloodred text-white font-black uppercase tracking-[0.25em] text-[10px] overflow-hidden inline-flex items-center gap-3"
          >
            <span className="relative z-10">Try Again</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-1">↺</span>
            <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
            <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 text-[#080808] opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-black uppercase tracking-[0.25em] text-[10px]">Try Again ↺</span>
          </button>

          <Link
            href="/"
            className="px-10 py-4 border border-white/20 text-white/60 hover:text-white hover:border-white font-black uppercase tracking-[0.25em] text-[10px] transition-all duration-300 inline-flex items-center gap-3"
          >
            Back to Home →
          </Link>
        </motion.div>
      </div>

      {/* Bottom marquee */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden py-3 border-t border-white/5">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
          className="inline-flex whitespace-nowrap text-[9px] font-black uppercase tracking-[0.4em] text-white/10"
        >
          {Array(12).fill('WEAR IMPULSIVE // ERROR // WE GOT YOU // ').map((t, i) => (
            <span key={i} className="px-4">{t}</span>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
