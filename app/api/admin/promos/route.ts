import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';

// Helper to check admin access
const isAdmin = (email: string | undefined | null) => {
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'orders@wearimpulsive.site').toLowerCase();
  return process.env.NODE_ENV === 'development' || email?.toLowerCase() === adminEmail;
};

export const GET = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const userEmail = (ctx.userClaims as any)?.email;
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const supabase = ctx.supabaseAdmin as any;
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
});

export const POST = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const userEmail = (ctx.userClaims as any)?.email;
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const { code, discount_percentage, is_active } = await req.json();

    if (!code || typeof discount_percentage !== 'number') {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }

    const supabase = ctx.supabaseAdmin as any;
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
});

export const DELETE = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const userEmail = (ctx.userClaims as any)?.email;
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'MISSING_ID' }, { status: 400 });
    }

    const supabase = ctx.supabaseAdmin as any;
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
});
