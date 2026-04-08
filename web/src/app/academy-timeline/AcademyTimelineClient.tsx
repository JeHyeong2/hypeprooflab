'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import AuthButton from '@/components/auth/AuthButton';
import type { TimelineData, TimelineTask } from './types';

// ── Colors per member ──
const COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Jay:      { bg: '#1e3a5f', border: '#60a5fa', text: '#93c5fd' },
  Ryan:     { bg: '#4a2028', border: '#f07067', text: '#fca5a1' },
  JUNGWOO:  { bg: '#2d2050', border: '#a78bfa', text: '#c4b5fd' },
  JY:       { bg: '#1a3a2a', border: '#34d399', text: '#6ee7b7' },
  BH:       { bg: '#1a3035', border: '#2dd4bf', text: '#5eead4' },
  TJ:       { bg: '#3d1a35', border: '#f472b6', text: '#f9a8d4' },
  Kiwon:    { bg: '#3d2e10', border: '#fbbf24', text: '#fcd34d' },
  JeHyeong: { bg: '#2a3020', border: '#a3e635', text: '#d9f99d' },
};

const WEEK_THEMES: Record<string, string> = {
  blue:   'bg-blue-500/10 text-blue-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
  green:  'bg-emerald-500/10 text-emerald-400',
  red:    'bg-red-500/10 text-red-400',
  coral:  'bg-red-400/15 text-red-300',
  purple: 'bg-purple-500/10 text-purple-400',
};

function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function formatDate(d: string): string {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

function isWeekend(d: string): boolean {
  const dow = new Date(d).getDay();
  return dow === 0 || dow === 6;
}

interface Props {
  data: TimelineData;
}

export default function AcademyTimelineClient({ data }: Props) {
  const { data: session, status } = useSession();
  const [tooltip, setTooltip] = useState<{ task: TimelineTask; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Auth gate ──
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-zinc-200 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Academy <span className="text-red-400">Timeline</span></h1>
        <p className="text-zinc-500">로그인이 필요합니다.</p>
        <AuthButton />
      </div>
    );
  }

  const userRole = (session.user as Record<string, unknown>)?.role;
  if (userRole !== 'admin' && userRole !== 'creator') {
    return (
      <div className="min-h-screen bg-[#0f1117] text-zinc-200 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-zinc-500">멤버만 접근 가능합니다.</p>
        <AuthButton />
      </div>
    );
  }

  // ── Timeline calculations ──
  const allDates = data.tasks.flatMap(t => [t.start, t.end]);
  const minDate = allDates.reduce((a, b) => a < b ? a : b);
  const maxDate = allDates.reduce((a, b) => a > b ? a : b);
  // Pad 1 day before and after
  const startDate = new Date(new Date(minDate).getTime() - 86400000).toISOString().slice(0, 10);
  const endDate = new Date(new Date(maxDate).getTime() + 2 * 86400000).toISOString().slice(0, 10);
  const totalDays = daysBetween(startDate, endDate) + 1;

  const today = new Date().toISOString().slice(0, 10);
  const daysToDD = daysBetween(today, data.dday);
  const lanes = data.members.map(m => m.id);

  // Generate date array
  const dates: string[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(new Date(startDate).getTime() + i * 86400000);
    dates.push(d.toISOString().slice(0, 10));
  }

  const cellPct = 100 / totalDays;

  function taskLeft(t: TimelineTask): number {
    return daysBetween(startDate, t.start) * cellPct;
  }
  function taskWidth(t: TimelineTask): number {
    return Math.max((daysBetween(t.start, t.end) + 1) * cellPct, cellPct);
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-zinc-200" style={{ fontFamily: "'Pretendard', -apple-system, sans-serif" }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1d2e] to-[#2d1f3d] px-6 md:px-12 py-6 border-b border-white/5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold">
              HypeProof Academy — <span className="text-red-400">{data.title}</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">{data.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-red-400/15 border border-red-400/30 rounded-lg px-4 py-2 text-red-400 font-bold text-sm">
              D-Day까지 <span className="text-lg">{daysToDD > 0 ? daysToDD : 0}</span>일
            </div>
            <AuthButton />
          </div>
        </div>
        <p className="text-zinc-600 text-xs mt-2">Last updated: {data.updatedAt}</p>
      </div>

      <div className="px-4 md:px-12 py-6 space-y-6">
        {/* Role Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.members.map(m => {
            const c = COLORS[m.id] || { bg: '#2a2a3a', border: '#888', text: '#bbb' };
            return (
              <div key={m.id} className="bg-[#181b28] border border-white/5 rounded-lg p-3 hover:border-white/15 transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.border }} />
                  {m.name}
                </div>
                <div className="text-xs text-zinc-400 mt-1.5 leading-relaxed">5/5: {m.roleNow}</div>
                <div className="text-xs text-zinc-600 mt-1 pt-1 border-t border-white/5">&rarr; {m.roleFuture}</div>
              </div>
            );
          })}
        </div>

        {/* Gantt Chart */}
        <div className="bg-[#181b28] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="font-bold text-sm">Execution Timeline</span>
            <div className="flex gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-blue-400" /> Today</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-yellow-400" /> 4/20 치과</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-red-400" /> 5/5 D-Day</span>
            </div>
          </div>

          <div className="overflow-x-auto" ref={containerRef}>
            <div style={{ minWidth: '1100px' }}>
              {/* Week header */}
              <div className="flex border-b border-white/5">
                <div className="w-28 flex-shrink-0" />
                <div className="flex-1 flex">
                  {data.weeks.map((w, i) => {
                    const wStart = w.start < startDate ? startDate : w.start;
                    const wEnd = w.end > endDate ? endDate : w.end;
                    const span = daysBetween(wStart, wEnd) + 1;
                    const pct = (span / totalDays) * 100;
                    return (
                      <div key={i} className={`text-center text-[10px] font-bold py-1 border-r border-white/5 ${WEEK_THEMES[w.theme] || ''}`} style={{ flex: `0 0 ${pct}%` }}>
                        {w.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date header */}
              <div className="flex border-b border-white/5">
                <div className="w-28 flex-shrink-0" />
                <div className="flex-1 flex">
                  {dates.map(d => (
                    <div
                      key={d}
                      className={`text-center text-[10px] py-1 border-r border-white/[0.03] ${
                        isWeekend(d) ? 'bg-white/[0.015]' : ''
                      } ${d === today ? 'text-blue-400 font-bold' : ''} ${
                        data.milestones.some(m => m.date === d) ? 'text-red-400 font-bold' : 'text-zinc-600'
                      }`}
                      style={{ flex: `0 0 ${cellPct}%` }}
                    >
                      {formatDate(d)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Swim lanes */}
              <div className="relative">
                {/* Today line */}
                {today >= startDate && today <= endDate && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-400/50 z-10 pointer-events-none"
                    style={{ left: `calc(112px + ${daysBetween(startDate, today) * cellPct}% + ${cellPct / 2}%)` }}
                  />
                )}

                {/* Milestone lines */}
                {data.milestones.map(ms => (
                  ms.date >= startDate && ms.date <= endDate && (
                    <div
                      key={ms.date}
                      className={`absolute top-0 bottom-0 w-0.5 z-10 pointer-events-none ${
                        ms.color === 'red' ? 'bg-red-400/40' : 'bg-yellow-400/40'
                      }`}
                      style={{
                        left: `calc(112px + ${daysBetween(startDate, ms.date) * cellPct}% + ${cellPct / 2}%)`,
                        backgroundImage: `repeating-linear-gradient(to bottom, currentColor 0, currentColor 6px, transparent 6px, transparent 12px)`,
                        background: undefined,
                      }}
                    />
                  )
                ))}

                {lanes.map(laneId => {
                  const c = COLORS[laneId] || { bg: '#2a2a3a', border: '#888', text: '#bbb' };
                  const laneTasks = data.tasks.filter(t => t.lane === laneId);
                  return (
                    <div key={laneId} className="flex h-12 border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                      <div className="w-28 flex-shrink-0 flex items-center gap-2 px-3 text-xs font-semibold border-r border-white/5 bg-[#14172280]">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.border }} />
                        {laneId}
                      </div>
                      <div className="flex-1 relative">
                        {laneTasks.map((t, i) => (
                          <div
                            key={i}
                            className="absolute h-7 top-2.5 rounded-md text-[10px] font-semibold flex items-center px-2 cursor-pointer transition-all hover:brightness-125 hover:scale-y-110 z-[2] overflow-hidden whitespace-nowrap text-ellipsis"
                            style={{
                              left: `${taskLeft(t)}%`,
                              width: `${taskWidth(t)}%`,
                              background: c.bg,
                              border: `1.5px solid ${c.border}`,
                              color: c.text,
                            }}
                            onMouseEnter={(e) => setTooltip({ task: t, x: e.clientX, y: e.clientY })}
                            onMouseMove={(e) => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                            onMouseLeave={() => setTooltip(null)}
                          >
                            {t.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Decisions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data.decisions).map(([key, dec]) => (
            <div key={key} className="bg-[#181b28] border border-white/5 rounded-xl p-4">
              <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
                <span className="bg-red-400/15 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded">
                  {formatDate(dec.date)}
                </span>
                {dec.title}
              </h4>
              <ul className="space-y-1.5">
                {dec.items.map((item, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex gap-2">
                    <span className="text-zinc-600 flex-shrink-0">&rarr;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed bg-[#242838] border border-white/10 rounded-lg px-4 py-3 text-xs z-50 pointer-events-none shadow-2xl max-w-xs"
          style={{
            left: tooltip.x + 12 + 320 > window.innerWidth ? tooltip.x - 330 : tooltip.x + 12,
            top: tooltip.y + 12 + 150 > window.innerHeight ? tooltip.y - 150 : tooltip.y + 12,
          }}
        >
          <div className="font-bold text-sm text-white">{tooltip.task.label}</div>
          <div className="text-zinc-500 mt-0.5">
            {formatDate(tooltip.task.start)}
            {tooltip.task.start !== tooltip.task.end && ` → ${formatDate(tooltip.task.end)}`}
          </div>
          <div className="text-zinc-400 mt-1.5">{tooltip.task.desc}</div>
          {tooltip.task.output && (
            <div className="text-blue-400 mt-1">Output: {tooltip.task.output}</div>
          )}
        </div>
      )}
    </div>
  );
}
