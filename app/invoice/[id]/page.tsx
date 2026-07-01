import React from 'react';
import { getSupabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,
      payment_reference,
      total_price,
      created_at,
      status,
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
    .eq('payment_reference', id)
    .single();

  if (!order) {
    return notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const clientName = order.metadata?.name || 
                     `${order.metadata?.shippingAddress?.firstName || ''} ${order.metadata?.shippingAddress?.lastName || ''}`.trim() || 
                     'Customer';
                     
  const clientEmail = order.metadata?.email || order.metadata?.shippingAddress?.email || '';
  const clientPhone = order.metadata?.phone || order.metadata?.shippingAddress?.phone || '';

  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-16 font-mono" style={{ printColorAdjust: 'exact' }}>
      <div className="max-w-4xl mx-auto border border-black p-8 md:p-12">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-black pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tighter uppercase mb-2">WEARIMPULSIVE</h1>
            <p className="text-sm">Official Receipt / Tax Invoice</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold uppercase tracking-widest mb-1">Invoice No.</p>
            <p className="text-xl">{order.payment_reference}</p>
            <p className="text-sm mt-4 font-bold uppercase tracking-widest">Date Issued</p>
            <p className="text-sm">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Client & Shipping Info */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-2 mb-4">Billed To</h2>
            <p className="font-bold text-sm">{clientName}</p>
            {clientEmail && <p className="text-sm mt-1">{clientEmail}</p>}
            {clientPhone && <p className="text-sm mt-1">{clientPhone}</p>}
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-2 mb-4">Shipping Address</h2>
            {order.metadata?.shippingAddress ? (
              <p className="text-sm leading-relaxed">
                {order.metadata.shippingAddress.address}<br />
                {order.metadata.shippingAddress.city}, {order.metadata.shippingAddress.state}<br />
                {order.metadata.shippingAddress.country}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">No shipping address provided</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-black">
                <th className="py-4 text-xs font-bold uppercase tracking-widest">Description</th>
                <th className="py-4 text-xs font-bold uppercase tracking-widest text-center">Qty</th>
                <th className="py-4 text-xs font-bold uppercase tracking-widest text-right">Unit Price</th>
                <th className="py-4 text-xs font-bold uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item: any, i: number) => {
                const productName = item.variants?.products?.name || 'Item';
                const variantInfo = [item.variants?.size, item.variants?.color].filter(Boolean).join(', ');
                
                return (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-4">
                      <p className="font-bold text-sm">{productName}</p>
                      {variantInfo && <p className="text-xs text-gray-500 mt-1">Variant: {variantInfo}</p>}
                    </td>
                    <td className="py-4 text-center text-sm">{item.quantity}</td>
                    <td className="py-4 text-right text-sm">{formatPrice(item.unit_price)}</td>
                    <td className="py-4 text-right font-bold text-sm">{formatPrice(item.unit_price * item.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-1/2">
            <div className="flex justify-between border-b border-black pb-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
              <span className="text-sm">{formatPrice(order.total_price)}</span>
            </div>
            <div className="flex justify-between border-b border-black pb-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest">Shipping</span>
              <span className="text-sm uppercase text-gray-500">Calculated at Checkout</span>
            </div>
            <div className="flex justify-between mt-4">
              <span className="text-sm font-bold uppercase tracking-widest">Total</span>
              <span className="text-xl font-bold">{formatPrice(order.total_price)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-black pt-8">
          <p className="text-xs uppercase tracking-widest font-bold mb-2">Thank you for your purchase.</p>
          <p className="text-xs text-gray-500">If you have any questions about this invoice, please contact support@wearimpulsive.com.</p>
        </div>
      </div>

      {/* Auto-print script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          `
        }}
      />
    </div>
  );
}
