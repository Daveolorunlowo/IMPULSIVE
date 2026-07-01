import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/orders
 * Fetches all orders across the platform.
 */
export const GET = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    
    // Security Check
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

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
};

/**
 * PATCH /api/admin/orders
 * Updates the status of an order.
 */
export const PATCH = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    
    // Security Check
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // First fetch existing metadata
    let selectQuery = supabase.from('orders').select('metadata');
    if (orderId.startsWith('IMP-')) {
      selectQuery = selectQuery.eq('payment_reference', orderId);
    } else {
      selectQuery = selectQuery.eq('id', orderId);
    }
    
    const { data: existingOrder, error: fetchError } = await selectQuery.single();

    if (fetchError) {
      console.error('[Admin PATCH /orders fetch]', fetchError.message);
      return NextResponse.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
    }

    const newHistoryEvent = { status, date: new Date().toISOString() };
    const newMetadata = { 
      ...(existingOrder?.metadata || {}), 
      status_history: [
        ...(existingOrder?.metadata?.status_history || []), 
        newHistoryEvent
      ] 
    };

    let updateQuery = supabase.from('orders').update({ status, metadata: newMetadata });
    
    // Support matching by payment_reference (IMP-XXXX) or database UUID
    if (orderId.startsWith('IMP-')) {
      updateQuery = updateQuery.eq('payment_reference', orderId);
    } else {
      updateQuery = updateQuery.eq('id', orderId);
    }

    const { data: updatedOrder, error } = await updateQuery.select().single();

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
};
