import path from 'path';
import fs from 'fs';
import type {
  TimelineData,
  TimelineEvent,
  ReusableAsset,
  PriorityBanner,
  SubTask,
  TaskLogEntry,
} from './types';

function newLogId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function appendLog(data: TimelineData, entry: Omit<TaskLogEntry, 'id' | 'createdAt'>): TaskLogEntry {
  const log: TaskLogEntry = {
    ...entry,
    id: newLogId(),
    createdAt: new Date().toISOString(),
  };
  // Mutates given object — caller wraps in {...data, taskLog: [...]}
  return log;
}

export interface TimelineStore {
  read(): Promise<TimelineData>;
  write(next: TimelineData): Promise<void>;
  addEvent(e: TimelineEvent): Promise<TimelineData>;
  updateEvent(id: string, patch: Partial<TimelineEvent>): Promise<TimelineData>;
  cancelEvent(id: string, reason?: string): Promise<TimelineData>;
  removeEvent(id: string): Promise<TimelineData>;
  addAsset(a: ReusableAsset): Promise<TimelineData>;
  updateAsset(id: string, patch: Partial<ReusableAsset>): Promise<TimelineData>;
  removeAsset(id: string): Promise<TimelineData>;
  setPriorityBanner(b: PriorityBanner | undefined): Promise<TimelineData>;
  // Sub-tasks
  addTask(t: SubTask): Promise<TimelineData>;
  updateTask(id: string, patch: Partial<SubTask>): Promise<TimelineData>;
  toggleTaskDone(id: string, doneBy: string): Promise<TimelineData>;
  removeTask(id: string): Promise<TimelineData>;
}

const EMPTY: TimelineData = {
  version: 1,
  updatedAt: '',
  lanes: {
    direct: { label: 'HypeProof Direct', color: '#a78bfa' },
    channel: { label: '비트리 channel', color: '#34d399' },
    reusable: { label: 'Reusable Asset Layer', color: '#94a3b8' },
  },
  events: [],
  reusableAssets: [],
  tasks: [],
};

export function resolveTimelinePath(): string {
  const candidates = [
    // primary: web/data/
    path.join(process.cwd(), 'data', 'project-timeline.json'),
    // skill cwd at repo root → hypeprooflab/web/data/
    path.join(process.cwd(), 'web', 'data', 'project-timeline.json'),
    // backward compat for legacy ../data
    path.join(process.cwd(), '..', 'data', 'project-timeline.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  // default to primary so first write creates the canonical location
  return candidates[0];
}

export class JsonFileStore implements TimelineStore {
  constructor(private filePath: string = resolveTimelinePath()) {}

  async read(): Promise<TimelineData> {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const data = JSON.parse(raw) as TimelineData;
      return { ...EMPTY, ...data };
    } catch {
      return EMPTY;
    }
  }

  async write(next: TimelineData): Promise<void> {
    const payload: TimelineData = { ...next, updatedAt: new Date().toISOString() };
    const tmp = `${this.filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
    fs.renameSync(tmp, this.filePath);
  }

  async addEvent(e: TimelineEvent): Promise<TimelineData> {
    const data = await this.read();
    if (data.events.some(ev => ev.id === e.id)) {
      return this.updateEvent(e.id, e);
    }
    const next: TimelineData = { ...data, events: [...data.events, e] };
    await this.write(next);
    return next;
  }

  async updateEvent(id: string, patch: Partial<TimelineEvent>): Promise<TimelineData> {
    const data = await this.read();
    const next: TimelineData = {
      ...data,
      events: data.events.map(ev => (ev.id === id ? { ...ev, ...patch, id } : ev)),
    };
    await this.write(next);
    return next;
  }

  async cancelEvent(id: string, reason?: string): Promise<TimelineData> {
    return this.updateEvent(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelReason: reason,
    });
  }

  async removeEvent(id: string): Promise<TimelineData> {
    const data = await this.read();
    const next: TimelineData = {
      ...data,
      events: data.events.filter(ev => ev.id !== id),
    };
    await this.write(next);
    return next;
  }

  async addAsset(a: ReusableAsset): Promise<TimelineData> {
    const data = await this.read();
    if (data.reusableAssets.some(x => x.id === a.id)) {
      return this.updateAsset(a.id, a);
    }
    const next: TimelineData = { ...data, reusableAssets: [...data.reusableAssets, a] };
    await this.write(next);
    return next;
  }

  async updateAsset(id: string, patch: Partial<ReusableAsset>): Promise<TimelineData> {
    const data = await this.read();
    const next: TimelineData = {
      ...data,
      reusableAssets: data.reusableAssets.map(a => (a.id === id ? { ...a, ...patch, id } : a)),
    };
    await this.write(next);
    return next;
  }

  async removeAsset(id: string): Promise<TimelineData> {
    const data = await this.read();
    const next: TimelineData = {
      ...data,
      reusableAssets: data.reusableAssets.filter(a => a.id !== id),
    };
    await this.write(next);
    return next;
  }

  async setPriorityBanner(b: PriorityBanner | undefined): Promise<TimelineData> {
    const data = await this.read();
    const next: TimelineData = { ...data, priorityBanner: b };
    await this.write(next);
    return next;
  }

  async addTask(t: SubTask): Promise<TimelineData> {
    const data = await this.read();
    const tasks = data.tasks ?? [];
    if (tasks.some(x => x.id === t.id)) {
      return this.updateTask(t.id, t);
    }
    const log = appendLog(data, {
      taskId: t.id,
      actor: t.reporter ?? 'unknown',
      action: 'created',
      after: t,
    });
    const next: TimelineData = {
      ...data,
      tasks: [...tasks, t],
      taskLog: [...(data.taskLog ?? []), log],
    };
    await this.write(next);
    return next;
  }

  async updateTask(id: string, patch: Partial<SubTask>): Promise<TimelineData> {
    const data = await this.read();
    const before = (data.tasks ?? []).find(t => t.id === id);
    if (!before) return data;
    const after: SubTask = { ...before, ...patch, id };
    const tasks = (data.tasks ?? []).map(t => (t.id === id ? after : t));
    const beforeRec = before as unknown as Record<string, unknown>;
    const patchRec = patch as unknown as Record<string, unknown>;
    const changedFields = Object.keys(patch).filter(
      k => beforeRec[k] !== patchRec[k],
    );
    const log = appendLog(data, {
      taskId: id,
      actor: patch.reporter ?? before.reporter ?? 'unknown',
      action: `updated:${changedFields.join(',') || '_'}`,
      before,
      after,
    });
    const next: TimelineData = { ...data, tasks, taskLog: [...(data.taskLog ?? []), log] };
    await this.write(next);
    return next;
  }

  async toggleTaskDone(id: string, doneBy: string): Promise<TimelineData> {
    const data = await this.read();
    const before = (data.tasks ?? []).find(t => t.id === id);
    if (!before) return data;
    const nowDone = !before.done;
    const after: SubTask = {
      ...before,
      done: nowDone,
      doneAt: nowDone ? new Date().toISOString() : undefined,
      doneBy: nowDone ? doneBy : undefined,
    };
    const tasks = (data.tasks ?? []).map(t => (t.id === id ? after : t));
    const log = appendLog(data, {
      taskId: id,
      actor: doneBy,
      action: nowDone ? 'done:true' : 'done:false',
      before: { done: before.done },
      after: { done: nowDone, doneBy: after.doneBy, doneAt: after.doneAt },
    });
    const next: TimelineData = { ...data, tasks, taskLog: [...(data.taskLog ?? []), log] };
    await this.write(next);
    return next;
  }

  async removeTask(id: string): Promise<TimelineData> {
    const data = await this.read();
    const before = (data.tasks ?? []).find(t => t.id === id);
    if (!before) return data;
    const log = appendLog(data, {
      taskId: id,
      actor: before.reporter ?? 'unknown',
      action: 'removed',
      before,
    });
    const next: TimelineData = {
      ...data,
      tasks: (data.tasks ?? []).filter(t => t.id !== id),
      taskLog: [...(data.taskLog ?? []), log],
    };
    await this.write(next);
    return next;
  }
}

let _store: TimelineStore | null = null;

/**
 * Default store selection (opt-in via env):
 *   TIMELINE_STORE=supabase  → SupabaseTimelineStore
 *   (unset / file)           → JsonFileStore (web/data/project-timeline.json)
 *
 * Migration plan: dual-write window optional, then flip TIMELINE_STORE.
 */
export function defaultStore(): TimelineStore {
  if (_store) return _store;
  if (process.env.TIMELINE_STORE === 'supabase') {
    // Lazy: avoid loading supabase code in environments that don't need it
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SupabaseTimelineStore } = require('./supabaseStore') as typeof import('./supabaseStore');
    _store = new SupabaseTimelineStore();
  } else {
    _store = new JsonFileStore();
  }
  return _store;
}

export function setDefaultStore(store: TimelineStore): void {
  _store = store;
}
