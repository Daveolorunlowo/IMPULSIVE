import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateShipping(stateName: string): number {
  if (!stateName) return 0;
  
  const stateNormalized = stateName.trim().toLowerCase();
  let feeNGN = 8000; // Default: Other states - 8000 NGN

  if (stateNormalized.includes('oyo')) {
    feeNGN = 2000;
  } else if (stateNormalized.includes('lagos')) {
    feeNGN = 4000;
  } else if (stateNormalized.includes('osun')) {
    feeNGN = 4000;
  } else if (stateNormalized.includes('ogun')) {
    feeNGN = 4000;
  }

  return feeNGN;
}
