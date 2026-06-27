import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'NGN';

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
}

const NGN_RATE = 1500; // Multiplier used since DB prices are small numbers

export const useCurrency = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'NGN',
      setCurrency: (currency) => set({ currency: 'NGN' }),
      toggleCurrency: () => {}, // Currency is locked to Naira
      formatPrice: (priceInUSD) => {
        return `₦${Math.round(priceInUSD * NGN_RATE).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
      },
      convertPrice: (priceInUSD) => {
        return priceInUSD * NGN_RATE;
      }
    }),
    {
      name: 'impulsive-currency-storage-v4',
    }
  )
);
