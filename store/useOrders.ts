import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
  customText?: string;
}

export interface Order {
  id: string;
  email: string;
  fullName: string;
  address: string;
  city: string;
  country: string;
  items: OrderItem[];
  totalPrice: number;
  currency?: 'USD' | 'NGN';
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
  unreadNotification: boolean;
}

interface OrdersStore {
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'status' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'unreadNotification'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingNumber: string) => void;
  markOrderAsRead: (orderId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByEmail: (email: string) => Order[];
  clearAllOrders: () => void;
}

export const useOrders = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      createOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          status: 'Processing',
          trackingNumber: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unreadNotification: false,
        };
        set({ orders: [newOrder, ...get().orders] });
      },
      updateOrderStatus: (orderId, status, trackingNumber) => {
        const updatedOrders = get().orders.map((order) => {
          if (order.id === orderId) {
            // Set unreadNotification to true so client gets notified immediately in navigation or alerts
            return {
              ...order,
              status,
              trackingNumber,
              unreadNotification: true,
              updatedAt: new Date().toISOString(),
            };
          }
          return order;
        });
        set({ orders: updatedOrders });
      },
      markOrderAsRead: (orderId) => {
        const updatedOrders = get().orders.map((order) => {
          if (order.id === orderId) {
            return { ...order, unreadNotification: false };
          }
          return order;
        });
        set({ orders: updatedOrders });
      },
      getOrderById: (orderId) => {
        return get().orders.find((order) => order.id === orderId);
      },
      getOrdersByEmail: (email) => {
        return get().orders.filter((order) => order.email.toLowerCase() === email.toLowerCase());
      },
      clearAllOrders: () => set({ orders: [] }),
    }),
    {
      name: 'impulsive-orders-storage',
    }
  )
);
