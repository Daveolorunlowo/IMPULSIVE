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
    // Content occupies y:39%–60% of the 500×500 square.
    // marginTop: -38% offsets the top padding so the wordmark
    // sits at the top of the crop window (% is relative to parent width).
    // Container height must be ≥ 22% of its width to show all content.
    <div
      className={className}
      style={{ overflow: 'hidden', position: 'relative', flexShrink: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/impulsive-logo-new-removebg-preview.png"
        alt="Impulsive Logo"
        style={{
          width: '100%',
          height: 'auto',
          marginTop: '-36%',
          display: 'block',
          filter: filterStyle,
        }}
      />
    </div>
  );
}
