import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ContactDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export const EMPTY_DETAILS: ContactDetails = {
  fullName: '', email: '',
  phone: '', address: '', city: '', state: ''
};

interface CheckoutState {
  details: ContactDetails;
  setDetails: (details: ContactDetails) => void;
  updateDetail: (field: keyof ContactDetails, value: string) => void;
  clearDetails: () => void;
}

export const useCheckout = create<CheckoutState>()(
  persist(
    (set) => ({
      details: EMPTY_DETAILS,
      setDetails: (details) => set({ details }),
      updateDetail: (field, value) => set((state) => ({ details: { ...state.details, [field]: value } })),
      clearDetails: () => set({ details: EMPTY_DETAILS })
    }),
    {
      name: 'impulsive-checkout-details',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
