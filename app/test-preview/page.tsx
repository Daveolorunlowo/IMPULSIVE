import React from 'react';
import SocialPreview from '@/components/SocialPreview';

export default function TestPreviewPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone p-8 py-20">
      <div className="max-w-3xl w-full flex flex-col items-center gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-bold text-alabaster">WEARIMPULSIVE</h1>
          <p className="text-alabaster/50 font-mono text-sm uppercase tracking-widest">Brand-aligned Social Previews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          <SocialPreview
            title="WEARIMPULSIVE"
            description="Curated collections for the modern era. Experience refined shopping with archival design systems built for longevity."
            image="/images/lookout-logo.jpeg"
            imageFit="contain"
            url="https://wearimpulsive.site/"
            className="w-full"
          />

          <SocialPreview
            title="IMPULSIVE FREEDOM MAN TEE WHITE"
            description="The IMPULSIVE FREEDOM MAN TEE WHITE features a vibrant graphic design."
            image="/images/freedom-tee-main.jpeg"
            url="https://wearimpulsive.site/products/impulsive-freedom-man-tee-white"
            className="w-full"
          />

          <SocialPreview
            title="IMPULSIVE FREEDOM MAN TEE BLACK"
            description="The IMPULSIVE FREEDOM MAN TEE BLACK features a vibrant graphic design."
            image="/images/freedom-tee-black-main.jpeg"
            url="https://wearimpulsive.site/products/impulsive-freedom-man-tee-black"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
