'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="relative min-h-screen w-full bg-[#080808] text-white flex flex-col items-center justify-center overflow-hidden px-6"
          style={{ fontFamily: 'sans-serif' }}
        >

          {/* Noise grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.04,
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: '150px'
            }}
          />

          {/* Huge background 500 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span style={{
              fontSize: 'clamp(8rem, 40vw, 40vw)',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.02)',
              lineHeight: 1,
              letterSpacing: '-0.05em',
              userSelect: 'none'
            }}>
              500
            </span>
          </div>

          {/* Red glow */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(208,0,0,0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ width: 40, height: 1, background: '#d00000' }} />
              <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.5em', color: '#d00000', fontWeight: 900 }}>Error 500</span>
              <div style={{ width: 40, height: 1, background: '#d00000' }} />
            </div>

            <h1 style={{
              fontSize: 'clamp(3rem, 10vw, 8rem)',
              fontWeight: 900,
              textTransform: 'uppercase',
              lineHeight: 0.85,
              letterSpacing: '-0.04em',
              marginBottom: 24,
              color: 'white'
            }}>
              <span style={{ display: 'block' }}>SERVER</span>
              <span style={{ display: 'block', WebkitTextStroke: '2px #d00000', color: 'transparent' }}>
                DOWN.
              </span>
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              marginBottom: 56,
              maxWidth: 280,
              margin: '0 auto 56px',
              lineHeight: 1.8
            }}>
              Something went wrong on our end. We&apos;re on it — try again in a moment.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <button
                onClick={reset}
                style={{
                  background: '#d00000',
                  color: 'white',
                  padding: '16px 40px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.25em',
                  fontSize: 10,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                Try Again →
              </button>

              <a
                href="/"
                style={{
                  padding: '16px 40px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.25em',
                  fontSize: 10,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                Go Home →
              </a>
            </div>
          </div>

          {/* Bottom tape */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '12px 0',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}>
            <span style={{
              display: 'inline-block',
              fontSize: 9,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.4em',
              color: 'rgba(255,255,255,0.07)',
              animation: 'marquee 16s linear infinite'
            }}>
              {Array(20).fill('IMPULSIVE WORLDWIDE // SERVER ERROR // WE GOT YOU // ').join('')}
            </span>
          </div>

          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>

        </div>
      </body>
    </html>
  );
}
