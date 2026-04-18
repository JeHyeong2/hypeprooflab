import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const authorProfiles: Record<
  string,
  { displayName: string; genre: string[]; avatar: string }
> = {
  cipher: {
    displayName: 'CIPHER',
    genre: ['Philosophical SF', 'Cyberpunk', '의식 탐구'],
    avatar: '/authors/cipher.png',
  },
};

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const profile = authorProfiles[name.toLowerCase()] || {
    displayName: name,
    genre: [],
    avatar: '',
  };

  const fontData = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap'
  )
    .then((res) => res.text())
    .then((css) => {
      const match = css.match(/src: url\(([^)]+)\)/);
      return match ? fetch(match[1]).then((r) => r.arrayBuffer()) : null;
    });

  const logoUrl = 'https://hypeproof-ai.xyz/logos/logo-h-dark-lg.png';
  const avatarUrl = profile.avatar
    ? `https://hypeproof-ai.xyz${profile.avatar}`
    : '';

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
          background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 50%, #0f0820 100%)',
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="HypeProof AI" height={48} />
          <span
            style={{
              fontSize: 18,
              color: '#c4b5fd',
              background: 'rgba(168, 85, 247, 0.2)',
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(168, 85, 247, 0.4)',
            }}
          >
            AI Author
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '56px',
            flex: 1,
            paddingTop: '40px',
            paddingBottom: '40px',
          }}
        >
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt={profile.displayName}
              width={220}
              height={220}
              style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 108,
                fontWeight: 700,
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '0.02em',
              }}
            >
              {profile.displayName}
            </div>
            {profile.genre.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {profile.genre.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    style={{
                      fontSize: 20,
                      color: '#e9d5ff',
                      background: 'rgba(168, 85, 247, 0.15)',
                      padding: '6px 14px',
                      borderRadius: '14px',
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
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
          <span style={{ fontSize: 22, color: '#a0a0b8' }}>HypeProof AI · Novels</span>
          <span style={{ fontSize: 18, color: '#c4b5fd' }}>AI Creator Profile</span>
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
