import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Validates admin password
 */
const isAdminAuthorized = (req: Request) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
  const providedPassword = req.headers.get('x-admin-password');
  
  if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
    return false;
  }
  return true;
};

/**
 * POST /api/admin/products
 * Creates a new product
 */
export const POST = async (req: Request) => {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const insertData = {
      id: body.id, // using string ID like '9', '10'
      slug: body.slug,
      name: body.name,
      category: body.category,
      price: Number(body.price),
      description: body.description,
      main_image: body.mainImage,
      hover_image: body.hoverImage,
      images: body.images || [],
      details: body.details || [],
      sizes: body.sizes || [],
      colors: body.colors || [],
      status: body.status || 'in_stock',
    };

    const { data, error } = await supabase
      .from('products')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('[POST /api/admin/products] DB Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error('[POST /api/admin/products]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

/**
 * PATCH /api/admin/products
 * Updates an existing product
 */
export const PATCH = async (req: Request) => {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (updates.slug !== undefined) updateData.slug = updates.slug;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.price !== undefined) updateData.price = Number(updates.price);
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.mainImage !== undefined) updateData.main_image = updates.mainImage;
    if (updates.hoverImage !== undefined) updateData.hover_image = updates.hoverImage;
    if (updates.images !== undefined) updateData.images = updates.images;
    if (updates.details !== undefined) updateData.details = updates.details;
    if (updates.sizes !== undefined) updateData.sizes = updates.sizes;
    if (updates.colors !== undefined) updateData.colors = updates.colors;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[PATCH /api/admin/products] DB Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error('[PATCH /api/admin/products]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

/**
 * DELETE /api/admin/products
 * Deletes a product by ID
 */
export const DELETE = async (req: Request) => {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DELETE /api/admin/products] DB Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE /api/admin/products]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
