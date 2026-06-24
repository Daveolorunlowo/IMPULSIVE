import React, { Suspense } from 'react';
import HomeClient from './home-client';
import { HelpCircle } from 'lucide-react';


export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal text-alabaster flex items-center justify-center">
        <div className="text-center space-y-4">
          <HelpCircle size={40} className="animate-pulse text-bloodred mx-auto" />
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-stone">Entering Impulsive Studio...</p>
        </div>
      </div>
    }>
      <HomeClient />
    </Suspense>
  );
}
