'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe');
      
      setNewsletterStatus('success');
      setNewsletterMessage('Welcome to the circle.');
      setEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 5000);
    } catch (err: any) {
      setNewsletterStatus('error');
      if (err.message === 'ALREADY_SUBSCRIBED') {
        setNewsletterMessage('You are already on the list.');
      } else if (err.message === 'DISPOSABLE_EMAIL') {
        setNewsletterMessage('Temporary emails are not permitted.');
      } else {
        setNewsletterMessage('Something went wrong. Try again.');
      }
      setTimeout(() => setNewsletterStatus('idle'), 5000);
    }
  };


  return (
    <footer className="pt-40 pb-20 bg-charcoal text-alabaster overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 items-start mb-40">
          
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-8">
            <Link href="/" className="inline-block">
              <Logo 
                variant="red" 
                className="h-8 w-40"
              />
            </Link>
            <p className="text-sm text-alabaster/40 font-light leading-relaxed">
              High-quality modern streetwear made with premium fabrics.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred">Navigation</h4>
            <div className="flex flex-col gap-4 text-sm font-light text-alabaster/60">
              <Link href="/shop" className="hover:text-bloodred transition-colors">The Collection</Link>
              <Link href="/lookbook" className="hover:text-bloodred transition-colors">Archive</Link>

              <a href="mailto:wearimpulsive@gmail.com" className="hover:text-bloodred transition-colors">Contact</a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred">Client Services</h4>
            <div className="flex flex-col gap-4 text-sm font-light text-alabaster/60">
              <Link href="/client-services?tab=shipping" className="hover:text-bloodred transition-colors">Shipping & Returns</Link>
              <Link href="/client-services?tab=size-guide" className="hover:text-bloodred transition-colors">Size Guide</Link>
              <Link href="/client-services?tab=privacy" className="hover:text-bloodred transition-colors">Privacy Policy</Link>
              <Link href="/client-services?tab=terms" className="hover:text-bloodred transition-colors">Terms of Use</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-8 lg:col-span-1">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-bloodred">Newsletter</h4>
            <p className="text-xs text-alabaster/40 font-light">Join our circle for exclusive updates.</p>
            <form 
              onSubmit={handleNewsletterSubmit}
              className="flex items-center gap-4 border-b border-alabaster/20 pb-4 relative"
            >
              <input 
                type="email" 
                placeholder="Your email address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={newsletterStatus === 'loading'}
                className="bg-transparent text-sm w-full outline-none placeholder:text-alabaster/10 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_50px_#000_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#FFF]"
                suppressHydrationWarning
              />
              <button type="submit" disabled={newsletterStatus === 'loading'} className="text-[10px] uppercase tracking-widest font-semibold text-bloodred hover:text-alabaster transition-colors shrink-0 disabled:opacity-50" suppressHydrationWarning>
                {newsletterStatus === 'loading' ? 'Joining...' : 'Subscribe'}
              </button>
            </form>
            {newsletterStatus !== 'idle' && (
              <p className={`text-[10px] uppercase tracking-widest mt-2 ${newsletterStatus === 'success' ? 'text-alabaster/60' : 'text-bloodred'}`}>
                {newsletterMessage}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-alabaster/5 flex flex-col md:flex-row justify-between items-center gap-8 relative">
          <div className="text-[10px] uppercase tracking-[0.3em] text-alabaster/20 font-semibold">
            © 2026 Impulsive Studio. All Rights Reserved.
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] text-alabaster/40 font-semibold">
            <Link href="https://wa.me/2349018389254" target="_blank" rel="noopener noreferrer" className="hover:text-bloodred transition-colors">WhatsApp</Link>
            <Link href="https://www.instagram.com/wearimpulsive_/" target="_blank" rel="noopener noreferrer" className="hover:text-bloodred transition-colors">Instagram</Link>
            <Link href="https://www.tiktok.com/@wearimpulsive_" target="_blank" rel="noopener noreferrer" className="hover:text-bloodred transition-colors">TikTok</Link>
            <Link href="https://x.com/wear_impulsive?s=11" target="_blank" rel="noopener noreferrer" className="hover:text-bloodred transition-colors">X</Link>
            <Link href="https://snapchat.com/t/0VXA51xA" target="_blank" rel="noopener noreferrer" className="hover:text-bloodred transition-colors">Snapchat</Link>
          </div>

          
        </div>
      </div>

      
    </footer>
  );
}
