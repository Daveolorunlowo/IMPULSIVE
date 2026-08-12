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
          background: '#000000', // Pure black to match the logo background
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={logoSrc}
          alt="WEARIMPULSIVE Logo"
          style={{ 
            width: '600px', 
            height: '600px', 
            objectFit: 'contain' 
          }}
        />
      </div>
    ),
    { ...size }
  );
}
