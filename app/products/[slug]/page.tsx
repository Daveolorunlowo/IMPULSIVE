import React, { Suspense } from 'react';
import { HelpCircle } from 'lucide-react';
import ProductDetailClient from './client-page';
import { products } from '@/lib/products';


export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={
      <div className="pt-40 pb-40 min-h-screen bg-alabaster text-charcoal flex items-center justify-center">
        <div className="text-center space-y-4">
          <HelpCircle size={40} className="animate-pulse text-bloodred mx-auto" />
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-stone">Loading Product Details...</p>
        </div>
      </div>
    }>
      <ProductDetailClient params={params} />
    </Suspense>
  );
}
