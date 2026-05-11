'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { defaultStore } from '@/lib/timeline/store';
import type { SubTask, TaskPriority } from '@/lib/timeline/types';
import { getMemberByEmail } from '@/lib/members';

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

  const task: SubTask = {
    id: newTaskId(),
    eventId: input.eventId,
    title,
    assignees: input.assignees.filter(Boolean),
    reporter: session.user.email,
    dueDate: input.dueDate,
    priority: input.priority ?? 'med',
    done: false,
    sourceExcerpt: input.sourceExcerpt,
    createdAt: new Date().toISOString(),
  };

  try {
    await defaultStore().addTask(task);
    revalidatePath('/dashboard');
    return { ok: true, taskId: task.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function toggleTaskDoneAction(taskId: string): Promise<TaskActionResult> {
  const name = await currentDisplayName();
  if (!name) return { ok: false, error: '로그인이 필요합니다.' };
  try {
    await defaultStore().toggleTaskDone(taskId, name);
    revalidatePath('/dashboard');
    return { ok: true, taskId };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function removeTaskAction(taskId: string): Promise<TaskActionResult> {
  const session = await auth();
  if (!session?.user?.email) return { ok: false, error: '로그인이 필요합니다.' };
  try {
    await defaultStore().removeTask(taskId);
    revalidatePath('/dashboard');
    return { ok: true, taskId };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
