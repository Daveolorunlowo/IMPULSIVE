import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';

/**
 * GET /api/cart/sync
 * Fetches the current cart items from the database for the logged-in user.
 */
export const GET = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const supabase = ctx.supabaseAdmin as any; // Using admin to bypass RLS for now
    const userId = (ctx.userClaims as any)?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data: cart, error } = await supabase
      .from('user_carts')
      .select('items')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
      throw error;
    }

    return NextResponse.json({ success: true, items: cart?.items || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[GET /api/cart/sync]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

/**
 * POST /api/cart/sync
 * Saves the current cart items to the database for the logged-in user.
 */
export const POST = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const supabase = ctx.supabaseAdmin as any;
    const userId = (ctx.userClaims as any)?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'INVALID_DATA' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_carts')
      .upsert({ 
        user_id: userId, 
        items,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[POST /api/cart/sync]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
