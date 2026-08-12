import React, { Suspense } from 'react';
import { HelpCircle } from 'lucide-react';
import { ProductDetailSkeleton } from '@/components/SkeletonLoaders';
import { Metadata, ResolvingMetadata } from 'next';
import ProductDetailClient from './client-page';
import { products } from '@/lib/products';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = products.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      url: `https://wearimpulsive.site/products/${product.slug}`,
      images: [
        {
          url: product.mainImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
        ...previousImages,
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.mainImage],
    },
  };
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailClient params={params} />
    </Suspense>
  );
}
