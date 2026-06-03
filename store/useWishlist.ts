import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[]; // List of product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (productId) => {
        const { items } = get();
        if (items.includes(productId)) {
          set({ items: items.filter(id => id !== productId) });
        } else {
          set({ items: [...items, productId] });
        }
      },
      isInWishlist: (productId) => {
        return get().items.includes(productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'impulsive-wishlist-storage',
    }
  )
);
