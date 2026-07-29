import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateShipping(stateName: string): number {
  if (!stateName) return 0;
  
  const stateNormalized = stateName.trim().toLowerCase();
  let feeNGN = 6000; // Default: Other states - 6000 NGN

  if (stateNormalized.includes('oyo')) {
    feeNGN = 0;
  } else if (stateNormalized.includes('lagos')) {
    feeNGN = 2000;
  } else if (stateNormalized.includes('osun')) {
    feeNGN = 2000;
  } else if (stateNormalized.includes('ogun')) {
    feeNGN = 2000;
  }

  return feeNGN;
}
