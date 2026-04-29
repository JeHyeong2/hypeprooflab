'use client';

import { useMemo, useRef, useState } from 'react';
import type { TimelineData, TimelineEvent, Holiday } from '@/lib/timeline/types';
import { fuzzyDateMatchesMonth } from '@/lib/timeline/dateUtil';
import { isHoliday, isWeekend } from '@/lib/timeline/holidays';
import EventCard from './EventCard';

interface Props {
  data: TimelineData;
  holidays: Holiday[];
  selectedId?: string | null;
  selectedDay?: string | null;
  onSelectEvent: (ev: TimelineEvent) => void;
  onSelectDay: (iso: string) => void;
  initialYear?: number;
  initialMonth?: number;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function buildMonthGrid(year: number, month: number): { iso: string; inMonth: boolean }[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = first.getUTCDay();
  const start = new Date(Date.UTC(year, month - 1, 1 - startWeekday));
  const cells: { iso: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i));
    const iso = d.toISOString().slice(0, 10);
    cells.push({ iso, inMonth: d.getUTCMonth() === month - 1 });
  }
  return cells;
}

export default function GridView({
  data,
  holidays,
  selectedId,
  selectedDay,
  onSelectEvent,
  onSelectDay,
  initialYear,
  initialMonth,
}: Props) {
  const today = new Date();
  const [year, setYear] = useState(initialYear ?? today.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? today.getMonth() + 1);

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const ev of data.events) {
      if (ev.date.kind !== 'date') continue;
      const list = map.get(ev.date.iso) ?? [];
      list.push(ev);
      map.set(ev.date.iso, list);
    }
    return map;
  }, [data.events]);

  const fuzzyMonthEvents = useMemo(
    () =>
      data.events.filter(
        ev =>
          (ev.date.kind === 'month' || ev.date.kind === 'quarter') &&
          fuzzyDateMatchesMonth(ev.date, year, month),
      ),
    [data.events, year, month],
  );

  const navigate = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    setMonth(m);
    setYear(y);
  };

  // Touch swipe — left/right to change month. Vertical scroll passes through.
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const [swipeDx, setSwipeDx] = useState(0);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    setSwipeDx(0);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const s = touchStart.current;
    if (!s) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      setSwipeDx(Math.max(-80, Math.min(80, dx)));
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    const dt = Date.now() - s.t;
    const horizontal = Math.abs(dx) > Math.abs(dy) * 1.5;
    const fast = dt < 500 && Math.abs(dx) > 40;
    const long = Math.abs(dx) > 80;
    if (horizontal && (fast || long)) {
      navigate(dx > 0 ? -1 : 1);
    }
    touchStart.current = null;
    setSwipeDx(0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2">
        <button
          onClick={() => navigate(-1)}
          className="text-[0.74rem] sm:text-[0.78rem] px-2 sm:px-2.5 py-1 rounded-md border border-[#30363d] bg-[#161b22] text-[#e6edf3] hover:border-[#58a6ff]"
          aria-label="이전 월"
        >
          ‹ 이전
        </button>
        <div className="text-[0.88rem] sm:text-[0.95rem] font-semibold">
          {year}년 {month}월
        </div>
        <button
          onClick={() => navigate(1)}
          className="text-[0.74rem] sm:text-[0.78rem] px-2 sm:px-2.5 py-1 rounded-md border border-[#30363d] bg-[#161b22] text-[#e6edf3] hover:border-[#58a6ff]"
          aria-label="다음 월"
        >
          다음 ›
        </button>
      </div>

      <div
        className="grid grid-cols-7 gap-px bg-[#21262d] rounded-lg overflow-hidden border border-[#21262d] touch-pan-y select-none transition-transform"
        style={{ transform: swipeDx ? `translateX(${swipeDx * 0.3}px)` : undefined }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`bg-[#0d1117] text-[0.62rem] sm:text-[0.7rem] py-1 sm:py-1.5 text-center font-semibold ${
              i === 0 ? 'text-[#e74c3c]' : i === 6 ? 'text-[#58a6ff]' : 'text-[#8b949e]'
            }`}
          >
            {d}
          </div>
        ))}
        {cells.map(({ iso, inMonth }, i) => {
          const dayNum = Number(iso.slice(8, 10));
          const evs = eventsByDay.get(iso) ?? [];
          const holiday = isHoliday(iso, holidays);
          const weekend = isWeekend(iso);
          const dayColor = holiday || weekend === 'sun' ? '#e74c3c' : weekend === 'sat' ? '#58a6ff' : '#e6edf3';
          const isToday = iso === new Date().toISOString().slice(0, 10);
          const isSelDay = selectedDay === iso;
          const empty = evs.length === 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDay(iso)}
              className={`relative bg-[#0d1117] min-h-[58px] sm:min-h-[78px] p-1 sm:p-1.5 text-left transition-colors ${
                inMonth ? '' : 'opacity-40'
              } ${
                isSelDay
                  ? 'bg-[#1f2937] ring-2 ring-[#58a6ff] ring-inset z-[1]'
                  : empty
                  ? 'hover:bg-[#0f1520]'
                  : 'hover:bg-[#161b22]'
              }`}
              aria-current={isToday ? 'date' : undefined}
              aria-pressed={isSelDay}
            >
              {isToday && (
                <span
                  aria-label="오늘"
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#e74c3c] shadow-[0_0_4px_rgba(231,76,60,0.7)]"
                />
              )}
              <div className="flex items-baseline justify-between gap-0.5">
                <span
                  className={`text-[0.66rem] sm:text-[0.74rem] ${isToday ? 'font-bold' : 'font-semibold'}`}
                  style={{ color: dayColor }}
                >
                  {dayNum}
                </span>
                {holiday && (
                  <span
                    className="text-[0.5rem] sm:text-[0.58rem] text-[#e74c3c] truncate hidden sm:inline"
                    title={holiday.name}
                  >
                    {holiday.name}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 mt-0.5 sm:mt-1 pointer-events-none">
                {evs.slice(0, 2).map(ev => (
                  <span
                    key={ev.id}
                    className={`block w-full text-left text-[0.55rem] sm:text-[0.62rem] px-1 py-0.5 rounded truncate ${
                      ev.status === 'cancelled' ? 'line-through opacity-60' : ''
                    } ${selectedId === ev.id ? 'ring-1 ring-[#58a6ff]' : ''}`}
                    style={{
                      background: data.lanes[ev.lane].color + '33',
                      color: data.lanes[ev.lane].color,
                    }}
                  >
                    {ev.title}
                  </span>
                ))}
                {evs.length > 2 && (
                  <span className="block text-[0.55rem] sm:text-[0.6rem] text-[#8b949e]">
                    +{evs.length - 2}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-[0.6rem] text-[#6e7681] text-center mt-1.5 sm:hidden">
        ← 좌우로 밀어 월 이동 →
      </div>

      {fuzzyMonthEvents.length > 0 && (
        <div className="mt-3 bg-[#161b22] border border-[#30363d] rounded-lg p-3">
          <div className="text-[0.74rem] font-semibold text-[#8b949e] mb-2">
            이 달 미정 일정 ({fuzzyMonthEvents.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fuzzyMonthEvents.map(ev => (
              <button
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`text-left transition-all ${
                  selectedId === ev.id ? 'ring-1 ring-[#58a6ff] rounded-lg' : ''
                }`}
              >
                <EventCard event={ev} lanes={data.lanes} compact />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
