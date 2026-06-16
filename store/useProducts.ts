import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, products as initialProducts } from '@/lib/products';

interface ProductsStore {
  products: Product[];
  updateProduct: (updatedProduct: Product) => void;
  resetProducts: () => void;
}

export const useProducts = create<ProductsStore>()(
  persist(
    (set) => ({
      products: initialProducts,
      updateProduct: (updatedProduct) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ),
        }));
      },
      resetProducts: () => set({ products: initialProducts }),
    }),
    {
      name: 'impulsive-products-storage',
    }
  )
);
