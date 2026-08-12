import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'red';
}

export default function Logo({ className = '', variant = 'light' }: LogoProps) {
  const filterStyle = variant === 'dark'
    ? 'invert(1) hue-rotate(180deg) saturate(5)'
    : 'none';

  return (
    <div
      className={className}
      style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/lookout-logo.jpeg"
        alt="Impulsive Logo"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          filter: filterStyle,
          borderRadius: '4px', // slight rounding since it's a jpeg
        }}
      />
    </div>
  );
}
