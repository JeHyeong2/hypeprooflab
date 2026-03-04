import { ImageResponse } from 'next/og';
import { getResearch } from '@/lib/research';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const research = getResearch(slug, 'ko') || getResearch(slug, 'en');

  const title = research?.frontmatter.title || slug;
  const author = research?.frontmatter.creator || '';
  const date = research?.frontmatter.date || '';
  const category = research?.frontmatter.category || '';

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
          background: 'linear-gradient(135deg, #0c1929 0%, #0f2744 50%, #0d1f3c 100%)',
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        {/* Logo + AI badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="HypeProof AI"
            height={48}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: 16,
              color: '#22d3ee',
              background: 'rgba(34, 211, 238, 0.1)',
              padding: '8px 16px',
              borderRadius: '24px',
              border: '1px solid rgba(34, 211, 238, 0.2)',
            }}
          >
            🤖 AI Generated Research
          </div>
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

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(34, 211, 238, 0.2)',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: 22, color: '#a0a0b8' }}>{author}</span>
            {date && (
              <span style={{ fontSize: 20, color: '#6b6b80' }}>{date}</span>
            )}
          </div>
          {category && (
            <span
              style={{
                fontSize: 18,
                color: '#06b6d4',
                background: 'rgba(6, 182, 212, 0.15)',
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
            style: 'normal' as const,
            weight: 700 as const,
          },
        ],
      } : {}),
    }
  );
}
