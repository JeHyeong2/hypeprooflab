'use client';

import type { TimelineEvent, TimelineLanesMeta, EventStatus } from '@/lib/timeline/types';
import { fuzzyDateLabel } from '@/lib/timeline/dateUtil';

const STATUS_LABEL: Record<EventStatus, string> = {
  planned: '예정',
  'in-progress': '진행중',
  done: '완료',
  deferred: '연기',
  'wrap-up': 'Wrap-up',
  cancelled: '취소',
};

const STATUS_STYLE: Record<EventStatus, string> = {
  planned: 'bg-[rgba(31,111,235,0.18)] text-[#58a6ff]',
  'in-progress': 'bg-[rgba(251,191,36,0.18)] text-[#fbbf24]',
  done: 'bg-[rgba(39,174,96,0.18)] text-[#27ae60]',
  deferred: 'bg-[rgba(232,115,74,0.18)] text-[#e8734a]',
  'wrap-up': 'bg-[rgba(155,89,182,0.18)] text-[#a78bfa]',
  cancelled: 'bg-[rgba(139,148,158,0.18)] text-[#8b949e]',
};

export default function EventCard({
  event,
  lanes,
  compact = false,
}: {
  event: TimelineEvent;
  lanes: TimelineLanesMeta;
  compact?: boolean;
}) {
  const lane = lanes[event.lane];
  const cancelled = event.status === 'cancelled';
  return (
    <div
      className={`relative rounded-lg border bg-[#161b22] border-[#30363d] ${
        compact ? 'px-2.5 py-1.5' : 'px-3 py-2.5'
      } ${cancelled ? 'opacity-60' : ''}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ background: lane.color }}
      />
      <div className="flex items-start justify-between gap-2">
        <div className={`font-semibold ${compact ? 'text-[0.74rem]' : 'text-[0.82rem]'} ${cancelled ? 'line-through' : ''}`}>
          {event.title}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {event.needsClassification && (
            <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-[rgba(251,191,36,0.18)] text-[#fbbf24]">
              분류 필요
            </span>
          )}
          <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-full ${STATUS_STYLE[event.status]}`}>
            {STATUS_LABEL[event.status]}
          </span>
          {event.externalIds?.gcal && (
            <span title="Google Calendar 동기화됨" className="text-[0.6rem] text-[#8b949e]">
              📅
            </span>
          )}
        </div>
      </div>
      {event.subtitle && (
        <div className={`text-[#8b949e] ${compact ? 'text-[0.66rem]' : 'text-[0.72rem]'} mt-0.5`}>
          {event.subtitle}
        </div>
      )}
      <div className={`text-[#8b949e] ${compact ? 'text-[0.62rem]' : 'text-[0.68rem]'} mt-1`}>
        {fuzzyDateLabel(event.date)}
      </div>
      {!compact && event.notes && event.notes.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {event.notes.map((n, i) => (
            <li key={i} className="text-[0.7rem] text-[#c9d1d9]">
              · {n}
            </li>
          ))}
        </ul>
      )}
      {!compact && (event.contacts?.length || event.owner) && (
        <div className="mt-1.5 text-[0.66rem] text-[#8b949e] flex flex-wrap gap-x-2 gap-y-0.5">
          {event.owner && <span>담당: {event.owner}</span>}
          {event.contacts?.map((c, i) => (
            <span key={i}>· {c}</span>
          ))}
        </div>
      )}
    </div>
  );
}
