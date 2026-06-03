import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'USD' | 'NGN';

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
}

const NGN_RATE = 1500; // Estimated exchange rate for NGN to USD

export const useCurrency = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),
      toggleCurrency: () => set((state) => ({ currency: state.currency === 'USD' ? 'NGN' : 'USD' })),
      formatPrice: (priceInUSD) => {
        const { currency } = get();
        if (currency === 'NGN') {
          return `₦${Math.round(priceInUSD * NGN_RATE).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
        }
        return `$${priceInUSD.toFixed(2)}`;
      },
      convertPrice: (priceInUSD) => {
        const { currency } = get();
        if (currency === 'NGN') {
          return priceInUSD * NGN_RATE;
        }
        return priceInUSD;
      }
    }),
    {
      name: 'impulsive-currency-storage-v3',
    }
  )
);
