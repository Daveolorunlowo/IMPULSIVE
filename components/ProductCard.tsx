'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

import { useCart } from '@/store/useCart';
import { useCurrency } from '@/store/useCurrency';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  mainImage: string;
  hoverImage: string;
  images: string[];
  category: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  status?: string;
  stock?: number;
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  mainImage,
  hoverImage,
  images,
  category,
  sizes,
  colors,
  stock,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);

  const cycleImages = images ? images.filter(img => img !== mainImage) : [];
  const hasCycleImages = slug.includes('freedom-man-tee') && cycleImages.length > 1;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && hasCycleImages) {
      interval = setInterval(() => {
        setCycleIndex(prev => (prev + 1) % cycleImages.length);
      }, 800);
    } else {
      setCycleIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, hasCycleImages, cycleImages.length]);

  const currentHoverImage = hasCycleImages ? cycleImages[cycleIndex] : hoverImage;

  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { isAuthenticated, trackActivity } = useAuth();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push(`/auth?redirect=/shop`);
      return;
    }
    
    addItem({
      id,
      name,
      price,
      image: mainImage,
      selectedSize,
      selectedColor,
    });
    trackActivity(`Added ${name} to bag`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden group">
        <Link href={`/products/${slug}`} className="block">
          {/* Image Container */}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone/10 border border-alabaster/10 group-hover:border-bloodred transition-colors duration-500">
            <Image
              src={mainImage}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-cover transition-transform duration-1000 ease-out",
                isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
              )}
            />
            <Image
              src={currentHoverImage}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-cover transition-transform duration-1000 ease-out scale-105",
                isHovered ? "opacity-100 scale-100" : "opacity-0"
              )}
            />
          </div>
        </Link>

        {/* Quick Add Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-x-0 bottom-0 bg-charcoal/95 backdrop-blur-md p-4 sm:p-6 flex flex-col gap-4 z-10 border-t border-bloodred/30"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2">
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-5 h-5 rounded-full border transition-all",
                        selectedColor.name === color.name ? "border-bloodred scale-110 shadow-[0_0_10px_rgba(255,0,0,0.5)]" : "border-transparent",
                        color.hex === '#800000' ? 'bg-[#800000]' : 
                        color.hex === '#0A0A0A' ? 'bg-[#0A0A0A]' : 
                        color.hex === '#F9F9F7' ? 'bg-[#F9F9F7]' : 'bg-stone'
                      )}
                      aria-label={`Select color ${color.name}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  {sizes.slice(0, 4).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-1 transition-all",
                        selectedSize === size ? "bg-bloodred text-alabaster shadow-sm" : "text-alabaster/40 hover:text-bloodred"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={stock !== undefined && stock === 0}
                className="w-full bg-bloodred text-alabaster py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-alabaster hover:text-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stock !== undefined && stock === 0 ? 'Out of Stock' : 'Add To Bag'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info - Luxury Centered */}
      <Link href={`/products/${slug}`} className="flex flex-col items-center text-center space-y-2 mt-8">

        <h3 className="text-xl font-serif text-alabaster group-hover:text-bloodred transition-colors duration-500">
          {name}
        </h3>
        <p className="text-[10px] font-sans font-semibold tracking-widest text-bloodred" suppressHydrationWarning>
          {formatPrice(price)}
        </p>
      </Link>
    </motion.div>
  );
}
