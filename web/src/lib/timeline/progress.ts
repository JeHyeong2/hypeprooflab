import type { SubTask, EventProgress } from './types';

const isOverdue = (t: SubTask, todayIso: string): boolean =>
  !!t.dueDate && !t.done && t.dueDate < todayIso;

export function progressForEvent(
  eventId: string,
  tasks: SubTask[] | undefined,
  todayIso: string = new Date().toISOString().slice(0, 10),
): EventProgress | null {
  if (!tasks || tasks.length === 0) return null;
  const my = tasks.filter(t => t.eventId === eventId);
  if (my.length === 0) return null;
  return {
    total: my.length,
    done: my.filter(t => t.done).length,
    overdue: my.filter(t => isOverdue(t, todayIso)).length,
  };
}

export function buildProgressMap(
  tasks: SubTask[] | undefined,
): Map<string, EventProgress> {
  const map = new Map<string, EventProgress>();
  if (!tasks) return map;
  const today = new Date().toISOString().slice(0, 10);
  for (const t of tasks) {
    if (!t.eventId) continue;
    const cur = map.get(t.eventId) ?? { total: 0, done: 0, overdue: 0 };
    cur.total += 1;
    if (t.done) cur.done += 1;
    if (isOverdue(t, today)) cur.overdue += 1;
    map.set(t.eventId, cur);
  }
  return map;
}
