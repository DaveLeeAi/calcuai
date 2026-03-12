import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';

export const runtime = 'edge';
// Alt text is set dynamically in the Image function via generateImageMetadata
// This static fallback is used when the dynamic alt can't be resolved
export const alt = 'Free Online Calculator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CATEGORY_COLORS: Record<string, string> = {
  finance: '#22c55e',
  health: '#ef4444',
  math: '#3b82f6',
  construction: '#f59e0b',
  science: '#8b5cf6',
  everyday: '#06b6d4',
  business: '#f97316',
  conversion: '#14b8a6',
};

function titleFromSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function categoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default async function Image({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const title = titleFromSlug(slug);
  const accent = CATEGORY_COLORS[category] || '#3b82f6';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Category badge */}
        <div
          style={{
            fontSize: 20,
            color: accent,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          {categoryLabel(category)}
        </div>
        {/* Calculator title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: 30,
          }}
        >
          {title}
        </div>
        {/* Brand */}
        <div style={{ fontSize: 24, color: '#64748b' }}>
          {siteConfig.name} — Free Online Calculator
        </div>
        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: accent,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
