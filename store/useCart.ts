import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product) =>
        set((state) => {
          // Generate a unique ID for the cart item based on product ID, size, and color
          const cartItemId = `${product.id}-${product.selectedSize}-${product.selectedColor.name}`;
          
          const existingItemIndex = state.items.findIndex((item) => 
            `${item.id}-${item.selectedSize}-${item.selectedColor.name}` === cartItemId
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
            `${item.id}-${item.selectedSize}-${item.selectedColor.name}` !== cartItemId
          ),
        })),
      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            `${item.id}-${item.selectedSize}-${item.selectedColor.name}` === cartItemId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        })),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearCart: () => set({ items: [] }),
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'impulsive-cart-v2', // Bump version for schema change
      storage: createJSONStorage(() => localStorage),
    }
  )
);
