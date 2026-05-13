'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
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
  category: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  status?: string;
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  mainImage,
  hoverImage,
  category,
  sizes,
  colors,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
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
              src={hoverImage}
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
              className="absolute inset-x-0 bottom-0 bg-charcoal/95 backdrop-blur-md p-6 flex flex-col gap-4 z-10 border-t border-bloodred/30"
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-5 h-5 rounded-full border transition-all",
                        selectedColor.name === color.name ? "border-bloodred scale-110 shadow-[0_0_10px_rgba(255,0,0,0.5)]" : "border-transparent"
                      )}
                      style={{ backgroundColor: color.hex }}
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
                className="w-full bg-bloodred text-alabaster py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-alabaster hover:text-charcoal transition-colors"
              >
                Add To Bag
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info - Luxury Centered */}
      <Link href={`/products/${slug}`} className="flex flex-col items-center text-center space-y-2 mt-8">
        <span className="text-[9px] uppercase tracking-[0.3em] text-stone font-semibold">{category}</span>
        <h3 className="text-xl font-serif text-alabaster group-hover:text-bloodred transition-colors duration-500">
          {name}
        </h3>
        <p className="text-[10px] font-sans font-semibold tracking-widest text-bloodred">
          {formatPrice(price)}
        </p>
      </Link>
    </motion.div>
  );
}
