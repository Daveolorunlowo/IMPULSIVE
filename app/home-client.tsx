'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/store/useProducts';
import { useCurrency } from '@/store/useCurrency';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// --- MARQUEE COMPONENT ---
function Marquee({ text, reverse = false, className = '' }: { text: string; reverse?: boolean; className?: string }) {
  const items = Array(8).fill(text);
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="inline-flex"
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <span key={i} className="inline-block px-6">{item} <span className="text-bloodred">✦</span></span>
        ))}
        {items.map((item, i) => (
          <span key={`b-${i}`} className="inline-block px-6">{item} <span className="text-bloodred">✦</span></span>
        ))}
      </motion.div>
    </div>
  );
}

export default function HomeClient() {
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 4);
  const { formatPrice } = useCurrency();
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Newsletter State
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  // Scroll progress for subtle effects only (not opacity)
  const { scrollYProgress } = useScroll({ target: heroRef });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setNewsletterStatus('loading');
    setNewsletterMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNewsletterStatus('error');
        if (data.error === 'ALREADY_SUBSCRIBED') setNewsletterMsg('You are already in the club.');
        else if (data.error === 'DISPOSABLE_EMAIL') setNewsletterMsg('Real emails only.');
        else setNewsletterMsg(data.error || 'Something went wrong.');
      } else {
        setNewsletterStatus('success');
        setNewsletterMsg('Welcome to the circle.');
        setEmail('');
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMsg('Network error. Try again.');
    }
  };

  return (
    <div className="w-full bg-[#080808] text-white overflow-x-hidden">

      {/* ─── SECTION 1: HERO (video background for this section only) ─── */}
      <section
        ref={heroRef}
        className="relative w-full flex items-end overflow-hidden"
        style={{ height: '100dvh', marginTop: '-64px', paddingTop: '64px' }}
      >
        {/* Video fills entire section including under navbar */}
        <div className="absolute inset-0 w-full h-full">
          <video
            src="/hero-video.mp4"
            autoPlay loop muted playsInline
            className="absolute top-0 left-0 w-full h-full object-cover object-center"
          />
          {/* Dark overlays for readability */}
          <div className="absolute inset-0 bg-[#080808]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/70 to-transparent" />
          {/* Grain texture */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: '150px'}} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full px-6 md:px-16 pb-16 md:pb-24">

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw] font-black uppercase leading-[0.85] tracking-tighter mb-8"
          >
            <span className="block text-white">WEAR</span>
            <span className="block" style={{ WebkitTextStroke: '2px #d00000', color: 'transparent' }}>IMPULSIVE</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Link
              href="/shop"
              className="group relative px-10 py-4 bg-bloodred text-white font-black uppercase tracking-[0.25em] text-[10px] overflow-hidden inline-flex items-center gap-3 shrink-0"
            >
              <span className="relative z-10">Shop Now</span>
              <span className="relative z-10 transition-transform group-hover:translate-x-2">→</span>
              <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
              <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 text-[#080808] opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-black uppercase tracking-[0.25em] text-[10px]">Shop Now →</span>
            </Link>
          </motion.div>
        </div>


      </section>

      {/* ─── MARQUEE TAPE ─── */}
      <div className="bg-bloodred py-4 border-y-2 border-white/5 overflow-hidden">
        <Marquee text="IMPULSIVE WORLDWIDE" className="text-[11px] font-black uppercase tracking-[0.3em] text-white" />
      </div>

      {/* ─── SECTION 2: MANIFESTO ─── */}
      <section className="relative py-32 md:py-48 px-6 md:px-16 overflow-hidden bg-[#080808]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[30vw] font-black text-white/[0.02] leading-none">01</span>
        </div>
        <div className="relative z-10 max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-white mb-8"
          >
            BUILT FOR THE
            <br />
            <span className="text-bloodred">STREETS.</span>
            <br />
            <span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)', color: 'transparent' }}>NO RULES.</span>
          </motion.h2>
        </div>
      </section>

      {/* ─── SECTION 3: FEATURED PRODUCTS GRID ─── */}
      <section className="py-20 md:py-32 px-4 md:px-12 bg-[#0c0c0c]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 md:mb-20">
            <div>
              <span className="text-[10px] uppercase tracking-[0.5em] text-bloodred font-bold block mb-3">The Collection</span>
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                NEW<br/>DROPS
              </h2>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-3 text-white/50 hover:text-white transition-colors group text-[10px] uppercase tracking-[0.3em] font-bold">
              <span>View All</span>
              <span className="w-8 h-[1px] bg-white/30 group-hover:w-16 group-hover:bg-bloodred transition-all duration-500" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {featuredProducts.length > 0 ? featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="block group relative overflow-hidden bg-[#111]"
                  onMouseEnter={() => setHoveredProduct(i)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={hoveredProduct === i && product.hoverImage ? product.hoverImage : product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/90 via-transparent to-transparent" />
                    {product.status && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-bloodred text-white text-[8px] uppercase tracking-[0.3em] font-bold px-2.5 py-1">
                          {product.status}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-white text-[#080808] px-6 py-3 text-[9px] uppercase tracking-[0.3em] font-black">
                        Shop Now
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/5 bg-[#111]">
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-white leading-tight mb-2 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-bloodred font-black text-sm" suppressHydrationWarning>
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex gap-1">
                        {product.sizes?.slice(0, 3).map(s => (
                          <span key={s} className="text-[7px] text-white/30 uppercase font-bold">{s}</span>
                        ))}
                        {(product.sizes?.length || 0) > 3 && <span className="text-[7px] text-white/20">...</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )) : (
              <div className="col-span-4 flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-t-2 border-bloodred rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">Loading Archive...</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link href="/shop" className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-black text-white border border-white/20 px-8 py-4 hover:border-bloodred hover:text-bloodred transition-all">
              View All Drops →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE 2 ─── */}
      <div className="bg-[#111] py-4 border-y border-white/5 overflow-hidden">
        <Marquee
          text="STREETWEAR // IMPULSIVE // STAY IMPULSIVE // NEW DROPS"
          reverse
          className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30"
        />
      </div>

      {/* ─── SECTION 4: FULL-BLEED STATEMENT ─── */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center bg-bloodred">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            className="whitespace-nowrap text-[18vw] font-black uppercase text-black/10 leading-none"
          >
            WEAR IMPULSIVE // STAY IMPULSIVE // WEAR IMPULSIVE // STAY IMPULSIVE //&nbsp;
            WEAR IMPULSIVE // STAY IMPULSIVE // WEAR IMPULSIVE // STAY IMPULSIVE //&nbsp;
          </motion.div>
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[8px] uppercase tracking-[0.6em] text-black/60 font-bold block mb-6">Impulsive Worldwide</span>
            <h2 className="text-6xl sm:text-8xl md:text-[12vw] font-black uppercase leading-[0.85] tracking-tighter text-black">
              PURE<br/>STYLE.
            </h2>
            <p className="mt-6 text-black/60 text-xs uppercase tracking-[0.4em] font-bold">Designing the future of streetwear.</p>
            <Link
              href="/shop"
              className="mt-12 inline-block bg-black text-white px-10 py-5 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white hover:text-black transition-all duration-300"
            >
              Shop the Drop →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 5: NEWSLETTER / INNER CIRCLE ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center py-24 px-6 bg-[#050505] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/cta.png"
            alt="IMPULSIVE"
            fill
            className="object-cover opacity-10 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/60" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[20vw] font-black text-white/[0.015] leading-none uppercase">JOIN</span>
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-[1px] bg-bloodred" />
              <span className="text-[9px] uppercase tracking-[0.5em] text-bloodred font-black">Inner Circle</span>
              <div className="w-12 h-[1px] bg-bloodred" />
            </div>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter text-white mb-6">
              JOIN OUR<br/><span className="text-bloodred">CLUB.</span>
            </h2>
            <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-14 max-w-sm mx-auto leading-relaxed">
              Early access to new drops, limited releases & exclusive events.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-0 w-full max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
                placeholder="YOUR EMAIL ADDRESS"
                className="flex-1 bg-white/5 border border-white/10 focus:border-bloodred text-white placeholder:text-white/20 px-6 py-5 outline-none text-[9px] uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                suppressHydrationWarning
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
                className="bg-bloodred text-white px-8 py-5 text-[9px] uppercase tracking-[0.3em] font-black hover:bg-white hover:text-[#080808] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 border border-bloodred"
                suppressHydrationWarning
              >
                {newsletterStatus === 'loading' ? '...' : newsletterStatus === 'success' ? '✓ Joined' : 'Join Now'}
              </button>
            </form>

            <AnimatePresence>
              {newsletterMsg && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-6 text-[9px] uppercase tracking-[0.3em] font-bold ${newsletterStatus === 'error' ? 'text-bloodred' : 'text-white/50'}`}
                >
                  {newsletterMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
