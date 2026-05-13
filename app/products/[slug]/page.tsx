'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Share2, Ruler, Check } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useAuth } from '@/store/useAuth';
import { useRouter, notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import { products } from '@/lib/products';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const productData = products.find(p => p.slug === slug);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(productData?.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(productData?.colors[0] || { name: '', hex: '' });
  const [isFavorited, setIsFavorited] = useState(false);
  
  
  const { addItem } = useCart();
  const { isAuthenticated, trackActivity } = useAuth();
  const router = useRouter();

  if (!productData) {
    notFound();
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push(`/auth?redirect=/products/${productData.slug}`);
      return;
    }

    addItem({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      image: productData.images[0],
      selectedSize: selectedSize,
      selectedColor: selectedColor,
    });
    trackActivity(`Started order for ${productData.name}`);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    trackActivity(`${!isFavorited ? 'Favorited' : 'Unfavorited'} ${productData.name}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: `IMPULSIVE | ${productData.name}`,
      text: productData.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard');
      }
      trackActivity(`Shared ${productData.name}`);
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="pt-40 pb-40 min-h-screen bg-alabaster">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* Gallery */}
        <div className="relative">
          <div className="sticky top-40 space-y-8">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F3] shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full"
                >
                  <Image
                    src={productData.images[activeImage]}
                    alt={productData.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              <button 
                onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : productData.images.length - 1))}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md hover:bg-white transition-all z-10"
              >
                <ChevronLeft size={20} strokeWidth={1} />
              </button>
              <button 
                onClick={() => setActiveImage((prev) => (prev < productData.images.length - 1 ? prev + 1 : 0))}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md hover:bg-white transition-all z-10"
              >
                <ChevronRight size={20} strokeWidth={1} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {productData.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative aspect-square transition-all overflow-hidden bg-white shadow-sm",
                    activeImage === i ? "border border-charcoal scale-95" : "opacity-50 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col pt-12 lg:pt-0">
          <div className="border-b border-stone/10 pb-12">
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold">
                The {productData.category} Collection
              </span>
              <div className="flex gap-4">
                <button 
                  onClick={handleFavorite}
                  className={cn(
                    "p-4 border transition-all duration-300 active:scale-95",
                    isFavorited 
                      ? "bg-bloodred border-bloodred text-alabaster shadow-[0_0_20px_rgba(128,0,0,0.4)]" 
                      : "border-charcoal/20 text-charcoal hover:border-bloodred hover:text-bloodred"
                  )}
                  aria-label="Add to favorites"
                >
                  <Heart 
                    size={20} 
                    strokeWidth={1.5} 
                    fill={isFavorited ? "currentColor" : "none"} 
                    className="transition-transform duration-300"
                  />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-4 border border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-alabaster hover:border-charcoal transition-all duration-300 active:scale-95"
                  aria-label="Share product"
                >
                  <Share2 size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif text-charcoal leading-none mb-12">
              {productData.name}
            </h1>
            <div className="flex items-baseline gap-6">
              <span className="text-4xl font-serif text-stone">${productData.price.toFixed(2)}</span>
              {productData.status && (
                <span className="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 bg-charcoal/5 px-3 py-1">
                  {productData.status}
                </span>
              )}
            </div>
          </div>

          <div className="py-12 space-y-16">
            {/* Color Selection */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold">Select Color: <span className="text-charcoal">{selectedColor.name}</span></h3>
              </div>
              <div className="flex gap-4">
                {productData.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedColor.name === color.name ? "border-charcoal scale-110 shadow-lg" : "border-transparent"
                    )}
                    title={color.name}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border border-stone/20" 
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor.name === color.name && (
                        <Check size={14} className={cn("m-auto mt-1.5", color.hex === '#F9F9F7' || color.hex === '#FFFFFF' ? "text-charcoal" : "text-white")} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold">Select Size: <span className="text-charcoal">{selectedSize}</span></h3>
                <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold underline underline-offset-4 decoration-stone/40">
                  <Ruler size={14} strokeWidth={1.5} /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-4">
                {productData.sizes.map((size) => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "w-16 h-16 border font-sans font-semibold transition-all flex items-center justify-center text-sm tracking-widest",
                      selectedSize === size 
                        ? "bg-charcoal text-alabaster border-charcoal shadow-lg" 
                        : "border-charcoal/10 text-charcoal/40 hover:border-charcoal hover:text-charcoal"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Description & Details */}
            <div className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold">Composition & Care</h3>
              <p className="text-lg font-light text-charcoal/60 leading-relaxed italic">
                {productData.description}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-4">
                {productData.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-4 text-xs font-light text-charcoal/40 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone/40" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Add to Cart */}
            <div className="pt-8">
              <button 
                onClick={handleAddToCart}
                className="w-full btn-luxury shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all py-6 text-xs"
              >
                Initialize Order
              </button>
              <div className="mt-8 flex justify-between items-center px-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-1 h-1 bg-stone" />
                  <span className="text-[8px] uppercase tracking-widest text-charcoal/30">Secure Checkout</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-1 h-1 bg-stone" />
                  <span className="text-[8px] uppercase tracking-widest text-charcoal/30">Global Express</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-1 h-1 bg-stone" />
                  <span className="text-[8px] uppercase tracking-widest text-charcoal/30">Studio Finish</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
