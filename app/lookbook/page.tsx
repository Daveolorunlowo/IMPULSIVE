'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const lookbookImages = [
  "/images/impulsiveboy1red.jpeg",
  "/images/impulsive-girlred.jpeg",
  "/images/impulsiveboyblack.jpeg",
  "/images/impulsivegirl1black.jpeg",
  "/images/impulsiveboywhite.jpeg",
  "/images/hero.png"
];

export default function LookbookPage() {
  return (
    <div className="pt-40 pb-40 bg-charcoal text-alabaster min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <header className="mb-40 text-center space-y-8">
          <span className="text-[10px] uppercase tracking-[0.5em] text-stone font-bold block">Series 01 // Archive</span>
          <h1 className="text-7xl md:text-9xl font-serif text-alabaster tracking-tighter">Drift Protocol</h1>
          <p className="max-w-xl mx-auto text-sm text-alabaster/40 leading-relaxed uppercase tracking-[0.2em]">
            A visual documentation of form in motion. Captured across the architectural landscapes of Berlin and Tokyo.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lookbookImages.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative overflow-hidden aspect-[3/4] bg-stone/10 border border-alabaster/10 hover:border-bloodred group transition-colors",
                i % 2 === 0 ? "md:translate-y-20" : ""
              )}
            >
              <Image 
                src={src} 
                alt={`Lookbook ${i}`} 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-charcoal/10 mix-blend-overlay group-hover:opacity-0 transition-opacity" />
              <div className="absolute bottom-8 left-8 flex flex-col gap-2">
                <span className="text-[8px] uppercase tracking-widest font-bold text-bloodred">// FRAME_{i+1}</span>
                <span className="text-xs uppercase tracking-widest font-bold text-alabaster">Location: Classified</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-80 text-center">
          <h2 className="text-4xl font-serif text-alabaster mb-12 italic">The story continues in Series 02.</h2>
          <button className="bg-bloodred text-alabaster px-12 py-5 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-alabaster hover:text-charcoal transition-all">Join the waitlist</button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
