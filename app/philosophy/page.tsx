'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function PhilosophyPage() {
  return (
    <div className="pt-40 pb-40 min-h-screen bg-alabaster">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <header className="mb-40 space-y-8">
          <span className="text-[10px] uppercase tracking-[0.5em] text-stone font-bold block">Since 2026 // Our Essence</span>
          <h1 className="text-6xl md:text-[120px] font-serif text-charcoal leading-none tracking-tighter">The<br />Manifesto.</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="space-y-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-serif text-charcoal">01 / The Vision</h2>
              <p className="text-xl font-light text-charcoal/60 leading-relaxed italic">
                Impulsive was born from a desire to bridge the gap between architectural precision and human spontaneity. We create garments that act as a second skin for the urban nomad.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-serif text-charcoal">02 / Craftsmanship</h2>
              <p className="text-xl font-light text-charcoal/60 leading-relaxed italic">
                Every piece is engineered with a focus on longevity. We utilize technical fabrics that respond to the environment, paired with traditional tailoring techniques that honor the history of garment making.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-serif text-charcoal">03 / The Future</h2>
              <p className="text-xl font-light text-charcoal/60 leading-relaxed italic">
                Sustainability is not a goal; it is our foundation. We operate on a limited-release model to ensure minimal waste and maximum intentionality in every collection.
              </p>
            </motion.div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden shadow-2xl">
            <Image 
              src="/images/impulsivegirl1black.jpeg"
              alt="Brand Manifesto"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-60 py-40 border-y border-stone/10 text-center">
          <blockquote className="text-4xl md:text-6xl font-serif text-stone italic max-w-4xl mx-auto leading-tight">
            "We don't just dress the body; we equip the soul for the high-velocity world."
          </blockquote>
          <p className="mt-12 text-[10px] uppercase tracking-[0.4em] font-bold text-charcoal/40">— The Founders</p>
        </div>
      </div>
    </div>
  );
}
