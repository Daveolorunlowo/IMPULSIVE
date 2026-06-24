import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateShipping(stateName: string, currency: 'USD' | 'NGN'): number {
  if (!stateName) return 0;
  
  const stateNormalized = stateName.trim().toLowerCase();
  let feeNGN = 10000; // Default: Other states - 10000 NGN

  if (stateNormalized.includes('oyo')) {
    feeNGN = 4000;
  } else if (stateNormalized.includes('lagos')) {
    feeNGN = 6000;
  } else if (stateNormalized.includes('osun')) {
    feeNGN = 6000;
  } else if (stateNormalized.includes('ogun')) {
    feeNGN = 6000;
  }

  if (currency === 'USD') {
    return feeNGN / 1500; // NGN_RATE is 1500
  }
  return feeNGN;
}
