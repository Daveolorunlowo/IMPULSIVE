import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'orders@wearimpulsive.site';

/**
 * GET /api/admin/orders
 * Fetches all orders across the platform.
 */
export const GET = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const userEmail = (ctx.userClaims as any)?.email;
    // Security Check: Only allow the configured admin email (or allow all in local dev)
    if (userEmail !== ADMIN_EMAIL && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const supabase = ctx.supabaseAdmin as any;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_price,
        payment_reference,
        created_at,
        metadata,
        order_items (
          quantity,
          unit_price,
          variants (
            size,
            color,
            products (
              name,
              main_image
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin GET /orders]', error.message);
      return NextResponse.json({ error: 'DATABASE_ERROR' }, { status: 500 });
    }

    // Try to map customer_id to email if we can. Note: customer_id is a UUID referencing auth.users.
    // By default Supabase JS might not fetch auth.users directly via standard select unless a view exists.
    // For now, if the metadata contains the email, we'll use that as a fallback.

    return NextResponse.json({ orders: orders || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin GET /orders]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

/**
 * PATCH /api/admin/orders
 * Updates the status of an order.
 */
export const PATCH = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const userEmail = (ctx.userClaims as any)?.email;
    if (userEmail !== ADMIN_EMAIL && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }

    const supabase = ctx.supabaseAdmin as any;

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('[Admin PATCH /orders]', error.message);
      return NextResponse.json({ error: 'DATABASE_UPDATE_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin PATCH /orders]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
