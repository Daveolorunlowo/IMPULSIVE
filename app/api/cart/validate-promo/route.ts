import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';

/**
 * POST /api/cart/validate-promo
 * Body: { code: string }
 * Description: Validates a promo code against the database.
 * Does not require authentication, anyone can try to apply a promo code.
 */
export const POST = withSupabase({ auth: 'none' }, async (req, ctx) => {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'MISSING_CODE' }, { status: 400 });
    }

    const supabase = ctx.supabaseAdmin as any; // We use admin to bypass RLS if there is any, since this is a read-only query
    
    const uppercaseCode = code.toUpperCase().trim();

    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('discount_percentage, is_active')
      .eq('code', uppercaseCode)
      .single();

    if (error || !promo) {
      return NextResponse.json({ error: 'INVALID_CODE' }, { status: 404 });
    }

    if (!promo.is_active) {
      return NextResponse.json({ error: 'CODE_EXPIRED' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      discount_percentage: promo.discount_percentage 
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[POST /api/cart/validate-promo]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
