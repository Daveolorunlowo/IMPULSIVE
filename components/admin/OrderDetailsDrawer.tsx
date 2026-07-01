import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Check, Truck } from 'lucide-react';
import { useCurrency } from '@/store/useCurrency';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
  variants?: {
    size?: string;
    color?: string;
    products?: {
      name?: string;
      main_image?: string;
    };
  };
}

interface Order {
  id: string;
  payment_reference: string;
  created_at: string;
  total_price: number;
  status: string;
  metadata?: {
    email?: string;
    tracking_number?: string;
    shippingAddress?: any;
    name?: string;
  };
  order_items: OrderItem[];
}

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: string) => Promise<void>;
  onSaveTracking?: (orderId: string, trackingCode: string) => Promise<void>;
}

export default function OrderDetailsDrawer({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onSaveTracking
}: OrderDetailsDrawerProps) {
  const { formatPrice } = useCurrency();
  const [trackingCode, setTrackingCode] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [savedTracking, setSavedTracking] = useState(false);

  // Sync tracking code when order changes
  React.useEffect(() => {
    if (order) {
      setTrackingCode(order.metadata?.tracking_number || '');
      setSavedTracking(false);
    }
  }, [order]);

  if (!order) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (!onUpdateStatus || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    await onUpdateStatus(order.id, newStatus);
    setIsUpdatingStatus(false);
  };

  const handleTrackingSubmit = async () => {
    if (!onSaveTracking || !trackingCode.trim() || isSavingTracking) return;
    setIsSavingTracking(true);
    await onSaveTracking(order.id, trackingCode.trim());
    setIsSavingTracking(false);
    setSavedTracking(true);
    setTimeout(() => setSavedTracking(false), 3000);
  };

  const statuses = [
    { label: 'PROCESSING', value: 'paid' },
    { label: 'SHIPPED', value: 'shipped' },
    { label: 'OUT FOR DELIVERY', value: 'out_for_delivery' },
    { label: 'DELIVERED', value: 'delivered' }
  ];

  const isActiveStatus = (statusValue: string) => {
    if (statusValue === 'paid' && (order.status === 'paid' || order.status === 'pending')) return true;
    return order.status === statusValue;
  };

  const address = order.metadata?.shippingAddress;
  const formattedAddress = address
    ? (typeof address === 'string' ? address : `${address.address || ''}, ${address.city || ''}, ${address.state || ''}, ${address.country || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ','))
    : 'ADDRESS NOT PROVIDED';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-[#050505] z-50 rounded-t-3xl border-t border-white/10 overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Order Details</p>
                <p className="text-xs font-mono text-white mt-0.5">{order.payment_reference}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-stone hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">

              {/* Top Meta */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[9px] uppercase tracking-widest text-bloodred font-bold mb-2">Date</h4>
                  <p className="text-sm font-mono text-white">
                    {new Date(order.created_at).toLocaleDateString('en-GB')}
                    <br />
                    {new Date(order.created_at).toLocaleTimeString('en-GB')}
                  </p>
                </div>
                <div>
                  <h4 className="text-[9px] uppercase tracking-widest text-bloodred font-bold mb-2">Client</h4>
                  <p className="text-sm text-white font-serif">
                    {order.metadata?.name || `${order.metadata?.shippingAddress?.firstName || ''} ${order.metadata?.shippingAddress?.lastName || ''}`.trim() || 'Customer'}
                  </p>
                  <p className="text-xs font-mono text-zinc-400 mt-1 break-all flex flex-col gap-1">
                    <span>{order.metadata?.email || order.metadata?.shippingAddress?.email || 'N/A'}</span>
                    {order.metadata?.shippingAddress?.phone && (
                      <span>{order.metadata?.shippingAddress?.phone}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Value */}
              <div>
                <h4 className="text-[9px] uppercase tracking-widest text-bloodred font-bold mb-2">Value</h4>
                <p className="text-xl font-serif text-bloodred">
                  {formatPrice(order.total_price)}
                </p>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="text-[9px] uppercase tracking-widest text-bloodred font-bold mb-2">Delivery Address</h4>
                <p className="text-sm text-white uppercase tracking-wider">
                  {formattedAddress}
                </p>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="text-[9px] uppercase tracking-widest text-bloodred font-bold mb-4">Line Items</h4>
                <div className="space-y-4">
                  {order.order_items?.map((item, idx) => {
                    const itemName = item.name || item.variants?.products?.name || 'Unknown Item';
                    const itemImage = item.image || item.variants?.products?.main_image || null;
                    const itemSize = item.size || item.variants?.size || '';
                    const itemColor = item.color || item.variants?.color || '';

                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-charcoal rounded overflow-hidden flex-shrink-0">
                          {itemImage ? (
                            <img src={itemImage} alt={itemName} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone bg-white/5 text-[10px] uppercase">Img</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-alabaster mb-1">
                            {itemName}
                          </p>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                            {itemSize ? `SIZE ${itemSize}` : ''}
                            {itemColor ? ` - ${itemColor}` : ''}
                            {` - QTY ${item.quantity}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipment Status — clickable buttons */}
              <div>
                <h4 className="text-[9px] uppercase tracking-widest text-bloodred font-bold mb-4 flex items-center gap-2">
                  Shipment Status
                  {isUpdatingStatus && <Loader2 size={12} className="animate-spin text-bloodred" />}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      disabled={isUpdatingStatus || isActiveStatus(status.value)}
                      className={`py-3 px-2 text-[10px] uppercase tracking-widest font-bold transition-all border text-center flex items-center justify-center gap-1 disabled:cursor-not-allowed ${
                        isActiveStatus(status.value)
                          ? 'bg-bloodred text-white border-bloodred'
                          : 'bg-[#1a1a1a] text-zinc-300 border-white/20 hover:border-bloodred hover:text-white'
                      }`}
                    >
                      {isActiveStatus(status.value) && <Check size={10} />}
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracking Code — editable input with save button */}
              <div className="space-y-3">
                <h4 className="text-[9px] uppercase tracking-widest text-bloodred font-bold">Tracking Code</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Enter tracking number..."
                    className="flex-1 bg-[#111] border border-white/10 text-alabaster placeholder:text-stone/40 px-4 py-3 text-[10px] tracking-[0.1em] focus:outline-none focus:border-bloodred transition-colors"
                  />
                  <button
                    onClick={handleTrackingSubmit}
                    disabled={isSavingTracking || !trackingCode.trim()}
                    className={`px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      savedTracking
                        ? 'bg-emerald-600 text-white'
                        : 'bg-bloodred text-white hover:bg-alabaster hover:text-charcoal'
                    }`}
                  >
                    {isSavingTracking ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : savedTracking ? (
                      <><Check size={12} /> Saved</>
                    ) : (
                      <><Truck size={12} /> Save</>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
