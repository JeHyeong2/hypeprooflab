'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TimelineData, TimelineEvent, Holiday } from '@/lib/timeline/types';
import type { Note } from '@/lib/sheets/notes';
import type { DashboardMember } from '../types';
import PriorityBanner from './calendar/PriorityBanner';
import GridView from './calendar/GridView';
import TimelineView from './calendar/TimelineView';
import NotesPanel from './calendar/NotesPanel';
import EventDetail from './calendar/EventDetail';
import DayDetail from './calendar/DayDetail';
import SyncButton from './calendar/SyncButton';
import { isHoliday, isWeekend } from '@/lib/timeline/holidays';

type ViewMode = 'grid' | 'timeline';

interface Props {
  data: TimelineData;
  holidays: Holiday[];
  notes: Note[];
  members: DashboardMember[];
  sheetsReady: boolean;
}

export default function CalendarTab({ data, holidays, notes, members, sheetsReady }: Props) {
  const [view, setView] = useState<ViewMode>('grid');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<TimelineEvent | null>(null);

  // ESC: 이벤트 선택 → 그날 보기 / 그날 → 닫힘
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selected) setSelected(null);
      else if (selectedDay) setSelectedDay(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, selectedDay]);

  const onSelectEvent = (ev: TimelineEvent) => {
    setSelected(prev => (prev?.id === ev.id ? null : ev));
    if (ev.date.kind === 'date' && !selectedDay) setSelectedDay(ev.date.iso);
  };

  const onSelectDay = (iso: string) => {
    setSelectedDay(prev => (prev === iso ? null : iso));
    setSelected(null);
  };

  const dayEvents = useMemo(
    () =>
      selectedDay
        ? data.events.filter(e => e.date.kind === 'date' && e.date.iso === selectedDay)
        : [],
    [data.events, selectedDay],
  );
  const dayHoliday = selectedDay ? isHoliday(selectedDay, holidays) : null;
  const dayWeekend = selectedDay ? isWeekend(selectedDay) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-3">
      {/* Main calendar column */}
      <div className="min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[0.95rem] font-semibold">캘린더</h2>
            <div className="flex rounded-md border border-[#30363d] overflow-hidden" role="tablist">
              <button
                role="tab"
                aria-selected={view === 'grid'}
                onClick={() => setView('grid')}
                className={`text-[0.72rem] px-2.5 py-1 ${
                  view === 'grid'
                    ? 'bg-[#1f6feb] text-white font-semibold'
                    : 'bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3]'
                }`}
              >
                그리드
              </button>
              <button
                role="tab"
                aria-selected={view === 'timeline'}
                onClick={() => setView('timeline')}
                className={`text-[0.72rem] px-2.5 py-1 ${
                  view === 'timeline'
                    ? 'bg-[#1f6feb] text-white font-semibold'
                    : 'bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3]'
                }`}
              >
                타임라인
              </button>
            </div>
          </div>
          <SyncButton lastSyncAt={data.gcal?.lastSyncAt} />
        </div>

        <PriorityBanner banner={data.priorityBanner} />

        {view === 'grid' ? (
          <GridView
            data={data}
            holidays={holidays}
            selectedId={selected?.id ?? null}
            selectedDay={selectedDay}
            onSelectEvent={onSelectEvent}
            onSelectDay={onSelectDay}
          />
        ) : (
          <TimelineView
            data={data}
            holidays={holidays}
            selectedId={selected?.id ?? null}
            onSelectEvent={onSelectEvent}
          />
        )}

        <div className="mt-3 text-[0.62rem] sm:text-[0.66rem] text-[#8b949e] leading-relaxed">
          일정 등록·변경·취소·삭제는 Claude Code에서 <code className="text-[#58a6ff]">/cal</code> 또는 자연어로 호출.
        </div>
      </div>

      {/* Right column: Event > Day > Empty 우선순위 + Notes */}
      <aside className="space-y-3 lg:sticky lg:top-14 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:pr-1">
        {selected ? (
          <div className="space-y-2">
            {selectedDay && (
              <button
                onClick={() => setSelected(null)}
                className="text-[0.7rem] text-[#58a6ff] hover:underline inline-flex items-center gap-1"
              >
                ← 그날 일정 목록으로
              </button>
            )}
            <EventDetail
              event={selected}
              lanes={data.lanes}
              onClose={() => {
                setSelected(null);
                setSelectedDay(null);
              }}
            />
          </div>
        ) : selectedDay ? (
          <DayDetail
            dayIso={selectedDay}
            events={dayEvents}
            holiday={dayHoliday}
            weekend={dayWeekend}
            lanes={data.lanes}
            onSelectEvent={onSelectEvent}
            onClose={() => setSelectedDay(null)}
          />
        ) : (
          <EventDetail event={null} lanes={data.lanes} />
        )}
        <NotesPanel notes={notes} members={members} sheetsReady={sheetsReady} />
      </aside>
    </div>
  );
}
