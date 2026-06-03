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
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  totalPrice: () => number;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  getDiscountAmount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: null,
      discountRate: 0,
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
            return { items: newItems, isOpen: true };
          }

          return { 
            items: [...state.items, { ...product, quantity: 1 }], 
            isOpen: true 
          };
        }),
      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((item) => 
            `${item.id}-${item.selectedSize}-${item.selectedColor.name}-${item.customText || ''}` !== cartItemId
          ),
        })),
      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            `${item.id}-${item.selectedSize}-${item.selectedColor.name}-${item.customText || ''}` === cartItemId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        })),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearCart: () => set({ items: [], promoCode: null, discountRate: 0 }),
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      applyPromoCode: (code) => {
        const uppercaseCode = code.toUpperCase().trim();
        if (uppercaseCode === 'INSTINCT' || uppercaseCode === 'ARCHIVE10') {
          set({ promoCode: uppercaseCode, discountRate: 0.10 });
          return true;
        }
        return false;
      },
      removePromoCode: () => {
        set({ promoCode: null, discountRate: 0 });
      },
      getDiscountAmount: () => {
        return get().totalPrice() * get().discountRate;
      }
    }),
    {
      name: 'impulsive-cart-v3', // Bump version for schema change
      storage: createJSONStorage(() => localStorage),
    }
  )
);
