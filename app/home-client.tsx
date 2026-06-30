'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/store/useProducts';
import { useCurrency } from '@/store/useCurrency';
import { motion, AnimatePresence, useSpring } from 'framer-motion';

export default function HomeClient() {
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 4);
  const { formatPrice } = useCurrency();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  // Newsletter State
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

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
        if (data.error === 'ALREADY_SUBSCRIBED') {
          setNewsletterMsg('You are already in the club.');
        } else if (data.error === 'DISPOSABLE_EMAIL') {
          setNewsletterMsg('Please use a real email address.');
        } else if (data.error === 'TOO_MANY_REQUESTS') {
          setNewsletterMsg('Too many attempts. Try again later.');
        } else {
          setNewsletterMsg(data.error || 'Something went wrong.');
        }
      } else {
        setNewsletterStatus('success');
        setNewsletterMsg('Welcome to the Inner Circle.');
        setEmail('');
      }
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterMsg('Network error. Please try again.');
    }
  };

  // Smooth cursor setup
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      // Parallax calculations
      const x = (e.clientX / window.innerWidth - 0.5) * 30; // Max 15px movement
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Section tracking for dots
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const current = Math.round(scrollPosition / windowHeight);
      setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === featuredProducts.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? featuredProducts.length - 1 : prev - 1));
  };

  useEffect(() => {
    document.documentElement.style.scrollSnapType = 'y mandatory';
    return () => {
      document.documentElement.style.scrollSnapType = '';
    };
  }, []);

  // Interactive Cursor
  const cursorX = useSpring(cursorPosition.x, { stiffness: 300, damping: 20 });
  const cursorY = useSpring(cursorPosition.y, { stiffness: 300, damping: 20 });

  return (
    <div className="w-full bg-charcoal text-alabaster overflow-hidden">
      
      {/* Custom Cursor */}
      <motion.div 
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-bloodred pointer-events-none z-[100] mix-blend-difference hidden md:flex items-center justify-center"
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: isHovering ? 2 : 1, backgroundColor: isHovering ? '#FF0000' : 'transparent' }}
        transition={{ duration: 0.2 }}
      />

      {/* Progress Dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 hidden md:flex">
        {[0, 1, 2, 3, 4].map((idx) => (
          <div 
            key={idx} 
            className={`w-2 h-2 rounded-full transition-all duration-500 ${activeSection === idx ? 'bg-bloodred h-8' : 'bg-alabaster/30'}`}
          />
        ))}
      </div>
      
      {/* Slide 1: The Hero */}
      <section className="h-screen w-full snap-start snap-always relative flex items-center justify-center overflow-hidden">
        <video 
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-charcoal/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
        
        {/* Abstract Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-bloodred/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full px-6 flex flex-col items-center text-center mt-20">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h2 className="text-sm md:text-xl font-sans text-alabaster/80 uppercase tracking-[0.5em] mb-4">
              Welcome To
            </h2>
            <h1 className="text-[14vw] sm:text-[10vw] md:text-[120px] lg:text-[160px] font-display text-alabaster leading-[0.8] tracking-tighter uppercase font-bold drop-shadow-2xl">
              Wear<br />
              <span className="text-transparent stroke-text drop-shadow-2xl">Impulsive</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="mt-12"
          >
            <Link href="/shop" className="group relative px-8 py-4 bg-alabaster text-charcoal font-bold uppercase tracking-widest text-xs overflow-hidden rounded-sm transition-all hover:bg-transparent border border-alabaster inline-block">
              <span className="relative z-10 transition-colors duration-500 group-hover:text-alabaster">Explore Collection</span>
              <div className="absolute inset-0 h-full w-full bg-bloodred translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
            </Link>
          </motion.div>
        </div>


      </section>

      {/* Slide 2: Manifesto / Breather */}
      <section className="h-screen w-full snap-start snap-always relative flex flex-col items-center justify-center bg-charcoal px-6 md:px-24">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-bloodred font-bold block mb-12">Our Vision</span>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif text-alabaster leading-[1.3] font-light italic">
            "We design clothing that looks great, fits perfectly, and stands out. High-quality streetwear in every piece."
          </h2>
          <div className="w-12 h-[1px] bg-bloodred mx-auto mt-12" />
        </div>
      </section>

      {/* Slide 3: Featured Products Slideshow with Parallax */}
      <section className="h-screen w-full snap-start snap-always relative flex items-center justify-center overflow-hidden bg-charcoal">
        {featuredProducts.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlide}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1.05, x: mousePosition.x, y: mousePosition.y }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ opacity: { duration: 0.8 }, scale: { duration: 1.5 }, x: { type: "spring", stiffness: 50 }, y: { type: "spring", stiffness: 50 } }}
              >
            <Image 
              src={featuredProducts[currentSlide].mainImage}
              alt={featuredProducts[currentSlide].name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-charcoal/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-transparent opacity-90" />
            
            <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 md:px-24 lg:px-32 flex items-center h-full">
              <motion.div 
                initial={{ opacity: 0, filter: "blur(10px)", x: -30 }}
                animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="max-w-2xl pointer-events-none"
              >
                <span className="text-[10px] uppercase tracking-[0.4em] text-bloodred font-bold block mb-6">
                  Look 0{currentSlide + 1} // {featuredProducts[currentSlide].category}
                </span>
                
                {/* Glitch text effect wrapper */}
                <div className="relative group">
                  <h2 className="text-4xl sm:text-5xl md:text-8xl font-serif text-alabaster leading-[1.1] mb-8 relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
                    {featuredProducts[currentSlide].name}
                  </h2>
                  <h2 className="absolute top-0 left-0 text-4xl sm:text-5xl md:text-8xl font-serif text-bloodred leading-[1.1] mb-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:translate-y-1 transition-all duration-300 -z-10">
                    {featuredProducts[currentSlide].name}
                  </h2>
                </div>

                <p className="text-alabaster/70 text-base md:text-lg leading-relaxed mb-12 max-w-xl font-light">
                  {featuredProducts[currentSlide].description}
                </p>
                
                <div className="grid grid-cols-2 gap-8 mb-12 max-w-md pointer-events-auto">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-stone block mb-2">Price</span>
                    <span className="text-2xl font-serif text-bloodred" suppressHydrationWarning>{formatPrice(featuredProducts[currentSlide].price)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-stone block mb-2">Sizes</span>
                    <div className="flex gap-2">
                      {featuredProducts[currentSlide].sizes.map(size => (
                        <Link 
                          key={size} 
                          href={`/products/${featuredProducts[currentSlide].slug}`}
                          className="text-xs font-sans border border-alabaster/20 px-2 py-1 hover:bg-alabaster hover:text-charcoal transition-colors cursor-pointer"
                        >
                          {size}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <Link 
                  href="/shop"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="pointer-events-auto bg-bloodred text-alabaster px-12 py-5 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-alabaster hover:text-charcoal transition-all inline-block"
                >
                  Shop The Look
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slideshow Controls */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          {featuredProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={`transition-all duration-500 ease-out rounded-full ${
                currentSlide === idx 
                  ? 'w-12 h-2 bg-bloodred' 
                  : 'w-2 h-2 bg-alabaster/40 hover:bg-alabaster'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal">
            <div className="w-16 h-16 border-t-2 border-bloodred border-solid rounded-full animate-spin mb-8" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-alabaster/50 font-bold animate-pulse">Syncing Archive...</p>
          </div>
        )}
      </section>

      {/* Slide 4: Transition / Breather */}
      <section className="h-screen w-full snap-start snap-always relative flex flex-col items-center justify-center bg-bloodred overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 opacity-20 pointer-events-none -rotate-2 scale-110 z-0">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="flex text-[100px] md:text-[200px] font-display font-bold uppercase text-charcoal whitespace-nowrap"
          >
            <span className="mr-8">WEAR IMPULSIVE // WEAR IMPULSIVE //</span>
            <span className="mr-8">WEAR IMPULSIVE // WEAR IMPULSIVE //</span>
            <span className="mr-8">WEAR IMPULSIVE // WEAR IMPULSIVE //</span>
          </motion.div>
        </div>
        <div className="relative z-10 text-center px-6">
          <h2 className="text-5xl md:text-8xl font-serif text-charcoal leading-none mb-6">Pure Style.</h2>
          <p className="text-charcoal/80 text-xs md:text-sm tracking-[0.3em] uppercase font-bold">Designing the future of streetwear.</p>
        </div>
      </section>

      {/* Slide 5: The Finale */}
      <section className="h-screen w-full snap-start snap-always relative flex flex-col items-center justify-center bg-[#050505] px-6 text-center overflow-hidden">
        <motion.div 
            className="absolute inset-0 w-full h-full"
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
          <Image 
            src="/images/cta.png"
            alt="Call to Action"
            fill
            className="object-cover opacity-30 mix-blend-luminosity grayscale"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/80" />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-bloodred font-bold block mb-8">Inner Circle</span>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif text-alabaster leading-[1.1] mb-6 md:mb-8 break-words">
            Join Our Club.
          </h2>
          <p className="text-alabaster/60 mb-12 text-sm md:text-base leading-relaxed max-w-lg mx-auto font-light">
            Sign up to get early access to new releases, limited drops, and special events.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row justify-center items-stretch gap-3 sm:gap-0 w-full max-w-lg mx-auto">
            <input 
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
              placeholder="ENTER EMAIL ADDRESS" 
              className="bg-alabaster/5 backdrop-blur-md border border-alabaster/30 focus:border-bloodred focus:bg-alabaster/10 transition-all text-alabaster placeholder:text-alabaster/60 px-8 py-5 outline-none text-[10px] uppercase tracking-[0.2em] text-center sm:text-left w-full disabled:opacity-50" 
              suppressHydrationWarning
            />
            <button 
              type="submit"
              disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="bg-alabaster text-charcoal border border-alabaster px-10 py-5 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-bloodred hover:text-alabaster hover:border-bloodred transition-all w-full sm:w-auto flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning
            >
              {newsletterStatus === 'loading' ? 'Joining...' : newsletterStatus === 'success' ? 'Joined' : 'Join Now'}
            </button>
          </form>
          {newsletterMsg && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 text-[10px] uppercase tracking-[0.2em] font-bold ${newsletterStatus === 'error' ? 'text-bloodred' : 'text-alabaster/60'}`}
            >
              {newsletterMsg}
            </motion.p>
          )}
        </div>
      </section>

    </div>
  );
}
