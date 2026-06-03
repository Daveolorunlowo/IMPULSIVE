import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'red';
}

export default function Logo({ className = '', variant = 'light' }: LogoProps) {
  // If variant is 'dark', we want black text
  // If variant is 'light', we want white text
  // If variant is 'red', we want original red text
  const colorValues = variant === 'dark' 
    ? "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0" 
    : variant === 'light'
      ? "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1"
      : "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0";

  // Alpha calculation for red text on white background:
  // We want red -> opaque (A=1), white -> transparent (A=0).
  // Formula: A' = 2*R - 1*G - 1*B
  // For white (1,1,1): 2 - 1 - 1 = 0
  // For red (0.7,0.05,0.05): 1.4 - 0.05 - 0.05 = 1.3 -> 1.0
  return (
    <svg 
      className={className} 
      viewBox="0 0 180 60" 
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={`logo-filter-${variant}`}>
          <feColorMatrix 
            type="matrix" 
            values={`${colorValues}  2 -1 -1 0 0`} 
          />
        </filter>
      </defs>
      <image 
        href="/images/impulsivelogo.jpeg" 
        width="180" 
        height="180" 
        y="-60"
        filter={`url(#logo-filter-${variant})`} 
      />
    </svg>
  );
}
