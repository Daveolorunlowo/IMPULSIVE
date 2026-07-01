import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
  customText?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string | null;
  discountRate: number;
  lastUpdated: number;
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  totalPrice: () => number;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  getDiscountAmount: () => number;
  syncWithCloud: () => Promise<void>;
  pushToCloud: () => Promise<void>;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: null,
      discountRate: 0,
      lastUpdated: 0,
      addItem: (product) =>
        set((state) => {
          // Generate a unique ID for the cart item based on product ID, size, color, and customText
          const cartItemId = `${product.id}-${product.selectedSize}-${product.selectedColor.name}-${product.customText || ''}`;
          
          const existingItemIndex = state.items.findIndex((item) => 
            `${item.id}-${item.selectedSize}-${item.selectedColor.name}-${item.customText || ''}` === cartItemId
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += 1;
            setTimeout(() => get().pushToCloud(), 0);
            return { items: newItems, isOpen: true };
          }

          setTimeout(() => get().pushToCloud(), 0);
          return { 
            items: [...state.items, { ...product, quantity: 1 }], 
            isOpen: true,
            lastUpdated: Date.now()
          };
        }),
      removeItem: (cartItemId) =>
        set((state) => {
          setTimeout(() => get().pushToCloud(), 0);
          return {
            items: state.items.filter((item) => 
              `${item.id}-${item.selectedSize}-${item.selectedColor.name}-${item.customText || ''}` !== cartItemId
            ),
            lastUpdated: Date.now()
          };
        }),
      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          setTimeout(() => get().pushToCloud(), 0);
          return {
            items: state.items.map((item) =>
              `${item.id}-${item.selectedSize}-${item.selectedColor.name}-${item.customText || ''}` === cartItemId
                ? { ...item, quantity: Math.max(1, quantity) }
                : item
            ),
            lastUpdated: Date.now()
          };
        }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearCart: () => {
        set({ items: [], promoCode: null, discountRate: 0, lastUpdated: Date.now() });
        setTimeout(() => get().pushToCloud(), 0);
      },
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      applyPromoCode: async (code) => {
        const uppercaseCode = code.toUpperCase().trim();
        try {
          const res = await fetch('/api/cart/validate-promo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: uppercaseCode })
          });
          
          if (!res.ok) {
            set({ promoCode: null, discountRate: 0 });
            return false;
          }

          const data = await res.json();
          if (data.success) {
            // DB returns percentage like 10 for 10%. We convert to 0.10
            const rate = data.discount_percentage / 100;
            set({ promoCode: uppercaseCode, discountRate: rate });
            return true;
          }
          return false;
        } catch (error) {
          console.error('[useCart] Failed to apply promo code:', error);
          return false;
        }
      },
      removePromoCode: () => {
        set({ promoCode: null, discountRate: 0 });
      },
      getDiscountAmount: () => {
        return get().totalPrice() * get().discountRate;
      },
      syncWithCloud: async () => {
        try {
          const supabase = (await import('@/lib/supabase')).getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) return;

          const res = await fetch('/api/cart/sync', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.items) {
              const localItems = get().items;
              const localUpdateAge = Date.now() - get().lastUpdated;
              
              // If local state was updated in the last 10 seconds, it's likely more accurate than what we just fetched (due to race conditions like clearCart)
              if (localUpdateAge < 10000) {
                await get().pushToCloud();
                return;
              }

              if (data.items.length > 0) {
                set({ items: data.items });
              } else if (localItems.length > 0) {
                await get().pushToCloud();
              }
            }
          }
        } catch (err) {
          console.error('[useCart] syncWithCloud error:', err);
        }
      },
      pushToCloud: async () => {
        try {
          const supabase = (await import('@/lib/supabase')).getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) return;

          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ items: get().items })
          });
        } catch (err) {
          console.error('[useCart] pushToCloud error:', err);
        }
      }
    }),
    {
      name: 'impulsive-cart-v3', // Bump version for schema change
      storage: createJSONStorage(() => localStorage),
    }
  )
);
