import { ImageResponse } from 'next/og';
import { getNovel } from '@/lib/novels';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const novel = getNovel(slug, 'en') || getNovel(slug, 'ko');

  const title = novel?.frontmatter.title || slug;
  const author = novel?.frontmatter.author || '';
  const authorHuman = novel?.frontmatter.authorHuman || '';
  const series = novel?.frontmatter.series || '';
  const volume = novel?.frontmatter.volume || 1;
  const chapter = novel?.frontmatter.chapter || 1;
  const aiModel = novel?.frontmatter.aiModel || '';

  // Load Noto Sans KR for Korean support
  const fontData = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap'
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
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 70%, #0f1020 100%)',
          fontFamily: '"Noto Sans KR", sans-serif',
          position: 'relative',
        }}
      >
        {/* Circuit pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a855f7' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* AI Generated Badge & Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(168, 85, 247, 0.2)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '20px',
              padding: '8px 16px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#a855f7',
              }}
            />
            <span style={{ fontSize: 16, color: '#c084fc', fontWeight: 500 }}>
              AI GENERATED
            </span>
          </div>
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="HypeProof AI"
            height={32}
            style={{ opacity: 0.8 }}
          />
        </div>

        {/* Series & Chapter Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '20px',
          }}
        >
          <div style={{ fontSize: 24, color: '#a855f7', fontWeight: 600 }}>
            {series}
          </div>
          <div style={{ fontSize: 18, color: '#94a3b8' }}>
            Volume {volume} • Chapter {chapter}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingTop: '30px',
            paddingBottom: '30px',
          }}
        >
          <div
            style={{
              fontSize: title.length > 30 ? 48 : title.length > 20 ? 56 : 64,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
              display: '-webkit-box',
              overflow: 'hidden',
              textShadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer: AI Author + Human Creator + Model */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(168, 85, 247, 0.3)',
            paddingTop: '24px',
            background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.1) 0%, transparent 100%)',
            margin: '0 -20px -20px -20px',
            padding: '24px 20px 20px 20px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: 24, color: '#ffffff', fontWeight: 600 }}>
                {author}
              </span>
              <span style={{ fontSize: 18, color: '#64748b' }}>
                by {authorHuman}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}