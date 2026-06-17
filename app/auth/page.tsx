'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

function AuthPageInner() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const emailInputRef = React.useCallback((node: HTMLInputElement | null) => {
    if (node) {
      setTimeout(() => node.focus(), 150);
    }
  }, []);

  const codeInputRef = React.useCallback((node: HTMLInputElement | null) => {
    if (node) {
      setTimeout(() => node.focus(), 150);
    }
  }, []);
  
  const { signup, verify, signin, verificationCode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Mocking API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await signup(email);
      setStep('verify');
      
      // Show dev code in UI for testing
      // We need to wait for the store to update
      setTimeout(() => {
        const currentCode = useAuth.getState().verificationCode;
        setDevCode(currentCode);
      }, 100);
    } catch (err: any) {
      if (err.message === 'DISPOSABLE_EMAIL') {
        setError('Temporary / disposable emails are not permitted. Please use a real email.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = verify(code);
      if (success) {
        router.push(redirectTo);
      } else {
        setError('Invalid verification code.');
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-alabaster mb-4">
            {step === 'email' ? 'Sign In' : 'Verify Email'}
          </h1>
          <p className="text-alabaster/40 text-xs uppercase tracking-[0.3em] font-bold">
            {step === 'email' ? 'Enter your email to sign in' : 'Please check your inbox for the code'}
          </p>
        </div>

        {/* Development Code Toast */}
        <AnimatePresence>
          {devCode && step === 'verify' && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="mb-8 bg-bloodred/10 border border-bloodred/30 p-4 text-center backdrop-blur-md"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-bloodred font-bold mb-2">Development Mode: Verification Code</p>
              <p className="text-3xl font-mono text-alabaster tracking-[0.5em]">{devCode}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form 
              key="email-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleEmailSubmit}
              className="space-y-6"
            >
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-alabaster/40" size={18} />
                <input 
                  ref={emailInputRef}
                  type="email"
                  required
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone/40 border border-stone/50 focus:border-bloodred text-alabaster px-16 py-6 outline-none transition-all text-xs uppercase tracking-widest placeholder:text-alabaster/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] focus:shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                />
              </div>
              
              {error && <p className="text-bloodred text-[10px] uppercase tracking-widest text-center">{error}</p>}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-bloodred text-alabaster py-6 flex items-center justify-center gap-4 group hover:bg-alabaster hover:text-charcoal transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                  {isLoading ? 'Sending...' : 'Continue'}
                </span>
                {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
                {isLoading && <Loader2 size={16} className="animate-spin" />}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="verify-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleVerifySubmit}
              className="space-y-6"
            >
              <div className="relative">
                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-alabaster/40" size={18} />
                <input 
                  ref={codeInputRef}
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-DIGIT CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-stone/40 border border-stone/50 focus:border-bloodred text-alabaster px-16 py-6 outline-none transition-all text-xs uppercase tracking-widest placeholder:text-alabaster/20 text-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] focus:shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                />
              </div>

              {error && <p className="text-bloodred text-[10px] uppercase tracking-widest text-center">{error}</p>}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-bloodred text-alabaster py-6 flex items-center justify-center gap-4 group hover:bg-alabaster hover:text-charcoal transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                  {isLoading ? 'Verifying...' : 'Sign In'}
                </span>
                {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
                {isLoading && <Loader2 size={16} className="animate-spin" />}
              </button>

              <button 
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-[8px] uppercase tracking-[0.4em] text-alabaster/40 hover:text-alabaster transition-colors py-4"
              >
                Back to email
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-12 border-t border-stone/10 text-center">
          <p className="text-[8px] uppercase tracking-[0.4em] text-alabaster/40 leading-relaxed">
            By proceeding, you agree to our terms of service.<br />
            Your security is our priority.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="w-8 h-8 border border-bloodred/40 rounded-full animate-pulse" />
      </div>
    }>
      <AuthPageInner />
    </Suspense>
  );
}
