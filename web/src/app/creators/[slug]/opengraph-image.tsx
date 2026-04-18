import { ImageResponse } from 'next/og';
import { getAllMembers, FALLBACK_MEMBERS } from '@/lib/members';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const members = getAllMembers();
  const list = members.length > 0
    ? members.filter((m) => m.role === 'admin' || m.role === 'creator')
    : FALLBACK_MEMBERS.filter((m) => m.role === 'admin' || m.role === 'creator');
  const creator = list.find((m) => slugify(m.displayName) === slug);
  const displayName = creator?.displayName || slug;
  const role = creator?.role === 'admin' ? 'Admin / Creator' : 'Creator';

  const fontData = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap'
  )
    .then((res) => res.text())
    .then((css) => {
      const match = css.match(/src: url\(([^)]+)\)/);
      return match ? fetch(match[1]).then((r) => r.arrayBuffer()) : null;
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="HypeProof AI" height={48} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '48px',
            flex: 1,
            paddingTop: '40px',
            paddingBottom: '40px',
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 96,
              fontWeight: 700,
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </div>
            <div style={{ fontSize: 28, color: '#a0a0b8' }}>{role}</div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: '24px',
          }}
        >
          <span style={{ fontSize: 22, color: '#a0a0b8' }}>HypeProof AI Community</span>
          <span
            style={{
              fontSize: 18,
              color: '#7c3aed',
              background: 'rgba(124, 58, 237, 0.15)',
              padding: '6px 16px',
              borderRadius: '20px',
            }}
          >
            Creator Profile
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: 'Noto Sans KR',
                data: fontData,
                style: 'normal',
                weight: 700,
              },
            ],
          }
        : {}),
    }
  );
}
