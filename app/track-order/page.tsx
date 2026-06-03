import React, { Suspense } from 'react';
import TrackClient from './track-client';

export const unstable_instant = true;

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal text-alabaster flex items-center justify-center">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-stone animate-pulse">Loading Tracking Systems...</p>
      </div>
    }>
      <TrackClient />
    </Suspense>
  );
}
