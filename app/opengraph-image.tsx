import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';

export const runtime = 'edge';
export const alt = `${siteConfig.name} — Free Online Calculators`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 'bold', color: '#ffffff', marginBottom: 20 }}>
          {siteConfig.name}
        </div>
        <div style={{ fontSize: 32, color: '#94a3b8', textAlign: 'center' }}>
          Free Online Calculators — Finance, Health, Math & More
        </div>
      </div>
    ),
    { ...size }
  );
}
