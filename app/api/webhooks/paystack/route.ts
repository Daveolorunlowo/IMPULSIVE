import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { EmailService } from '@/services/email.service';
import { withSupabase } from '@supabase/server';

/**
 * POST /api/webhooks/paystack
 * Listens for Paystack events. Only updates order status after
 * cryptographic signature verification.
 */
export const POST = withSupabase({ auth: 'none' }, async (req, ctx) => {
  const payload = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';

  // ── 1. VERIFY SIGNATURE ───────────────────────────────────────────────
  if (!PaymentService.verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 401 });
  }

  const event = JSON.parse(payload);

  // ── 2. HANDLE SUCCESSFUL PAYMENT ─────────────────────────────────────
  if (event.event === 'charge.success') {
    const reference: string = event.data.reference;
    const customerEmail: string = event.data.customer?.email;

    const supabase = ctx.supabaseAdmin as any;

    // 1. Fetch existing metadata so we don't overwrite shipping info
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('metadata')
      .eq('payment_reference', reference)
      .single();

    const trackingCode = `IMP-TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newMetadata = { ...(existingOrder?.metadata || {}), tracking_number: trackingCode };

    // Use ctx.supabaseAdmin to bypass RLS and mark as paid, returning the updated order with items
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status: 'paid', 
        updated_at: new Date().toISOString(),
        metadata: newMetadata
      })
      .eq('payment_reference', reference)
      .select(`
        id,
        total_price,
        metadata,
        order_items (
          quantity,
          unit_price,
          variants (
            size,
            color,
            products (
              name
            )
          )
        )
      `)
      .single();

    if (error || !order) {
      console.error('[Webhook] DB update failed:', error?.message);
      return NextResponse.json({ error: 'DB_UPDATE_FAILED' }, { status: 500 });
    }

    console.log(`[Webhook] Order ${reference} marked as PAID.`);

    // ── 3. SEND ORDER CONFIRMATION EMAIL ────────────────────────────────
    if (customerEmail) {
      // Send asynchronously without awaiting so the webhook returns quickly
      EmailService.sendOrderConfirmation(customerEmail, order).catch(e => {
        console.error('[Webhook] Email dispatch failed:', e);
      });
    }
  }

  return NextResponse.json({ status: 'received' });
});
