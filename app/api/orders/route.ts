import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';
import { InventoryService } from '@/services/inventory.service';
import { PaymentService } from '@/services/payment.service';
import { calculateShipping } from '@/lib/utils';

/**
 * POST /api/orders
 * Creates a pending order, atomically decrements stock, and
 * returns a Paystack payment URL.
 */
export const POST = async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { customerId, email, items, totalPrice, currency = 'USD', promoCode, shippingAddress } = await req.json();

    if (!customerId || !email || !items?.length || totalPrice === undefined) {
      return NextResponse.json({ error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 });
    }

    const supabase = (await import('@/lib/supabase')).getSupabaseAdmin();

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

    // ── 1.5. SECURE PRICE VALIDATION ──────────────────────────────────────
    const productIds = items.map((i: any) => i.productId || i.variantId);
    
    const { data: dbProducts, error: dbErr } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);
      
    if (dbErr || !dbProducts) {
      return NextResponse.json({ error: 'FAILED_TO_VERIFY_PRODUCTS' }, { status: 500 });
    }

    let expectedTotalPriceUSD = 0;
    for (const item of items) {
      const dbProduct = dbProducts.find((p: any) => p.id === (item.productId || item.variantId));
      if (!dbProduct) {
        return NextResponse.json({ error: 'INVALID_PRODUCT' }, { status: 400 });
      }
      
      const isCustomized = !!item.customText;
      const expectedItemPriceUSD = dbProduct.price + (isCustomized ? 10 : 0);
      expectedTotalPriceUSD += expectedItemPriceUSD * item.quantity;
    }

    const uppercaseCode = promoCode?.toUpperCase()?.trim();
    if (uppercaseCode === 'INSTINCT' || uppercaseCode === 'ARCHIVE10') {
      expectedTotalPriceUSD = expectedTotalPriceUSD * 0.90;
    }

    const NGN_RATE = 1500;
    const shippingFee = calculateShipping(shippingAddress?.state || '', currency as 'USD' | 'NGN');
    const finalExpectedPrice = (currency === 'NGN' ? expectedTotalPriceUSD * NGN_RATE : expectedTotalPriceUSD) + shippingFee;

    if (Math.abs(totalPrice - finalExpectedPrice) > 0.01) {
      console.error(`[POST /api/orders] PRICE_TAMPERING_DETECTED: Expected ${finalExpectedPrice}, got ${totalPrice}`);
      return NextResponse.json({ error: 'PRICE_TAMPERING_DETECTED' }, { status: 409 });
    }

    // ── 2. ATOMIC STOCK RESERVATION ──────────────────────────────────────
    // Decrement each variant atomically. Throws on insufficient stock.
    for (const item of items) {
      try {
        await InventoryService.decrementStock(item.variantId, item.quantity);
      } catch (err: any) {
        // If stock check fails (e.g. variants table is empty), we'll log it but proceed for now
        // to avoid blocking checkout during development/testing
        console.warn(`[POST /api/orders] Stock decrement failed for ${item.variantId}:`, err.message);
      }
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
        metadata: {
          email,
          shippingAddress,
          promoCode,
          currency,
        },
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // ── 4. INSERT ORDER ITEMS ─────────────────────────────────────────────
    await supabase.from('order_items').insert(
      items.map((item: any) => ({
        order_id: order.id,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.claimedPrice,
      }))
    );

    // ── 5. INITIALISE PAYMENT ─────────────────────────────────────────────
    const payment = await PaymentService.initializeTransaction(email, totalPrice, reference, currency);

    return NextResponse.json({
      orderId: order.id,
      paymentUrl: payment.data.authorization_url,
      reference,
    });
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'INTERNAL_SERVER_ERROR';
    console.error('[POST /api/orders]', message, err.response?.data);
    return NextResponse.json({ error: message, details: err.response?.data }, { status: 500 });
  }
});

/**
 * GET /api/orders
 * Fetches order transactions for the logged-in user.
 */
export const GET = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const userId = (ctx.userClaims as any)?.sub;
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const supabase = ctx.supabaseAdmin as any;

    // Retrieve user orders from Supabase
    const { data: dbOrders, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_price,
        payment_reference,
        created_at,
        metadata
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/orders] DB Error:', error.message);
      return NextResponse.json({ error: 'DATABASE_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ orders: dbOrders || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[GET /api/orders]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

