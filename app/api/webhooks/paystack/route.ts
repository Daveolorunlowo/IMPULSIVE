import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
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

    const supabase = ctx.supabaseAdmin as any;

    // Use ctx.supabaseAdmin to bypass RLS and mark as paid
    const { error } = await supabase
      .from('orders')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('payment_reference', reference);

    if (error) {
      console.error('[Webhook] DB update failed:', error.message);
      return NextResponse.json({ error: 'DB_UPDATE_FAILED' }, { status: 500 });
    }

    console.log(`[Webhook] Order ${reference} marked as PAID.`);
  }

  return NextResponse.json({ status: 'received' });
});
