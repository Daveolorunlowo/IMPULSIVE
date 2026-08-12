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
          background: '#040404', 
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: '#D90000' }} />
        
        <img
          src={logoSrc}
          alt="WEARIMPULSIVE Logo"
          style={{ 
            width: '400px', 
            height: '300px', 
            objectFit: 'contain' 
          }}
        />
        
        <div
          style={{
            color: '#FFFFFF',
            fontSize: '36px',
            fontWeight: 800,
            letterSpacing: '0.4em',
            marginTop: '60px',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          WEARIMPULSIVE
        </div>
        
        <div
          style={{
            color: '#888888',
            fontSize: '20px',
            fontWeight: 400,
            letterSpacing: '0.2em',
            marginTop: '15px',
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
