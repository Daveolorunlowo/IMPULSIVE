import { EmailService } from '@/services/email.service';

export class OrderService {
  /**
   * Idempotently fulfills an order. 
   * Marks it as paid, generates a tracking number, appends to the audit timeline, and sends the confirmation email.
   * If the order is already paid, it simply returns the existing order.
   */
  static async fulfillOrder(reference: string, supabase: any) {
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('status, metadata')
      .eq('payment_reference', reference)
      .single();

    if (!existingOrder) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (existingOrder.status === 'paid') {
      // Already fulfilled, just return the full order
      const { data: order } = await supabase
        .from('orders')
        .select(`
          id,
          total_price,
          status,
          payment_reference,
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
        .eq('payment_reference', reference)
        .single();
      return order;
    }

    // Not fulfilled yet, process it
    const trackingCode = existingOrder.metadata?.tracking_number || `IMP-TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newMetadata = { 
      ...(existingOrder.metadata || {}), 
      tracking_number: trackingCode,
      status_history: [
        ...(existingOrder.metadata?.status_history || []),
        { status: 'paid', date: new Date().toISOString() }
      ]
    };

    const { data: updatedOrder, error } = await supabase
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
        status,
        payment_reference,
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

    if (error || !updatedOrder) {
      throw new Error(error?.message || 'DB_UPDATE_FAILED');
    }

    // Send confirmation email
    const customerEmail = updatedOrder.metadata?.email || updatedOrder.metadata?.shippingAddress?.email;
    if (customerEmail) {
      EmailService.sendOrderConfirmation(customerEmail, updatedOrder).catch(e => {
        console.error('[Fulfillment] Email dispatch failed:', e);
      });
    }

    return updatedOrder;
  }
}
