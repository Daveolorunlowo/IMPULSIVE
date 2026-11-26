import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateShipping(stateName: string, additionalContext?: string): number {
  if (!stateName && !additionalContext) return 0;
  
  const combined = `${stateName || ''} ${additionalContext || ''}`.trim().toLowerCase();
  let feeNGN = 6000; // Default: Other states - 6000 NGN

  if (combined.includes('bowen')) {
    feeNGN = 3000;
  } else if (combined.includes('oyo')) {
    feeNGN = 0;
  } else if (combined.includes('lagos')) {
    feeNGN = 6000;
  } else if (combined.includes('osun')) {
    feeNGN = 2000;
  } else if (combined.includes('ogun')) {
    feeNGN = 2000;
  }

  return feeNGN;
}
