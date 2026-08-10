'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Link2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface SocialPreviewProps {
  title: string;
  description: string;
  image: string;
  url: string;
  domain?: string;
  imageFit?: 'cover' | 'contain';
  className?: string;
}

export default function SocialPreview({
  title,
  description,
  image,
  url,
  domain,
  imageFit = 'cover',
  className,
}: SocialPreviewProps) {
  // Extract domain from URL if not explicitly provided
  const displayDomain = domain || (() => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  })();

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={twMerge(
        'group flex flex-col w-full max-w-lg overflow-hidden border border-neutral-200 bg-alabaster transition-all duration-500 hover:border-bloodred hover:shadow-2xl hover:shadow-bloodred/20',
        className
      )}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Image Section */}
      <div className="relative flex items-center justify-center aspect-[1.91/1] w-full overflow-hidden bg-charcoal border-b border-stone group-hover:border-bloodred/50 transition-colors duration-500">
        <motion.img
          src={image}
          alt={title}
          className={twMerge(
            "h-full w-full transition-transform duration-700 ease-out group-hover:scale-105",
            imageFit === 'contain' ? "object-contain p-4" : "object-cover"
          )}
        />
        {/* Subtle vignette gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-3 p-5 sm:p-6 bg-alabaster">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-charcoal/50">
          <span className="flex items-center gap-2 truncate">
            <Link2 size={14} className="flex-shrink-0 text-bloodred" />
            <span className="truncate">{displayDomain}</span>
          </span>
          <ExternalLink 
            size={14} 
            className="flex-shrink-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 text-bloodred" 
          />
        </div>
        
        <h3 className="line-clamp-2 text-xl font-display font-bold leading-snug text-charcoal group-hover:text-bloodred transition-colors duration-300">
          {title}
        </h3>
        
        <p className="line-clamp-2 text-sm leading-relaxed text-charcoal/70 font-sans">
          {description}
        </p>
      </div>
    </motion.a>
  );
}
