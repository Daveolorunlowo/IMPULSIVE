import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSupabaseClient } from '@/lib/supabase';

// Helper to convert snake_case DB columns to camelCase frontend model
const toCamelCase = (dbProduct: any) => ({
  id: dbProduct.id,
  slug: dbProduct.slug,
  name: dbProduct.name,
  category: dbProduct.category,
  price: Number(dbProduct.price),
  description: dbProduct.description,
  mainImage: dbProduct.main_image,
  hoverImage: dbProduct.hover_image,
  images: dbProduct.images || [],
  details: dbProduct.details || [],
  sizes: dbProduct.sizes || [],
  colors: dbProduct.colors || [],
  status: dbProduct.status || 'in_stock',
});

/**
 * GET /api/products
 * Fetches all products from the database
 */
export const GET = async () => {
  try {
    // Public fetch, bypass RLS since we want everyone to see products
    const supabase = (await import('@/lib/supabase')).getSupabaseAdmin();

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[GET /api/products] DB Error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, products: products.map(toCamelCase) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[GET /api/products]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
