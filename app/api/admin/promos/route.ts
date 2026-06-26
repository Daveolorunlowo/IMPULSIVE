import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const GET = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const { data: promos, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, promos });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin GET /promos]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const { code, discount_percentage, is_active } = await req.json();

    if (!code || typeof discount_percentage !== 'number') {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: newPromo, error } = await supabase
      .from('promo_codes')
      .insert({
        code: code.toUpperCase().trim(),
        discount_percentage,
        is_active: is_active !== false, // defaults to true
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return NextResponse.json({ error: 'PROMO_CODE_EXISTS' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, promo: newPromo });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin POST /promos]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const DELETE = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'MISSING_ID' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin DELETE /promos]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
