import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/products';

interface ProductsStore {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  updateProduct: (updatedProduct: Product) => void;
}

export const useProducts = create<ProductsStore>()(
  persist(
    (set) => ({
      products: [],
      isLoading: false,
      fetchProducts: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.products) {
              set({ products: data.products });
            }
          }
        } catch (error) {
          console.error('[useProducts] Failed to fetch products:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      updateProduct: (updatedProduct) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ),
        }));
      },
    }),
    {
      name: 'impulsive-products-cache',
      version: 2,
    }
  )
);
