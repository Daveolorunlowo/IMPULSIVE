import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'WEARIMPULSIVE';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Read the logo from the public directory
  const logoPath = join(process.cwd(), 'public/images/wi-logo.png');
  const logoData = readFileSync(logoPath);
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#040404', // Very dark luxury charcoal/black
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Subtle top border for a premium feel */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: '#D90000' }} />
        
        <img
          src={logoSrc}
          alt="WEARIMPULSIVE Logo"
          style={{ 
            width: '280px', 
            height: '280px', 
            objectFit: 'contain' 
          }}
        />
        
        <div
          style={{
            color: '#FFFFFF',
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '0.5em',
            marginTop: '80px',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          WEARIMPULSIVE
        </div>
        
        <div
          style={{
            color: '#666666',
            fontSize: '18px',
            fontWeight: 400,
            letterSpacing: '0.3em',
            marginTop: '20px',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          Archive Collection
        </div>
      </div>
    ),
    { ...size }
  );
}
