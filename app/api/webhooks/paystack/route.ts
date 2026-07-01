import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { OrderService } from '@/services/order.service';
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

    try {
      await OrderService.fulfillOrder(reference, supabase);
      console.log(`[Webhook] Order ${reference} fulfilled successfully.`);
    } catch (err: any) {
      console.error('[Webhook] Fulfillment failed:', err.message);
      return NextResponse.json({ error: 'FULFILLMENT_FAILED' }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 'received' });
});
