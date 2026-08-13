import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'WEARIMPULSIVE';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logoPath = join(process.cwd(), 'public/images/lookout-logo.jpeg');
  const logoData = readFileSync(logoPath);
  const logoSrc = `data:image/jpeg;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0F0F0F', 
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '40px',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12px', background: '#D90000' }} />
        
        {/* Centered Logo */}
        <img
          src={logoSrc}
          alt="WEARIMPULSIVE Logo"
          style={{ 
            width: '240px', 
            height: '240px', 
            objectFit: 'contain',
            marginBottom: '40px'
          }}
        />
        
        {/* Centered Typography */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              color: '#FFFFFF',
              fontSize: '72px',
              fontWeight: 900,
              letterSpacing: '0.1em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            WEARIMPULSIVE
          </div>
          
          <div
            style={{
              color: '#A0A0A0',
              fontSize: '32px',
              fontWeight: 400,
              marginTop: '24px',
              lineHeight: 1.4,
              maxWidth: '800px',
              textAlign: 'center'
            }}
          >
            Curated collections for the modern era. Archival design systems.
          </div>

          <div
            style={{
              color: '#D90000',
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              marginTop: '48px',
              textTransform: 'uppercase',
            }}
          >
            wearimpulsive.site
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
