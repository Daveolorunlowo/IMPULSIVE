import { create } from 'zustand';

type Currency = 'USD' | 'NGN';

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (priceInUSD: number) => string;
}

const NGN_RATE = 1500; // Estimated exchange rate for NGN to USD

export const useCurrency = create<CurrencyState>((set, get) => ({
  currency: 'USD',
  setCurrency: (currency) => set({ currency }),
  toggleCurrency: () => set((state) => ({ currency: state.currency === 'USD' ? 'NGN' : 'USD' })),
  formatPrice: (priceInUSD) => {
    const { currency } = get();
    if (currency === 'NGN') {
      return `₦${(priceInUSD * NGN_RATE).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
    }
    return `$${priceInUSD.toFixed(2)}`;
  }
}));
