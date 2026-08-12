'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const ProductSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 w-full animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[3/4] w-full bg-obsidian/5 border-2 border-obsidian/10 relative overflow-hidden">
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>
      
      {/* Text Skeleton */}
      <div className="space-y-4">
        <div className="h-3 w-20 bg-obsidian/5 font-mono" />
        <div className="h-10 w-2/3 bg-obsidian/5" />
        <div className="w-full flex justify-between pt-4 border-t border-obsidian/10">
          <div className="h-4 w-16 bg-obsidian/5" />
          <div className="h-3 w-24 bg-obsidian/5" />
        </div>
      </div>
    </div>
  );
};

export const HeroSkeleton = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 gap-12 items-center px-6 md:px-16 animate-pulse">
      <div className="md:col-span-7 space-y-12">
        <div className="space-y-4">
          <div className="h-4 w-40 bg-obsidian/5" />
          <div className="h-32 w-full bg-obsidian/5" />
          <div className="h-32 w-4/5 bg-obsidian/5" />
        </div>
        <div className="h-6 w-60 bg-obsidian/5" />
        <div className="h-16 w-48 bg-obsidian/5" />
      </div>
      <div className="md:col-span-5 aspect-[3/4] bg-obsidian/5 border-4 border-obsidian/10" />
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="pt-40 pb-40 min-h-screen bg-alabaster animate-pulse">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
          {/* Gallery Skeleton */}
          <div className="space-y-8">
            <div className="aspect-[3/4] bg-stone/5 border border-stone/10" />
            <div className="grid grid-cols-4 gap-4">
              <div className="aspect-square bg-stone/5" />
              <div className="aspect-square bg-stone/5" />
              <div className="aspect-square bg-stone/5" />
              <div className="aspect-square bg-stone/5" />
            </div>
          </div>
          {/* Details Skeleton */}
          <div className="pt-12 lg:pt-0 space-y-12">
            <div className="space-y-6">
              <div className="h-4 w-32 bg-stone/10" />
              <div className="h-24 w-full bg-stone/10" />
              <div className="h-10 w-24 bg-stone/10" />
            </div>
            <div className="space-y-6">
              <div className="h-4 w-40 bg-stone/10" />
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-stone/10" />
                <div className="w-12 h-12 rounded-full bg-stone/10" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-4 w-40 bg-stone/10" />
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-stone/10" />
                <div className="w-16 h-16 bg-stone/10" />
                <div className="w-16 h-16 bg-stone/10" />
                <div className="w-16 h-16 bg-stone/10" />
              </div>
            </div>
            <div className="h-16 w-full bg-stone/10 mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-charcoal pt-40 px-6 md:px-12 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-24">
        <div className="h-20 w-3/4 bg-alabaster/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="aspect-[3/4] bg-alabaster/5" />
          <div className="aspect-[3/4] bg-alabaster/5" />
          <div className="aspect-[3/4] bg-alabaster/5" />
        </div>
      </div>
    </div>
  );
};
