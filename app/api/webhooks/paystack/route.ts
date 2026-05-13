import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/webhooks/paystack
 * Listens for Paystack events. Only updates order status after
 * cryptographic signature verification.
 */
export async function POST(req: Request) {
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

    const { error } = await getSupabaseAdmin()
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
}
