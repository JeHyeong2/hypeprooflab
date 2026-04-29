'use client';

import type { TimelineEvent, TimelineLanesMeta, EventStatus } from '@/lib/timeline/types';
import { fuzzyDateLabel } from '@/lib/timeline/dateUtil';

const STATUS: Record<EventStatus, { label: string; cls: string }> = {
  planned: { label: '예정', cls: 'bg-[rgba(31,111,235,0.18)] text-[#58a6ff]' },
  'in-progress': { label: '진행중', cls: 'bg-[rgba(251,191,36,0.18)] text-[#fbbf24]' },
  done: { label: '완료', cls: 'bg-[rgba(39,174,96,0.18)] text-[#27ae60]' },
  deferred: { label: '연기', cls: 'bg-[rgba(232,115,74,0.18)] text-[#e8734a]' },
  'wrap-up': { label: 'Wrap-up', cls: 'bg-[rgba(155,89,182,0.18)] text-[#a78bfa]' },
  cancelled: { label: '취소', cls: 'bg-[rgba(139,148,158,0.18)] text-[#8b949e]' },
};

interface Props {
  event: TimelineEvent | null;
  lanes: TimelineLanesMeta;
  onClose?: () => void;
}

export default function EventDetail({ event, lanes, onClose }: Props) {
  if (!event) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="text-3xl mb-2 opacity-40" aria-hidden>📅</div>
        <div className="text-[0.78rem] font-semibold text-[#e6edf3]">상세 정보</div>
        <div className="text-[0.7rem] text-[#8b949e] mt-1.5 leading-relaxed">
          캘린더에서 이벤트 카드를<br />클릭하면 자세한 정보가 표시됩니다.
        </div>
      </div>
    );
  }

  const lane = lanes[event.lane];
  const status = STATUS[event.status];
  const cancelled = event.status === 'cancelled';

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
      {/* Top bar with lane color */}
      <div className="h-1" style={{ background: lane.color }} />

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div
              className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: lane.color + '22', color: lane.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: lane.color }} />
              {lane.label}
            </div>
            <h3
              className={`text-[1rem] font-semibold mt-1.5 leading-tight break-words ${
                cancelled ? 'line-through opacity-60' : ''
              }`}
            >
              {event.title}
            </h3>
            {event.subtitle && (
              <div className="text-[0.74rem] text-[#8b949e] mt-1 leading-relaxed break-words">
                {event.subtitle}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[0.62rem] px-1.5 py-0.5 rounded-full ${status.cls}`}>
              {status.label}
            </span>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="상세 닫기"
                className="text-[#6e7681] hover:text-[#e6edf3] text-[1rem] leading-none ml-1 px-1"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Date */}
        <Field label="날짜" value={fuzzyDateLabel(event.date)} mono />

        {/* Owner */}
        {event.owner && <Field label="담당" value={event.owner} />}

        {/* Contacts */}
        {event.contacts && event.contacts.length > 0 && (
          <Field
            label="연락처"
            value={
              <ul className="space-y-1 mt-0.5">
                {event.contacts.map((c, i) => (
                  <li key={i} className="text-[0.78rem] text-[#e6edf3]">
                    · {c}
                  </li>
                ))}
              </ul>
            }
          />
        )}

        {/* Notes */}
        {event.notes && event.notes.length > 0 && (
          <Field
            label="메모"
            value={
              <ul className="space-y-1.5 mt-0.5">
                {event.notes.map((n, i) => (
                  <li
                    key={i}
                    className="text-[0.78rem] text-[#e6edf3] leading-relaxed pl-2 border-l-2 border-[#21262d]"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            }
          />
        )}

        {/* Cancel reason */}
        {event.status === 'cancelled' && (event.cancelReason || event.cancelledAt) && (
          <Field
            label="취소 정보"
            value={
              <div className="text-[0.74rem] text-[#8b949e] space-y-0.5 mt-0.5">
                {event.cancelReason && <div>사유: {event.cancelReason}</div>}
                {event.cancelledAt && <div>처리: {formatTime(event.cancelledAt)}</div>}
              </div>
            }
          />
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <Field
            label="태그"
            value={
              <div className="flex flex-wrap gap-1 mt-0.5">
                {event.tags.map(t => (
                  <span
                    key={t}
                    className="text-[0.66rem] px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            }
          />
        )}

        {/* Links */}
        {event.links && event.links.length > 0 && (
          <Field
            label="링크"
            value={
              <ul className="space-y-1 mt-0.5">
                {event.links.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.78rem] text-[#58a6ff] hover:underline break-all"
                    >
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            }
          />
        )}

        {/* Footer meta */}
        <div className="pt-3 border-t border-[#21262d] text-[0.62rem] text-[#6e7681] space-y-0.5">
          <div className="font-mono">id: {event.id}</div>
          {event.externalIds?.gcal && (
            <div className="font-mono truncate" title={event.externalIds.gcal}>
              gcal: {event.externalIds.gcal}
            </div>
          )}
          {event.needsClassification && (
            <div className="text-[#fbbf24]">⚠ lane 분류 필요 (Google Calendar에서 import됨)</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[0.62rem] uppercase tracking-wide text-[#6e7681] font-semibold">
        {label}
      </div>
      {typeof value === 'string' ? (
        <div className={`text-[0.78rem] text-[#e6edf3] mt-0.5 ${mono ? 'font-mono' : ''}`}>
          {value}
        </div>
      ) : (
        value
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
