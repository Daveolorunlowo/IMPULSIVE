import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { InventoryService } from '@/services/inventory.service';
import { PaymentService } from '@/services/payment.service';

/**
 * POST /api/orders
 * Creates a pending order, atomically decrements stock, and
 * returns a Paystack payment URL.
 */
export async function POST(req: Request) {
  try {
    const { customerId, email, items, totalPrice } = await req.json();

    if (!customerId || !email || !items?.length || !totalPrice) {
      return NextResponse.json({ error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // ── 1. TIMED DROP WINDOW CHECK ────────────────────────────────────────
    const { data: activeDrop } = await supabase
      .from('drops')
      .select('*')
      .eq('is_active', true)
      .single();

    if (activeDrop) {
      const now = new Date();
      const start = new Date(activeDrop.start_time);
      const end = new Date(activeDrop.end_time);

      if (now < start || now > end) {
        return NextResponse.json(
          { error: 'THE DROP WINDOW IS CLOSED. Check back when the next release goes live.' },
          { status: 403 }
        );
      }
    }

    // ── 2. ATOMIC STOCK RESERVATION ──────────────────────────────────────
    // Decrement each variant atomically. Throws on insufficient stock.
    for (const item of items) {
      await InventoryService.decrementStock(item.variantId, item.quantity);
    }

    // ── 3. CREATE PENDING ORDER ───────────────────────────────────────────
    const reference = `IMP-${Date.now()}-${Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0')}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total_price: totalPrice,
        status: 'pending',
        payment_reference: reference,
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // ── 4. INSERT ORDER ITEMS ─────────────────────────────────────────────
    await supabase.from('order_items').insert(
      items.map((item: { variantId: string; quantity: number; claimedPrice: number }) => ({
        order_id: order.id,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.claimedPrice,
      }))
    );

    // ── 5. INITIALISE PAYMENT ─────────────────────────────────────────────
    const payment = await PaymentService.initializeTransaction(email, totalPrice, reference);

    return NextResponse.json({
      orderId: order.id,
      paymentUrl: payment.data.authorization_url,
      reference,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[POST /api/orders]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
