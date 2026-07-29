import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';
import { products } from '@/lib/products';



export const GET = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    
    // Security Check
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const supabase = (await import('@/lib/supabase')).getSupabaseAdmin();

    // Loop through hardcoded products and insert/upsert into DB
    const insertData = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      main_image: p.mainImage,
      hover_image: p.hoverImage,
      images: p.images,
      details: p.details,
      sizes: p.sizes,
      colors: p.colors,
      status: p.status,
    }));

    const { error } = await supabase
      .from('products')
      .upsert(insertData, { onConflict: 'id' });

    if (error) {
      console.error('[seed-products] DB Error:', error);
      return NextResponse.json({ error: 'DATABASE_INSERT_FAILED', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Successfully seeded ${insertData.length} products.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin GET /seed-products]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
