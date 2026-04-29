import type { PriorityBanner as Banner } from '@/lib/timeline/types';

const TONES: Record<Banner['severity'], { bar: string; bg: string; text: string }> = {
  info: { bar: '#58a6ff', bg: 'rgba(31,111,235,0.10)', text: '#58a6ff' },
  warning: { bar: '#fbbf24', bg: 'rgba(251,191,36,0.10)', text: '#fbbf24' },
  pivot: { bar: '#e8734a', bg: 'rgba(232,115,74,0.12)', text: '#e8734a' },
};

export default function PriorityBanner({ banner }: { banner?: Banner }) {
  if (!banner) return null;
  const t = TONES[banner.severity];
  return (
    <div
      className="rounded-lg px-4 py-3 mb-3 flex items-start gap-3"
      style={{ background: t.bg, borderLeft: `3px solid ${t.bar}` }}
    >
      <div className="text-[0.78rem] font-semibold whitespace-nowrap" style={{ color: t.text }}>
        {banner.headline}
      </div>
      {banner.body && (
        <div className="text-[0.78rem] text-[#e6edf3] leading-relaxed">{banner.body}</div>
      )}
    </div>
  );
}
