import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'NGN';

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (price: number) => string;
  convertPrice: (price: number) => number;
}

// Currency store for NGN

export const useCurrency = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'NGN',
      setCurrency: (currency) => set({ currency: 'NGN' }),
      toggleCurrency: () => {}, // Currency is locked to Naira
      formatPrice: (price) => {
        return `₦${Math.round(price).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
      },
      convertPrice: (price) => {
        return price;
      }
    }),
    {
      name: 'impulsive-currency-storage-v4',
    }
  )
);
