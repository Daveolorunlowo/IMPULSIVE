import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export default function Logo({ className = '', variant = 'dark' }: LogoProps) {
  // If variant is 'dark', we want black text (for light backgrounds like Navbar)
  // If variant is 'light', we want white text (for dark backgrounds like Footer)
  
  // For black text: R, G, B are 0.
  // For white text: R, G, B are 1.
  const colorValues = variant === 'dark' 
    ? "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0" 
    : "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1";

  // Alpha calculation:
  // Original image is black text (0,0,0) on white bg (1,1,1).
  // We want black -> opaque (A=1), white -> transparent (A=0), and transparent -> transparent (A=0).
  // Formula: A' = -0.333*R - 0.333*G - 0.333*B + 1*A
  // If white (1,1,1,1): -0.333 - 0.333 - 0.333 + 1 = 0
  // If black (0,0,0,1): 0 + 0 + 0 + 1 = 1
  // If transparent (0,0,0,0): 0 + 0 + 0 + 0 = 0

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
            values={`${colorValues}  -0.333 -0.333 -0.333 1 0`} 
          />
        </filter>
      </defs>
      <image 
        href="/images/impulsivelogo.jpeg" 
        width="180" 
        height="60" 
        filter={`url(#logo-filter-${variant})`} 
      />
    </svg>
  );
}
