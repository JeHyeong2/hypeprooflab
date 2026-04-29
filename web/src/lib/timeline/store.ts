import path from 'path';
import fs from 'fs';
import type { TimelineData, TimelineEvent, ReusableAsset, PriorityBanner } from './types';

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
}

const EMPTY: TimelineData = {
  version: 1,
  updatedAt: '',
  lanes: {
    direct: { label: 'HypeProof Direct', color: '#a78bfa' },
    channel: { label: 'Filamentree Channel', color: '#34d399' },
    reusable: { label: 'Reusable Asset Layer', color: '#94a3b8' },
  },
  events: [],
  reusableAssets: [],
};

export function resolveTimelinePath(): string {
  const candidates = [
    path.join(process.cwd(), '..', 'data', 'project-timeline.json'),
    path.join(process.cwd(), 'data', 'project-timeline.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
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
}

let _store: TimelineStore | null = null;

export function defaultStore(): TimelineStore {
  if (!_store) _store = new JsonFileStore();
  return _store;
}

export function setDefaultStore(store: TimelineStore): void {
  _store = store;
}
