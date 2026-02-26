import { ImageResponse } from 'next/og';
import { getColumn } from '@/lib/columns';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const column = getColumn(slug, 'ko') || getColumn(slug, 'en');

  const title = column?.frontmatter.title || slug;
  const author = column?.frontmatter.creator || '';
  const date = column?.frontmatter.date || '';
  const category = column?.frontmatter.category || '';

  // Load Noto Sans KR for Korean support
  const fontData = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap'
  ).then(res => res.text())
    .then(css => {
      const match = css.match(/src: url\(([^)]+)\)/);
      return match ? fetch(match[1]).then(r => r.arrayBuffer()) : null;
    });

  const logoUrl = 'https://hypeproof-ai.xyz/logos/logo-h-dark-lg.png';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="HypeProof AI"
            height={48}
          />
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingTop: '40px',
            paddingBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: title.length > 40 ? 42 : 52,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.3,
              display: '-webkit-box',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer: Author + Date + Category */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: 22, color: '#a0a0b8' }}>{author}</span>
            {date && (
              <span style={{ fontSize: 20, color: '#6b6b80' }}>
                {date}
              </span>
            )}
          </div>
          {category && (
            <span
              style={{
                fontSize: 18,
                color: '#7c3aed',
                background: 'rgba(124, 58, 237, 0.15)',
                padding: '6px 16px',
                borderRadius: '20px',
              }}
            >
              {category}
            </span>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData ? {
        fonts: [
          {
            name: 'Noto Sans KR',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ],
      } : {}),
    }
  );
}
