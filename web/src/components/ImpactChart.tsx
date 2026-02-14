'use client';

import { type ImpactScore } from '@/lib/impact';

interface ImpactChartProps {
  score: ImpactScore;
  slug?: string;
}

const CATEGORIES = [
  { key: 'aiReferral' as const, label: 'AI Referral', max: 40, color: '#6366f1' },
  { key: 'citationTest' as const, label: 'Citation Test', max: 30, color: '#8b5cf6' },
  { key: 'traffic' as const, label: 'Traffic', max: 20, color: '#a78bfa' },
  { key: 'novelBonus' as const, label: 'Novel Bonus', max: 10, color: '#c4b5fd' },
] as const;

function getTotalColor(total: number): string {
  if (total >= 70) return '#22c55e';
  if (total >= 40) return '#eab308';
  return '#ef4444';
}

export default function ImpactChart({ score, slug }: ImpactChartProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 480 }}>
      {/* Total */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {slug && (
          <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>
            {slug}
          </div>
        )}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: getTotalColor(score.total),
            lineHeight: 1,
          }}
        >
          {score.total}
        </div>
        <div style={{ fontSize: 14, color: '#888' }}>/ 100</div>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CATEGORIES.map(({ key, label, max, color }) => {
          const value = score[key];
          const pct = max > 0 ? (value / max) * 100 : 0;
          return (
            <div key={key}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span>{label}</span>
                <span style={{ fontWeight: 600 }}>
                  {value} / {max}
                </span>
              </div>
              <div
                style={{
                  height: 20,
                  backgroundColor: '#f1f5f9',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: color,
                    borderRadius: 4,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
