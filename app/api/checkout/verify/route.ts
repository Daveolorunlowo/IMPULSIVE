import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';
import { PaymentService } from '@/services/payment.service';
import { OrderService } from '@/services/order.service';

/**
 * GET /api/checkout/verify
 * Verifies a Paystack transaction and updates the order status.
 */
export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'MISSING_REFERENCE' }, { status: 400 });
    }

    const supabase = (await import('@/lib/supabase')).getSupabaseAdmin();

    // Verify with Paystack
    const paystackData = await PaymentService.verifyTransaction(reference);

    if (paystackData.data.status !== 'success') {
      return NextResponse.json({ error: 'PAYMENT_NOT_SUCCESSFUL', details: paystackData.data }, { status: 400 });
    }

    // Idempotently fulfill the order
    const order = await OrderService.fulfillOrder(reference, supabase);

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[GET /api/checkout/verify]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
