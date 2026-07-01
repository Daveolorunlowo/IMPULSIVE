'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

function AuthPageInner() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  
  // Steps for signup flow
  const [step, setStep] = useState<'email' | 'verify' | 'password'>('email');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const passwordInputRef = React.useCallback((node: HTMLInputElement | null) => {
    if (node) {
      setTimeout(() => node.focus(), 150);
    }
  }, []);
  
  const { signup, verify, signin, setPassword: setAuthPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signin(email, password);
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signup(email);
      setStep('verify');
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

  const handleSignUpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await verify(code);
      setStep('password');
      setSuccessMsg('Email verified! Please set a password for future logins.');
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      await setAuthPassword(password);
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Failed to set password.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setStep('email');
    setError('');
    setSuccessMsg('');
    setPassword('');
    setCode('');
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6 pt-20 pb-12">
      <div className="max-w-md w-full">
        
        {/* Toggle Sign In / Sign Up */}
        {step === 'email' && (
          <div className="flex justify-center gap-8 mb-10 border-b border-stone/20 pb-4">
            <button 
              onClick={() => switchMode('signin')}
              className={`text-[10px] uppercase tracking-[0.3em] font-bold pb-2 transition-all ${
                mode === 'signin' 
                  ? 'text-bloodred border-b-2 border-bloodred' 
                  : 'text-alabaster/40 hover:text-alabaster'
              }`}
            >
              Log In
            </button>
            <button 
              onClick={() => switchMode('signup')}
              className={`text-[10px] uppercase tracking-[0.3em] font-bold pb-2 transition-all ${
                mode === 'signup' 
                  ? 'text-bloodred border-b-2 border-bloodred' 
                  : 'text-alabaster/40 hover:text-alabaster'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-alabaster mb-4">
            {mode === 'signin' ? 'Welcome Back' : (step === 'email' ? 'Join Us' : step === 'verify' ? 'Verify Email' : 'Set Password')}
          </h1>
          <p className="text-alabaster/40 text-[10px] uppercase tracking-[0.2em] font-bold">
            {mode === 'signin' 
              ? 'Enter your email and password' 
              : step === 'email' 
                ? 'Create a new account' 
                : step === 'verify' 
                  ? 'Please check your inbox for the code' 
                  : 'Secure your account'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'signin' && (
            <motion.form 
              key="signin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSignInSubmit}
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

              <div className="relative">
                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-alabaster/40" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone/40 border border-stone/50 focus:border-bloodred text-alabaster px-16 py-6 outline-none transition-all text-xs uppercase tracking-widest placeholder:text-alabaster/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] focus:shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-alabaster/40 hover:text-alabaster transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {error && <p className="text-bloodred text-[10px] uppercase tracking-widest text-center">{error}</p>}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-bloodred text-alabaster py-6 flex items-center justify-center gap-4 group hover:bg-alabaster hover:text-charcoal transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                  {isLoading ? 'Signing In...' : 'Log In'}
                </span>
                {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
                {isLoading && <Loader2 size={16} className="animate-spin" />}
              </button>
              
              <button 
                type="button"
                onClick={() => switchMode('signup')}
                className="w-full text-[8px] uppercase tracking-[0.4em] text-alabaster/40 hover:text-alabaster transition-colors py-4"
              >
                Forgot Password? Sign up again to reset it.
              </button>
            </motion.form>
          )}

          {mode === 'signup' && step === 'email' && (
            <motion.form 
              key="signup-email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSignUpEmailSubmit}
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
                  {isLoading ? 'Sending Code...' : 'Get Verification Code'}
                </span>
                {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
                {isLoading && <Loader2 size={16} className="animate-spin" />}
              </button>
            </motion.form>
          )}

          {mode === 'signup' && step === 'verify' && (
            <motion.form 
              key="signup-verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSignUpVerifySubmit}
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
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </span>
                {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
                {isLoading && <Loader2 size={16} className="animate-spin" />}
              </button>

              <button 
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-[8px] uppercase tracking-[0.4em] text-alabaster/40 hover:text-alabaster transition-colors py-4"
              >
                Wait, I need to change my email
              </button>
            </motion.form>
          )}

          {mode === 'signup' && step === 'password' && (
            <motion.form 
              key="signup-password"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSignUpPasswordSubmit}
              className="space-y-6"
            >
              {successMsg && <p className="text-green-500 text-[10px] uppercase tracking-widest text-center">{successMsg}</p>}
              <div className="relative">
                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-alabaster/40" size={18} />
                <input 
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="CREATE A PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone/40 border border-stone/50 focus:border-bloodred text-alabaster px-16 py-6 outline-none transition-all text-xs uppercase tracking-widest placeholder:text-alabaster/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] focus:shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-alabaster/40 hover:text-alabaster transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <p className="text-bloodred text-[10px] uppercase tracking-widest text-center">{error}</p>}

              <button 
                type="submit"
                disabled={isLoading || password.length < 6}
                className="w-full bg-bloodred text-alabaster py-6 flex items-center justify-center gap-4 group hover:bg-alabaster hover:text-charcoal transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                  {isLoading ? 'Saving...' : 'Complete Sign Up'}
                </span>
                {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
                {isLoading && <Loader2 size={16} className="animate-spin" />}
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
