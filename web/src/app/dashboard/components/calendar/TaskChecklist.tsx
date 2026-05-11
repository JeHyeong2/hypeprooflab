'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import type { SubTask, TimelineEvent } from '@/lib/timeline/types';
import type { DashboardMember } from '../../types';
import {
  addTaskAction,
  toggleTaskDoneAction,
  removeTaskAction,
} from '../../actions/tasks';
import MentionInput from './MentionInput';

interface Props {
  event: TimelineEvent;
  tasks: SubTask[];
  members: DashboardMember[];
}

const PRIORITY_BADGE: Record<NonNullable<SubTask['priority']>, string> = {
  low: 'bg-[rgba(139,148,158,0.15)] text-[#8b949e]',
  med: 'bg-[rgba(31,111,235,0.15)] text-[#58a6ff]',
  high: 'bg-[rgba(231,76,60,0.18)] text-[#e74c3c]',
};

function parseInputLine(line: string, members: DashboardMember[]): {
  title: string;
  assignees: string[];
  dueDate?: string;
  priority?: SubTask['priority'];
} {
  let text = line.trim();
  const memberSet = new Set(members.map(m => m.displayName));
  const assignees = new Set<string>();
  text = text.replace(/@([A-Za-z가-힣][A-Za-z0-9가-힣_]*)/g, (_m, name) => {
    if (memberSet.has(name)) assignees.add(name);
    return '';
  });

  let dueDate: string | undefined;
  // YYYY-MM-DD
  let m = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    dueDate = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    text = text.replace(m[0], '');
  } else {
    // M/D or MM/DD (current year)
    m = text.match(/(?:^|\s)(\d{1,2})\/(\d{1,2})(?:\s|$|까지)/);
    if (m) {
      const now = new Date();
      dueDate = `${now.getFullYear()}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
      text = text.replace(m[0], ' ');
    }
  }

  let priority: SubTask['priority'] | undefined;
  if (/긴급|급함|urgent|high/i.test(text)) {
    priority = 'high';
    text = text.replace(/긴급|급함|urgent|high/gi, '');
  } else if (/낮음|low/i.test(text)) {
    priority = 'low';
    text = text.replace(/낮음|low/gi, '');
  }

  // strip trailing "까지" / "에" particle
  text = text.replace(/까지|에|by/g, '').replace(/\s+/g, ' ').trim();

  return {
    title: text,
    assignees: [...assignees],
    dueDate,
    priority,
  };
}

function isOverdue(t: SubTask): boolean {
  if (!t.dueDate || t.done) return false;
  return t.dueDate < new Date().toISOString().slice(0, 10);
}

export default function TaskChecklist({ event, tasks, members }: Props) {
  const { data: session } = useSession();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const myEmail = session?.user?.email ?? null;
  const myDisplay = (session?.user as { displayName?: string; name?: string } | undefined)
    ?.displayName
    ?? session?.user?.name
    ?? null;

  const canToggle = (t: SubTask): boolean => {
    if (!myEmail) return false;
    if (t.reporter === myEmail) return true;
    if (myDisplay && t.assignees.includes(myDisplay)) return true;
    return false;
  };

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const overdueCount = tasks.filter(isOverdue).length;
  const progress = total > 0 ? done / total : 0;
  const allDone = total > 0 && done === total;

  const onAdd = () => {
    setError(null);
    const text = input.trim();
    if (!text) return;
    const parsed = parseInputLine(text, members);
    if (!parsed.title) {
      setError('내용을 입력해주세요.');
      return;
    }
    startTransition(async () => {
      const r = await addTaskAction({
        eventId: event.id,
        title: parsed.title,
        assignees: parsed.assignees,
        dueDate: parsed.dueDate,
        priority: parsed.priority,
        sourceExcerpt: text,
      });
      if (r.ok) setInput('');
      else setError(r.error ?? '등록 실패');
    });
  };

  const onToggle = (id: string) => {
    setError(null);
    startTransition(async () => {
      const r = await toggleTaskDoneAction(id);
      if (!r.ok) setError(r.error ?? '실패');
    });
  };

  const onRemove = (id: string) => {
    if (!confirm('이 할 일을 삭제할까요?')) return;
    startTransition(async () => {
      await removeTaskAction(id);
    });
  };

  return (
    <div className="space-y-2">
      <div className="text-[0.62rem] uppercase tracking-wide text-[#6e7681] font-semibold">
        진척도
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-[#21262d] overflow-hidden">
          <div
            className={`h-full transition-all ${
              allDone ? 'bg-[#27ae60]' : overdueCount > 0 ? 'bg-[#e74c3c]' : 'bg-[#58a6ff]'
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="text-[0.7rem] text-[#e6edf3] font-mono">
          {done}/{total}
        </div>
        {overdueCount > 0 && (
          <span className="text-[0.62rem] text-[#e74c3c]" title="지연된 할 일">
            🔥 {overdueCount}
          </span>
        )}
      </div>

      <div className="text-[0.62rem] uppercase tracking-wide text-[#6e7681] font-semibold pt-2">
        할 일 ({total})
      </div>
      {total === 0 ? (
        <div className="text-[0.7rem] text-[#6e7681] py-1">아직 할 일이 없습니다.</div>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map(t => {
            const overdue = isOverdue(t);
            const mine = myEmail && t.reporter === myEmail;
            const togglable = canToggle(t);
            return (
              <li
                key={t.id}
                className={`flex items-start gap-2 rounded-md px-1.5 py-1 ${
                  t.done ? 'opacity-60' : ''
                } ${overdue ? 'bg-[rgba(231,76,60,0.06)]' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => onToggle(t.id)}
                  disabled={pending || !togglable}
                  title={
                    togglable
                      ? t.done
                        ? '체크 해제'
                        : '완료 처리'
                      : 'reporter 또는 assignee만 체크 가능'
                  }
                  className={`mt-0.5 w-3.5 h-3.5 shrink-0 rounded border ${
                    t.done
                      ? 'bg-[#27ae60] border-[#27ae60] text-white'
                      : togglable
                      ? 'bg-transparent border-[#30363d] hover:border-[#58a6ff]'
                      : 'bg-transparent border-[#21262d] cursor-not-allowed'
                  } flex items-center justify-center text-[0.6rem] leading-none`}
                  aria-pressed={t.done}
                  aria-disabled={!togglable}
                >
                  {t.done && '✓'}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`text-[0.78rem] ${t.done ? 'line-through' : ''} break-words`}>
                    {t.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[0.62rem] text-[#8b949e]">
                    {t.assignees.length > 0 && (
                      <span>
                        {t.assignees.map(a => (
                          <span
                            key={a}
                            className="inline-block px-1 rounded bg-[rgba(31,111,235,0.18)] text-[#58a6ff] mr-1"
                          >
                            @{a}
                          </span>
                        ))}
                      </span>
                    )}
                    {t.dueDate && (
                      <span className={overdue ? 'text-[#e74c3c] font-semibold' : ''}>
                        due {t.dueDate}
                        {overdue && ' 🔥'}
                      </span>
                    )}
                    {t.priority && t.priority !== 'med' && (
                      <span className={`px-1 rounded ${PRIORITY_BADGE[t.priority]}`}>
                        {t.priority}
                      </span>
                    )}
                    {t.done && t.doneBy && <span>· {t.doneBy} 완료</span>}
                  </div>
                </div>
                {mine && (
                  <button
                    type="button"
                    onClick={() => onRemove(t.id)}
                    disabled={pending}
                    className="text-[0.62rem] text-[#6e7681] hover:text-[#e74c3c] shrink-0"
                    aria-label="할 일 삭제"
                  >
                    ×
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {session ? (
        <div className="pt-2 space-y-1">
          <MentionInput
            value={input}
            onChange={setInput}
            candidates={members.map(m => m.displayName)}
            placeholder="예: @TJ 5/22까지 촬영 준비"
            disabled={pending}
            rows={2}
            maxLength={500}
            onEnter={onAdd}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.6rem] text-[#6e7681]">
              @로 멤버 · 5/22 또는 2026-05-22 · 긴급/낮음 · Enter로 추가
            </span>
            <button
              type="button"
              onClick={onAdd}
              disabled={pending || !input.trim()}
              className={`text-[0.7rem] px-2 py-0.5 rounded-md font-semibold ${
                pending || !input.trim()
                  ? 'bg-[#1f6feb]/40 text-white/60 cursor-not-allowed'
                  : 'bg-[#1f6feb] hover:bg-[#388bfd] text-white'
              }`}
            >
              {pending ? '저장 중…' : '추가'}
            </button>
          </div>
          {error && <div className="text-[0.66rem] text-[#e74c3c]">{error}</div>}
        </div>
      ) : (
        <div className="text-[0.66rem] text-[#8b949e] pt-1">로그인하면 할 일 추가 가능.</div>
      )}
    </div>
  );
}
