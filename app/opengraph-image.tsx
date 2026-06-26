import { ImageResponse } from 'next/og';
 
// Route segment config
 
// Image metadata
export const alt = 'WEARIMPULSIVE | Modern Luxury Fashion';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0E0E0E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#F9F9F7',
          border: '20px solid #070707',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #800000',
            padding: '80px 120px',
            background: '#070707',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: '0.5em',
              color: '#800000',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 40,
            }}
          >
            Studio
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              letterSpacing: '-0.05em',
              color: '#F9F9F7',
              marginBottom: 20,
              fontFamily: 'serif',
            }}
          >
            WEARIMPULSIVE
          </div>
          <div
            style={{
              fontSize: 20,
              letterSpacing: '0.2em',
              color: '#8E8E8E',
              textTransform: 'uppercase',
            }}
          >
            Modern Luxury Fashion
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 14,
            letterSpacing: '0.4em',
            color: '#444444',
            textTransform: 'uppercase',
          }}
        >
          Archival Design Systems
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
