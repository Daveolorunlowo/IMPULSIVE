import React, { Suspense } from 'react';
import WishlistClient from './wishlist-client';

export const unstable_instant = true;

export default function WishlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal text-alabaster flex items-center justify-center">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-stone animate-pulse">Loading Wishlist...</p>
      </div>
    }>
      <WishlistClient />
    </Suspense>
  );
}
