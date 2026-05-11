import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import type {
  TimelineData,
  TimelineEvent,
  ReusableAsset,
  PriorityBanner,
  SubTask,
  FuzzyDate,
  TimelineLanesMeta,
  Lane,
  EventStatus,
  AssetStatus,
  TaskPriority,
} from './types';
import type { TimelineStore } from './store';

interface EventRow {
  id: string;
  lane: Lane;
  title: string;
  subtitle: string | null;
  status: EventStatus;
  date_kind: FuzzyDate['kind'];
  date_iso: string | null;
  date_year: number | null;
  date_month: number | null;
  date_quarter: number | null;
  date_part_of_day: 'AM' | 'PM' | null;
  contacts: string[] | null;
  notes: string[] | null;
  owner: string | null;
  links: { label: string; url: string }[] | null;
  tags: string[] | null;
  external_ids: { gcal?: string; supabase?: string } | null;
  needs_classification: boolean;
  cancelled_at: string | null;
  cancel_reason: string | null;
}

interface TaskRow {
  id: string;
  event_id: string | null;
  title: string;
  assignees: string[];
  reporter: string | null;
  due_date: string | null;
  priority: TaskPriority;
  done: boolean;
  done_at: string | null;
  done_by: string | null;
  source_excerpt: string | null;
  created_at: string;
}

interface AssetRow {
  id: string;
  title: string;
  subtitle: string | null;
  status: AssetStatus;
  owned_by: string | null;
}

interface MetaRow {
  id: 'singleton';
  priority_banner: PriorityBanner | null;
  lanes: TimelineLanesMeta;
  gcal: { calendarId?: string; lastSyncAt?: string } | null;
  updated_at: string;
}

function rowToEvent(r: EventRow): TimelineEvent {
  const date = rowToFuzzyDate(r);
  return {
    id: r.id,
    lane: r.lane,
    title: r.title,
    subtitle: r.subtitle ?? undefined,
    date,
    status: r.status,
    cancelledAt: r.cancelled_at ?? undefined,
    cancelReason: r.cancel_reason ?? undefined,
    contacts: r.contacts ?? undefined,
    notes: r.notes ?? undefined,
    owner: r.owner ?? undefined,
    links: r.links ?? undefined,
    tags: r.tags ?? undefined,
    externalIds: r.external_ids ?? undefined,
    needsClassification: r.needs_classification,
  };
}

function rowToFuzzyDate(r: EventRow): FuzzyDate {
  switch (r.date_kind) {
    case 'date':
      return {
        kind: 'date',
        iso: r.date_iso!,
        partOfDay: r.date_part_of_day ?? undefined,
      };
    case 'month':
      return { kind: 'month', year: r.date_year!, month: r.date_month! };
    case 'quarter':
      return {
        kind: 'quarter',
        year: r.date_year!,
        quarter: r.date_quarter as 1 | 2 | 3 | 4,
      };
    case 'ongoing':
      return { kind: 'ongoing' };
  }
}

function eventToRow(e: TimelineEvent): Omit<EventRow, 'created_at' | 'updated_at'> {
  const base = {
    id: e.id,
    lane: e.lane,
    title: e.title,
    subtitle: e.subtitle ?? null,
    status: e.status,
    contacts: e.contacts ?? null,
    notes: e.notes ?? null,
    owner: e.owner ?? null,
    links: e.links ?? null,
    tags: e.tags ?? null,
    external_ids: e.externalIds ?? null,
    needs_classification: !!e.needsClassification,
    cancelled_at: e.cancelledAt ?? null,
    cancel_reason: e.cancelReason ?? null,
    date_kind: e.date.kind,
    date_iso: null as string | null,
    date_year: null as number | null,
    date_month: null as number | null,
    date_quarter: null as number | null,
    date_part_of_day: null as 'AM' | 'PM' | null,
  };
  if (e.date.kind === 'date') {
    base.date_iso = e.date.iso;
    base.date_part_of_day = e.date.partOfDay ?? null;
  } else if (e.date.kind === 'month') {
    base.date_year = e.date.year;
    base.date_month = e.date.month;
  } else if (e.date.kind === 'quarter') {
    base.date_year = e.date.year;
    base.date_quarter = e.date.quarter;
  }
  return base;
}

function rowToTask(r: TaskRow): SubTask {
  return {
    id: r.id,
    eventId: r.event_id ?? undefined,
    title: r.title,
    assignees: r.assignees,
    reporter: r.reporter ?? undefined,
    dueDate: r.due_date ?? undefined,
    priority: r.priority,
    done: r.done,
    doneAt: r.done_at ?? undefined,
    doneBy: r.done_by ?? undefined,
    sourceExcerpt: r.source_excerpt ?? undefined,
    createdAt: r.created_at,
  };
}

function taskToRow(t: SubTask): Omit<TaskRow, 'created_at'> & { created_at?: string } {
  return {
    id: t.id,
    event_id: t.eventId ?? null,
    title: t.title,
    assignees: t.assignees,
    reporter: t.reporter ?? null,
    due_date: t.dueDate ?? null,
    priority: t.priority ?? 'med',
    done: t.done,
    done_at: t.doneAt ?? null,
    done_by: t.doneBy ?? null,
    source_excerpt: t.sourceExcerpt ?? null,
    created_at: t.createdAt,
  };
}

function rowToAsset(r: AssetRow): ReusableAsset {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle ?? undefined,
    status: r.status,
    ownedBy: r.owned_by ?? undefined,
  };
}

const DEFAULT_LANES: TimelineLanesMeta = {
  direct: { label: 'HypeProof Direct', color: '#a78bfa' },
  channel: { label: '비트리 channel', color: '#34d399' },
  reusable: { label: 'Reusable Asset Layer', color: '#94a3b8' },
};

export class SupabaseTimelineStore implements TimelineStore {
  // Lazy: don't touch Supabase until a method is actually called.
  // Lets defaultStore() instantiate this without env vars set.
  private _client: SupabaseClient | null;

  constructor(client?: SupabaseClient) {
    this._client = client ?? null;
  }

  private get client(): SupabaseClient {
    if (!this._client) this._client = getSupabase();
    return this._client;
  }

  async read(): Promise<TimelineData> {
    const [events, tasks, assets, meta] = await Promise.all([
      this.client.from('timeline_events').select('*'),
      this.client.from('timeline_tasks').select('*'),
      this.client.from('timeline_reusable_assets').select('*'),
      this.client.from('timeline_meta').select('*').eq('id', 'singleton').single(),
    ]);

    const metaRow = meta.data as MetaRow | null;
    return {
      version: 1,
      updatedAt: metaRow?.updated_at ?? new Date().toISOString(),
      lanes: metaRow?.lanes ?? DEFAULT_LANES,
      priorityBanner: metaRow?.priority_banner ?? undefined,
      events: ((events.data as EventRow[] | null) ?? []).map(rowToEvent),
      reusableAssets: ((assets.data as AssetRow[] | null) ?? []).map(rowToAsset),
      tasks: ((tasks.data as TaskRow[] | null) ?? []).map(rowToTask),
      gcal: metaRow?.gcal ?? undefined,
    };
  }

  async write(_next: TimelineData): Promise<void> {
    // Bulk write would require diffing; we expose granular methods instead.
    throw new Error(
      'SupabaseTimelineStore.write is not supported. Use granular add/update/remove methods.',
    );
  }

  async addEvent(e: TimelineEvent): Promise<TimelineData> {
    await this.client.from('timeline_events').upsert(eventToRow(e));
    return this.read();
  }

  async updateEvent(id: string, patch: Partial<TimelineEvent>): Promise<TimelineData> {
    const data = await this.read();
    const existing = data.events.find(ev => ev.id === id);
    if (!existing) return data;
    const merged: TimelineEvent = { ...existing, ...patch, id };
    await this.client.from('timeline_events').update(eventToRow(merged)).eq('id', id);
    return this.read();
  }

  async cancelEvent(id: string, reason?: string): Promise<TimelineData> {
    return this.updateEvent(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelReason: reason,
    });
  }

  async removeEvent(id: string): Promise<TimelineData> {
    await this.client.from('timeline_events').delete().eq('id', id);
    return this.read();
  }

  async addAsset(a: ReusableAsset): Promise<TimelineData> {
    await this.client.from('timeline_reusable_assets').upsert({
      id: a.id,
      title: a.title,
      subtitle: a.subtitle ?? null,
      status: a.status,
      owned_by: a.ownedBy ?? null,
    });
    return this.read();
  }

  async updateAsset(id: string, patch: Partial<ReusableAsset>): Promise<TimelineData> {
    const merged: Partial<AssetRow> = {
      title: patch.title,
      subtitle: patch.subtitle ?? null,
      status: patch.status,
      owned_by: patch.ownedBy ?? null,
    };
    Object.keys(merged).forEach(k => (merged as any)[k] === undefined && delete (merged as any)[k]);
    await this.client.from('timeline_reusable_assets').update(merged).eq('id', id);
    return this.read();
  }

  async removeAsset(id: string): Promise<TimelineData> {
    await this.client.from('timeline_reusable_assets').delete().eq('id', id);
    return this.read();
  }

  async setPriorityBanner(b: PriorityBanner | undefined): Promise<TimelineData> {
    await this.client
      .from('timeline_meta')
      .update({ priority_banner: b ?? null })
      .eq('id', 'singleton');
    return this.read();
  }

  async addTask(t: SubTask): Promise<TimelineData> {
    await this.client.from('timeline_tasks').upsert(taskToRow(t));
    await this.client.from('timeline_task_log').insert({
      task_id: t.id,
      actor: t.reporter ?? null,
      action: 'created',
      after_value: taskToRow(t),
    });
    return this.read();
  }

  async updateTask(id: string, patch: Partial<SubTask>): Promise<TimelineData> {
    const data = await this.read();
    const existing = (data.tasks ?? []).find(t => t.id === id);
    if (!existing) return data;
    const merged: SubTask = { ...existing, ...patch, id };
    await this.client.from('timeline_tasks').update(taskToRow(merged)).eq('id', id);
    return this.read();
  }

  async toggleTaskDone(id: string, doneBy: string): Promise<TimelineData> {
    const data = await this.read();
    const existing = (data.tasks ?? []).find(t => t.id === id);
    if (!existing) return data;
    const nowDone = !existing.done;
    const update = {
      done: nowDone,
      done_at: nowDone ? new Date().toISOString() : null,
      done_by: nowDone ? doneBy : null,
    };
    await this.client.from('timeline_tasks').update(update).eq('id', id);
    await this.client.from('timeline_task_log').insert({
      task_id: id,
      actor: doneBy,
      action: nowDone ? 'done:true' : 'done:false',
      before_value: { done: existing.done },
      after_value: update,
    });
    return this.read();
  }

  async removeTask(id: string): Promise<TimelineData> {
    await this.client.from('timeline_tasks').delete().eq('id', id);
    return this.read();
  }
}
