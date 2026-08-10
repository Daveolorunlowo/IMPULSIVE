import React from 'react';
import SocialPreview from '@/components/SocialPreview';

export default function TestPreviewPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone p-8">
      <div className="max-w-3xl w-full flex flex-col items-center gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-bold text-alabaster">WEARIMPULSIVE</h1>
          <p className="text-alabaster/50 font-mono text-sm uppercase tracking-widest">Brand-aligned Social Preview</p>
        </div>

        <SocialPreview
          title="WEARIMPULSIVE"
          description="Curated collections for the modern era. Experience refined shopping with archival design systems built for longevity."
          image="/images/lookout-logo.jpeg"
          imageFit="contain"
          url="https://wearimpulsive.site/"
        />
      </div>
    </div>
  );
}
