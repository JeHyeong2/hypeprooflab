'use client';

import { useMemo } from 'react';
import type { TimelineData, TimelineEvent, Lane, Holiday } from '@/lib/timeline/types';
import EventCard from './EventCard';

interface Props {
  data: TimelineData;
  holidays: Holiday[];
  selectedId?: string | null;
  onSelectEvent: (ev: TimelineEvent) => void;
}

type Bucket = 'apr' | 'may' | 'jun' | 'q2-followup' | 'other';

const BUCKET_LABELS: Record<Bucket, string> = {
  apr: '4월',
  may: '5월',
  jun: '6월',
  'q2-followup': 'Q2 후속',
  other: '기타',
};

const BUCKET_ORDER: Bucket[] = ['apr', 'may', 'jun', 'q2-followup'];

function bucketOf(ev: TimelineEvent): Bucket {
  const d = ev.date;
  if (d.kind === 'date') {
    const m = Number(d.iso.slice(5, 7));
    if (m === 4) return 'apr';
    if (m === 5) return 'may';
    if (m === 6) return 'jun';
    return 'other';
  }
  if (d.kind === 'month') {
    if (d.month === 4) return 'apr';
    if (d.month === 5) return 'may';
    if (d.month === 6) return 'jun';
    return 'other';
  }
  if (d.kind === 'quarter') return 'q2-followup';
  return 'other';
}

export default function TimelineView({ data, holidays, selectedId, onSelectEvent }: Props) {
  const grouped = useMemo(() => {
    const result: Record<Lane, Record<Bucket, TimelineEvent[]>> = {
      direct: { apr: [], may: [], jun: [], 'q2-followup': [], other: [] },
      channel: { apr: [], may: [], jun: [], 'q2-followup': [], other: [] },
      reusable: { apr: [], may: [], jun: [], 'q2-followup': [], other: [] },
    };
    for (const ev of data.events) {
      result[ev.lane][bucketOf(ev)].push(ev);
    }
    return result;
  }, [data.events]);

  const monthHolidayMarkers = useMemo(() => {
    const map: Record<Bucket, { date: string; name: string }[]> = {
      apr: [],
      may: [],
      jun: [],
      'q2-followup': [],
      other: [],
    };
    for (const h of holidays) {
      const m = Number(h.date.slice(5, 7));
      if (m === 4) map.apr.push(h);
      else if (m === 5) map.may.push(h);
      else if (m === 6) map.jun.push(h);
    }
    return map;
  }, [holidays]);

  return (
    <div className="overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
      <div className="min-w-[640px]">
        {/* Time axis */}
        <div className="grid grid-cols-[100px_repeat(4,1fr)] sm:grid-cols-[140px_repeat(4,1fr)] gap-2 mb-2 items-end">
          <div />
          {BUCKET_ORDER.map(b => (
            <div key={b} className="text-center">
              <div className="text-[0.7rem] sm:text-[0.78rem] font-semibold text-[#e6edf3]">
                {BUCKET_LABELS[b]}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1 min-h-[14px]">
                {monthHolidayMarkers[b].slice(0, 4).map(h => (
                  <span
                    key={h.date}
                    title={`${h.date} ${h.name}`}
                    className="w-1.5 h-1.5 rounded-full bg-[#e74c3c]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Lane rows */}
        {(['direct', 'channel'] as Lane[]).map(lane => (
          <div key={lane} className="mb-3">
            <div className="grid grid-cols-[100px_repeat(4,1fr)] sm:grid-cols-[140px_repeat(4,1fr)] gap-2 items-stretch">
              <div
                className="text-[0.66rem] sm:text-[0.74rem] font-semibold flex items-center px-2 rounded-md"
                style={{ background: data.lanes[lane].color + '22', color: data.lanes[lane].color }}
              >
                {data.lanes[lane].label}
              </div>
              {BUCKET_ORDER.map(b => (
                <div
                  key={b}
                  className="rounded-lg border border-dashed border-[#21262d] p-1.5 min-h-[100px] sm:min-h-[110px] space-y-1.5"
                >
                  {grouped[lane][b].length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[0.62rem] text-[#21262d]">
                      ·
                    </div>
                  ) : (
                    grouped[lane][b].map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => onSelectEvent(ev)}
                        className={`text-left w-full transition-all ${
                          selectedId === ev.id ? 'ring-1 ring-[#58a6ff] rounded-lg' : ''
                        }`}
                      >
                        <EventCard event={ev} lanes={data.lanes} compact />
                      </button>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
