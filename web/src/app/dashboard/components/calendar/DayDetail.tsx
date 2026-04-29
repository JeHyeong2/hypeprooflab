'use client';

import type { TimelineEvent, TimelineLanesMeta, Holiday } from '@/lib/timeline/types';
import EventCard from './EventCard';

interface Props {
  dayIso: string;
  events: TimelineEvent[];
  holiday?: Holiday | null;
  weekend?: 'sat' | 'sun' | null;
  lanes: TimelineLanesMeta;
  onSelectEvent: (ev: TimelineEvent) => void;
  onClose?: () => void;
}

const KO_DAY = ['일', '월', '화', '수', '목', '금', '토'];

export default function DayDetail({
  dayIso,
  events,
  holiday,
  weekend,
  lanes,
  onSelectEvent,
  onClose,
}: Props) {
  const [y, m, d] = dayIso.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const dayLabel = KO_DAY[dow];
  const dayColor =
    holiday || weekend === 'sun' ? '#e74c3c' : weekend === 'sat' ? '#58a6ff' : '#e6edf3';

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
      <div className="h-1 bg-[#30363d]" />
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span
                className="text-[1.6rem] font-bold leading-none"
                style={{ color: dayColor }}
              >
                {d}
              </span>
              <div className="text-[0.74rem] text-[#8b949e]">
                {y}년 {m}월 · <span style={{ color: dayColor }}>{dayLabel}요일</span>
              </div>
            </div>
            {holiday && (
              <div className="mt-1 inline-block text-[0.66rem] px-1.5 py-0.5 rounded bg-[rgba(231,76,60,0.18)] text-[#e74c3c]">
                {holiday.name}
              </div>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="닫기"
              className="text-[#6e7681] hover:text-[#e6edf3] text-[1rem] leading-none px-1"
            >
              ×
            </button>
          )}
        </div>

        {/* Events */}
        <div>
          <div className="text-[0.62rem] uppercase tracking-wide text-[#6e7681] font-semibold mb-1.5">
            이벤트 {events.length}건
          </div>
          {events.length === 0 ? (
            <div className="text-[0.74rem] text-[#8b949e] text-center py-4 border border-dashed border-[#21262d] rounded-lg">
              이날 등록된 일정이 없어요.
            </div>
          ) : (
            <div className="space-y-1.5">
              {events.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="w-full text-left transition-all hover:brightness-110"
                >
                  <EventCard event={ev} lanes={lanes} compact />
                </button>
              ))}
              <div className="text-[0.62rem] text-[#6e7681] text-center pt-1">
                이벤트를 누르면 상세 정보가 표시됩니다.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
