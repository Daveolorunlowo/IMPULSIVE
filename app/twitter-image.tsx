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
          flexDirection: 'row',
          alignItems: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Left Side: Logo Area */}
        <div 
          style={{ 
            display: 'flex', 
            width: '50%', 
            height: '100%', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#000000',
            borderRight: '1px solid #222222'
          }}
        >
          <img
            src={logoSrc}
            alt="WEARIMPULSIVE Logo"
            style={{ 
              width: '450px', 
              height: '450px', 
              objectFit: 'contain' 
            }}
          />
        </div>
        
        {/* Right Side: Typography */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '50%', 
            height: '100%',
            padding: '80px',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              color: '#FFFFFF',
              fontSize: '56px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textTransform: 'uppercase',
            }}
          >
            WEARIMPULSIVE
          </div>
          
          <div
            style={{
              color: '#A0A0A0',
              fontSize: '28px',
              fontWeight: 400,
              marginTop: '24px',
              lineHeight: 1.4,
            }}
          >
            Curated collections for the modern era. Archival design systems.
          </div>

          <div
            style={{
              color: '#D90000',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              marginTop: '60px',
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
