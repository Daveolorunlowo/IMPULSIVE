'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Share2, Ruler, Check, Star, MessageSquare } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useAuth } from '@/store/useAuth';
import { useCurrency } from '@/store/useCurrency';
import { useWishlist } from '@/store/useWishlist';
import { useReviews } from '@/store/useReviews';
import { useRouter, notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProducts } from '@/store/useProducts';

export default function ProductDetailClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { products } = useProducts();
  const productData = products.find(p => p.slug === slug);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(productData?.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(productData?.colors[0] || { name: '', hex: '' });
  
  // Sizing drawer state
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [advisorResult, setAdvisorResult] = useState<string | null>(null);



  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  const { addItem } = useCart();
  const { isAuthenticated, trackActivity } = useAuth();
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { getReviewsForProduct, getAverageRating, addReview } = useReviews();
  const router = useRouter();

  if (!productData) {
    notFound();
  }

  const isFavorited = isInWishlist(productData.id);
  const productReviews = getReviewsForProduct(productData.slug);
  const averageRating = getAverageRating(productData.slug);

  const calculateAdvisorSize = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w)) return;
    
    let size = 'M';
    if (w < 60) size = 'XS';
    else if (w < 70) size = 'S';
    else if (w < 82) size = 'M';
    else if (w < 95) size = 'L';
    else size = 'XL';
    
    setAdvisorResult(size);
  };

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
    trackActivity(`Added ${productData.name} to cart`);
  };

  const handleFavorite = () => {
    toggleWishlist(productData.id);
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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    addReview({
      productSlug: productData.slug,
      userName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
    trackActivity(`Submitted review for ${productData.name}`);
  };

  return (
    <>
      <div className="pt-40 pb-40 min-h-screen bg-alabaster">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
            
            {/* Gallery (Left Column) */}
            <div className="relative">
              <div className="sticky top-40 space-y-8">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F3] shadow-sm border border-charcoal/5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="w-full h-full relative"
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
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} strokeWidth={1} />
                  </button>
                  <button 
                    onClick={() => setActiveImage((prev) => (prev < productData.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md hover:bg-white transition-all z-10"
                    aria-label="Next image"
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
                        "relative aspect-square transition-all overflow-hidden bg-white shadow-sm border",
                        activeImage === i ? "border-charcoal scale-95" : "border-transparent opacity-50 hover:opacity-100"
                      )}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details (Right Column) */}
            <div className="flex flex-col pt-12 lg:pt-0">
              <div className="border-b border-stone/10 pb-12">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold">
                    The Collection
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
                      aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
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
                      className="p-4 border border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-alabaster hover:border-charcoal transition-all duration-300 active:scale-[0.95]"
                      aria-label="Share product"
                    >
                      <Share2 size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-serif text-charcoal leading-none mb-12">
                  {productData.name}
                </h1>
                
                <div className="flex items-center gap-6 flex-wrap">
                  <span className="text-4xl font-serif text-stone" suppressHydrationWarning>
                    {formatPrice(productData.price)}
                  </span>
                  
                  {/* Reviews aggregate pill */}
                  {productReviews.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-charcoal/5 px-3 py-1 text-xs">
                      <Star size={12} className="fill-bloodred text-bloodred" />
                      <span className="font-bold font-serif text-charcoal">{averageRating}</span>
                      <span className="text-stone">({productReviews.length})</span>
                    </div>
                  )}

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
                          className={`w-8 h-8 rounded-full border border-stone/20 ${
                            color.hex === '#800000' ? 'bg-[#800000]' : 
                            color.hex === '#0A0A0A' ? 'bg-[#0A0A0A]' : 
                            color.hex === '#000000' ? 'bg-[#000000]' : 
                            color.hex === '#FFFFFF' ? 'bg-[#FFFFFF]' : 
                            color.hex === '#F9F9F7' ? 'bg-[#F9F9F7]' : 'bg-stone'
                          }`}
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

                {/* FOMO Stock Scarcity Pulser */}
                {productData.stock !== undefined && productData.stock <= 3 && productData.stock > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-bloodred/5 border border-bloodred/10 p-4 rounded-sm text-bloodred"
                  >
                    <div className="w-2 h-2 rounded-full bg-bloodred animate-ping shadow-[0_0_10px_#800000]" />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold">
                      LOW STOCK ALERT // ONLY {productData.stock} PIECES REMAINING
                    </span>
                  </motion.div>
                )}
                




                {/* Description & Details */}
                <div className="space-y-6">

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

                {/* Inline Size Guide */}
                <div className="space-y-4 pt-6">
                  <h3 className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold mb-4">Garment Measurements</h3>
                  <div className="border border-charcoal/10 text-xs text-charcoal/60 overflow-hidden bg-stone/5">
                    <div className="grid grid-cols-4 bg-charcoal/5 p-3 font-bold text-[9px] uppercase tracking-widest text-charcoal border-b border-charcoal/10">
                      <span>Size</span>
                      <span>Chest</span>
                      <span>Length</span>
                      <span>Sleeve</span>
                    </div>
                    {[
                      { s: 'S', c: '25"', l: '24"', sl: '22"' },
                      { s: 'M', c: '26.5"', l: '25.5"', sl: '23.5"' },
                      { s: 'L', c: '28"', l: '27"', sl: '25"' },
                      { s: 'XL', c: '29.5"', l: '28.5"', sl: '26.5"' },
                      { s: '2XL', c: '31"', l: '30"', sl: '28"' },
                    ].map((row) => (
                      <div key={row.s} className="grid grid-cols-4 p-3 border-b border-charcoal/5 last:border-0 hover:bg-charcoal/5 transition-colors">
                        <span className="font-bold text-charcoal">{row.s}</span>
                        <span>{row.c}</span>
                        <span>{row.l}</span>
                        <span>{row.sl}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-stone leading-relaxed">
                    ALL MEASUREMENTS ARE IN INCHES AND ARE TRUE TO SIZE
                  </p>
                </div>

                {/* Add to Cart */}
                <div className="pt-8">
                  <button 
                    onClick={handleAddToCart}
                    disabled={productData.stock !== undefined && productData.stock === 0}
                    className="w-full btn-luxury shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all py-6 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {productData.stock !== undefined && productData.stock === 0 ? 'Out of Stock' : 'Order'}
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

          {/* Sizing, Fit, and Sizing Profile Table is in size guide drawer (lines 331+) */}
          
          {/* Reviews Block (Full Width Below Grid) */}
          <div className="pt-24 border-t border-stone/10 grid grid-cols-1 lg:grid-cols-12 gap-16 text-charcoal">
            
            {/* Reviews Summary */}
            <div className="lg:col-span-4 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold block">Social Proof</span>
              <h2 className="text-4xl font-serif">Customer Reviews</h2>
              
              <div className="bg-charcoal text-alabaster p-8 border border-white/5 rounded-sm space-y-4">
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl font-serif text-bloodred font-bold">{averageRating}</span>
                  <span className="text-stone">/ 5.0</span>
                </div>
                <div className="flex gap-1 text-bloodred">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className={cn(s <= Math.round(averageRating) ? "fill-bloodred text-bloodred" : "text-stone/30")} />
                  ))}
                </div>
                <p className="text-[10px] text-alabaster/40 uppercase tracking-wider">Based on {productReviews.length} verified submissions</p>
              </div>
            </div>

            {/* Reviews List & Submission Form */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Form */}
              <form onSubmit={handleSubmitReview} className="bg-white p-8 border border-stone/10 shadow-sm space-y-6">
                <h3 className="text-lg font-serif">Submit a Review</h3>
                {reviewSuccess && (
                  <p className="text-[10px] uppercase tracking-widest text-bloodred font-bold">Review submitted successfully. Thank you for your feedback.</p>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest font-semibold text-stone mb-2">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="ENTER NAME" 
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full bg-alabaster border border-stone/10 px-4 py-3 text-[10px] tracking-widest font-semibold text-charcoal focus:outline-none focus:border-charcoal uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest font-semibold text-stone mb-2">Rating</label>
                    <div className="flex gap-2 h-10 items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewRating(s)}
                          className="hover:scale-110 active:scale-95 transition-transform"
                          aria-label={`Rate ${s} stars`}
                        >
                          <Star size={20} className={cn(s <= reviewRating ? "fill-bloodred text-bloodred" : "text-stone/30")} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-widest font-semibold text-stone mb-2">Comments</label>
                  <textarea 
                    placeholder="WRITE YOUR COMMENTS HERE..." 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="w-full bg-alabaster border border-stone/10 px-4 py-3 text-xs tracking-wide font-light text-charcoal focus:outline-none focus:border-charcoal placeholder:text-stone/30"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="bg-charcoal text-alabaster px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-bloodred transition-colors"
                >
                  Post Review
                </button>
              </form>

              {/* List */}
              <div className="space-y-8">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="border-b border-stone/10 pb-8 space-y-4">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-sm font-semibold">{rev.userName}</h4>
                      <span className="text-[9px] text-stone font-light">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-0.5 text-bloodred">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={cn(s <= rev.rating ? "fill-bloodred text-bloodred" : "text-stone/10")} />
                      ))}
                    </div>
                    <p className="text-sm text-charcoal/70 leading-relaxed font-light italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </div>
      
      {/* Sizing Advisor Drawer Overlay */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[100]"
            />

            {/* Slide-over */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-charcoal text-alabaster z-[101] flex flex-col shadow-2xl border-l border-bloodred/20 overflow-y-auto p-12"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-12 pb-6 border-b border-bloodred/20">
                <div>
                  <h2 className="text-3xl font-serif text-alabaster">Sizing Hub</h2>

                </div>
                <button 
                  onClick={() => setIsSizeGuideOpen(false)} 
                  className="text-alabaster/40 hover:text-bloodred transition-colors text-xs font-mono font-bold tracking-widest"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Sizing Grid Table */}
              <div className="space-y-6 mb-12">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-stone font-bold mb-4">Garment Measurements</h3>
                <div className="border border-alabaster/10 text-xs text-alabaster/60 overflow-hidden bg-stone/20">
                  <div className="grid grid-cols-4 bg-alabaster/5 p-3 font-bold text-[9px] uppercase tracking-widest text-stone border-b border-alabaster/10">
                    <span>Size</span>
                    <span>Chest</span>
                    <span>Length</span>
                    <span>Sleeve</span>
                  </div>
                  {[
                    { s: 'S', c: '25"', l: '24"', sl: '22"' },
                    { s: 'M', c: '26.5"', l: '25.5"', sl: '23.5"' },
                    { s: 'L', c: '28"', l: '27"', sl: '25"' },
                    { s: 'XL', c: '29.5"', l: '28.5"', sl: '26.5"' },
                    { s: '2XL', c: '31"', l: '30"', sl: '28"' },
                  ].map((row) => (
                    <div key={row.s} className="grid grid-cols-4 p-3 border-b border-alabaster/5 last:border-0 hover:bg-alabaster/5 transition-colors">
                      <span className="font-bold text-alabaster">{row.s}</span>
                      <span>{row.c}</span>
                      <span>{row.l}</span>
                      <span>{row.sl}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] uppercase tracking-widest text-stone leading-relaxed">
                  ALL MEASUREMENTS ARE IN INCHES AND ARE TRUE TO SIZE
                </p>
              </div>

              {/* Interactive Fit Advisor */}
              <div className="space-y-6 bg-[#111111] p-8 border border-bloodred/20 rounded-sm">
                <div>
                  <h3 className="text-sm font-serif text-alabaster">Interactive Fit Advisor</h3>
                  <p className="text-[9px] uppercase tracking-widest text-stone mt-1">Get precise size recommendations instantly</p>
                </div>

                <form onSubmit={calculateAdvisorSize} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest font-semibold text-stone mb-2">Height (cm)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 178" 
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-charcoal border border-alabaster/10 px-4 py-3 text-[10px] tracking-widest font-semibold text-alabaster focus:outline-none focus:border-bloodred uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest font-semibold text-stone mb-2">Weight (kg)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 74" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-charcoal border border-alabaster/10 px-4 py-3 text-[10px] tracking-widest font-semibold text-alabaster focus:outline-none focus:border-bloodred uppercase"
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-bloodred text-alabaster py-3 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-alabaster hover:text-charcoal transition-colors"
                  >
                    Analyze Sizing Profile
                  </button>
                </form>

                <AnimatePresence>
                  {advisorResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="border-t border-alabaster/10 pt-6 mt-6 space-y-4"
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] uppercase tracking-widest text-stone font-bold">Recommended Size</span>
                        <span className="text-4xl font-serif text-bloodred font-bold">{advisorResult}</span>
                      </div>
                      <p className="text-[10px] text-alabaster/60 leading-relaxed font-light">
                        Based on your profile, we recommend size <span className="font-bold text-bloodred">{advisorResult}</span> for the intended **Boxy Streetwear Silhouette**. If you prefer a closer fit, we suggest selecting one size down.
                      </p>
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedSize(advisorResult);
                          setIsSizeGuideOpen(false);
                        }}
                        className="text-[9px] uppercase tracking-widest font-bold underline hover:text-bloodred underline-offset-4 decoration-bloodred/40"
                      >
                        Apply Recommended Size: {advisorResult}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
