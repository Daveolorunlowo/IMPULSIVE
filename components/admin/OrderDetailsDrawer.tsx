import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useCurrency } from '@/store/useCurrency';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
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
    shipping_address?: any;
    name?: string;
  };
  order_items: OrderItem[];
}

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  onSaveTracking: (orderId: string, trackingCode: string) => Promise<void>;
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

  // Sync tracking code when order changes
  React.useEffect(() => {
    if (order) {
      setTrackingCode(order.metadata?.tracking_number || '');
    }
  }, [order]);

  if (!order) return null;

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    await onUpdateStatus(order.id, newStatus);
    setIsUpdatingStatus(false);
  };

  const handleTrackingSubmit = async () => {
    setIsSavingTracking(true);
    await onSaveTracking(order.id, trackingCode);
    setIsSavingTracking(false);
  };

  const statuses = [
    { label: 'PROCESSING', value: 'paid' }, // mapping to 'paid' or 'pending'
    { label: 'SHIPPED', value: 'shipped' },
    { label: 'OUT FOR DELIVERY', value: 'out_for_delivery' },
    { label: 'DELIVERED', value: 'delivered' }
  ];

  // Helper to map current backend status to UI active state
  const isActiveStatus = (statusValue: string) => {
    if (statusValue === 'paid' && (order.status === 'paid' || order.status === 'pending')) return true;
    return order.status === statusValue;
  };

  // Format the address. This might need tweaking based on actual data structure.
  const address = order.metadata?.shipping_address;
  const formattedAddress = address 
    ? (typeof address === 'string' ? address : `${address.city || ''}, ${address.state || ''}, ${address.country || ''}`.replace(/^[,\s]+|[,\s]+$/g, ''))
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
            <div className="flex justify-end p-4 border-b border-white/10">
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
                  <h4 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-2">Date</h4>
                  <p className="text-sm font-mono text-alabaster">
                    {new Date(order.created_at).toLocaleDateString('en-GB')}
                    <br/>
                    {new Date(order.created_at).toLocaleTimeString('en-GB')}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-2">Client</h4>
                  <p className="text-sm text-alabaster font-serif">
                    {order.metadata?.name || 'Customer'}
                  </p>
                  <p className="text-xs font-mono text-stone mt-1 break-all">
                    {order.metadata?.email || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Value */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-2">Value</h4>
                <p className="text-xl font-serif text-bloodred">
                  {formatPrice(order.total_price)}
                </p>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-2">Delivery Address</h4>
                <p className="text-sm text-alabaster uppercase tracking-wider">
                  {formattedAddress}
                </p>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-4">Line Items</h4>
                <div className="space-y-4">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-charcoal rounded overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone bg-white/5 text-[10px] uppercase">Img</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-alabaster mb-1">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-stone uppercase tracking-widest">
                          {item.size ? `SIZE ${item.size}` : ''} 
                          {item.color ? ` - ${item.color}` : ''} 
                          {` - QTY ${item.quantity}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipment Status */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-4">Shipment Status:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      disabled={isUpdatingStatus}
                      className={`py-3 px-2 text-[10px] uppercase tracking-widest font-bold transition-all border ${
                        isActiveStatus(status.value) 
                          ? 'bg-bloodred text-white border-bloodred' 
                          : 'bg-[#111] text-stone border-transparent hover:border-white/10'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracking Code */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="ENTER TRACKING CODE (E.G. TRK-830219)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 text-alabaster px-4 py-4 outline-none focus:border-bloodred transition-colors text-[10px] uppercase tracking-[0.1em] placeholder:text-stone/40"
                />
                <button
                  onClick={handleTrackingSubmit}
                  disabled={isSavingTracking || !trackingCode || trackingCode === order.metadata?.tracking_number}
                  className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-transparent text-alabaster py-4 text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSavingTracking ? <Loader2 size={14} className="animate-spin" /> : 'Save Tracking Code'}
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
