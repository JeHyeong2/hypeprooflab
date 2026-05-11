'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { defaultStore } from '@/lib/timeline/store';
import type { SubTask, TaskPriority } from '@/lib/timeline/types';
import { getMemberByEmail } from '@/lib/members';
import { formatTaskAddedMessage, postDiscordMessage } from '@/lib/notify/discord';

export interface TaskActionResult {
  ok: boolean;
  error?: string;
  taskId?: string;
}

function newTaskId(): string {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

async function currentDisplayName(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  const m = getMemberByEmail(email);
  return m?.displayName ?? email.split('@')[0];
}

function eventDateToIso(d: { kind: string; iso?: string }): string | null {
  if (d.kind === 'date' && d.iso) return d.iso;
  return null;
}

function subtractDays(iso: string, n: number): string {
  const [y, m, day] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, day - n));
  return t.toISOString().slice(0, 10);
}

export async function addTaskAction(input: {
  eventId?: string;
  title: string;
  assignees: string[];
  dueDate?: string;
  priority?: TaskPriority;
  sourceExcerpt?: string;
}): Promise<TaskActionResult> {
  const session = await auth();
  if (!session?.user?.email) return { ok: false, error: '로그인이 필요합니다.' };

  const title = input.title.trim();
  if (!title) return { ok: false, error: '제목을 입력해주세요.' };
  if (title.length > 500) return { ok: false, error: '제목이 너무 깁니다 (500자 이내).' };

  const store = defaultStore();

  // Due default: event 첨부 + due 미지정이면 event date - 3일
  let dueDate = input.dueDate;
  let eventTitle: string | undefined;
  if (input.eventId) {
    const data = await store.read();
    const ev = data.events.find(e => e.id === input.eventId);
    if (ev) {
      eventTitle = ev.title;
      if (!dueDate) {
        const evIso = eventDateToIso(ev.date as { kind: string; iso?: string });
        if (evIso) dueDate = subtractDays(evIso, 3);
      }
    }
  }

  const task: SubTask = {
    id: newTaskId(),
    eventId: input.eventId,
    title,
    assignees: input.assignees.filter(Boolean),
    reporter: session.user.email,
    dueDate,
    priority: input.priority ?? 'med',
    done: false,
    sourceExcerpt: input.sourceExcerpt,
    createdAt: new Date().toISOString(),
  };

  try {
    await store.addTask(task);
    revalidatePath('/dashboard');

    // Discord notify (no-op if env unset)
    if (task.assignees.length > 0) {
      const reporterName = await currentDisplayName();
      void postDiscordMessage(
        formatTaskAddedMessage({
          title: task.title,
          assignees: task.assignees,
          dueDate: task.dueDate,
          eventTitle,
          reporterName: reporterName ?? undefined,
        }),
      );
    }

    return { ok: true, taskId: task.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function toggleTaskDoneAction(taskId: string): Promise<TaskActionResult> {
  const session = await auth();
  if (!session?.user?.email) return { ok: false, error: '로그인이 필요합니다.' };
  const myName = await currentDisplayName();
  if (!myName) return { ok: false, error: '로그인이 필요합니다.' };

  const store = defaultStore();
  const data = await store.read();
  const task = (data.tasks ?? []).find(t => t.id === taskId);
  if (!task) return { ok: false, error: '없는 할 일입니다.' };

  // 권한: reporter (email) 또는 assignees (displayName) 포함
  const canToggle =
    task.reporter === session.user.email || task.assignees.includes(myName);
  if (!canToggle) {
    return { ok: false, error: '권한이 없습니다 (reporter 또는 assignee만 체크 가능).' };
  }

  try {
    await store.toggleTaskDone(taskId, myName);
    revalidatePath('/dashboard');
    return { ok: true, taskId };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function removeTaskAction(taskId: string): Promise<TaskActionResult> {
  const session = await auth();
  if (!session?.user?.email) return { ok: false, error: '로그인이 필요합니다.' };

  const store = defaultStore();
  const data = await store.read();
  const task = (data.tasks ?? []).find(t => t.id === taskId);
  if (!task) return { ok: false, error: '없는 할 일입니다.' };

  if (task.reporter !== session.user.email) {
    return { ok: false, error: '권한이 없습니다 (reporter만 삭제 가능).' };
  }

  try {
    await store.removeTask(taskId);
    revalidatePath('/dashboard');
    return { ok: true, taskId };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
