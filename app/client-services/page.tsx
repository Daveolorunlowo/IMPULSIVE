import React, { Suspense } from 'react';
import { HelpCircle } from 'lucide-react';
import ClientServicesContent from './client-page';

export const unstable_instant = true;

export default function ClientServicesPage() {
  return (
    <Suspense fallback={
      <div className="pt-40 pb-40 min-h-screen bg-alabaster text-charcoal flex items-center justify-center">
        <div className="text-center space-y-4">
          <HelpCircle size={40} className="animate-pulse text-bloodred mx-auto" />
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-stone">Initializing Client Services...</p>
        </div>
      </div>
    }>
      <ClientServicesContent />
    </Suspense>
  );
}
