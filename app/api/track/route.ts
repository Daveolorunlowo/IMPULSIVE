import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: 'MISSING_CODE' }, { status: 400 });
    }

    const cleanedCode = code.trim().toUpperCase();
    const isTrackingCode = cleanedCode.startsWith('IMP-TRK-');

    const supabase = getSupabaseAdmin();
    const query = supabase
      .from('orders')
      .select(`
        id,
        payment_reference,
        status,
        total_price,
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
      `);

    if (isTrackingCode) {
      query.eq('metadata->>tracking_number', cleanedCode);
    } else {
      query.eq('payment_reference', cleanedCode);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
    }

    // Map the database order structure to the frontend store structure expected by track-client
    const mappedOrder = {
      id: order.payment_reference,
      email: order.metadata?.email || '',
      fullName: order.metadata?.name || `${order.metadata?.shippingAddress?.firstName || ''} ${order.metadata?.shippingAddress?.lastName || ''}`.trim() || 'Customer',
      address: order.metadata?.shippingAddress?.address || 'Address not provided',
      city: order.metadata?.shippingAddress?.city || '',
      country: order.metadata?.shippingAddress?.country || '',
      totalPrice: order.total_price,
      currency: order.metadata?.currency || 'NGN',
      // Map raw backend statuses to the UI stepper states
      status: (order.status === 'pending' || order.status === 'paid') ? 'Processing' : 
              order.status === 'shipped' ? 'Shipped' :
              order.status === 'out_for_delivery' ? 'Out for Delivery' :
              order.status === 'delivered' ? 'Delivered' : 'Processing',
      trackingNumber: order.metadata?.tracking_number || '',
      createdAt: order.created_at,
      items: order.order_items?.map((item: any, idx: number) => ({
        id: `item-${idx}`,
        name: item.variants?.products?.name || 'Unknown Item',
        price: item.unit_price,
        quantity: item.quantity,
        image: item.variants?.products?.main_image || '',
        selectedSize: item.variants?.size || 'N/A',
        selectedColor: { name: item.variants?.color || 'N/A', hex: '' },
        customText: item.customText || ''
      })) || []
    };

    return NextResponse.json(mappedOrder);
  } catch (err: any) {
    console.error('[GET /api/track]', err.message);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
};
