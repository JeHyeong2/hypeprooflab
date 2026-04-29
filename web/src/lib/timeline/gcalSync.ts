import type { TimelineData, TimelineEvent, SyncResult, FuzzyDate } from './types';
import { defaultStore } from './store';
import { fuzzyDateToGcalRange, gcalEventToFuzzyDate } from './dateUtil';

/**
 * Google Calendar two-way sync.
 *
 * Implementation note: Google Calendar CRUD is performed by the Claude
 * Calendar MCP server (mcp__claude_ai_Google_Calendar__*). The web runtime
 * cannot call those MCP tools directly. So this module exposes pure helpers
 * (eventToGcalPayload, applyGcalPatch, mergePulledEvents) used by:
 *   - the /cal skill (Claude Code → MCP) for push and pull side-effects
 *   - the syncTimeline server action, which delegates the actual gcal call
 *     to the skill or returns `needsAuth` when no integration is wired up.
 */

export interface GcalEventPayload {
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  status?: 'confirmed' | 'cancelled';
}

export function eventToGcalPayload(
  ev: TimelineEvent,
  laneLabel: string,
): GcalEventPayload | null {
  const range = fuzzyDateToGcalRange(ev.date);
  if (!range) return null;
  const summary = `${range.prefix ? range.prefix + ' ' : ''}[${laneLabel}] ${ev.title}`;
  const descParts: string[] = [];
  if (ev.subtitle) descParts.push(ev.subtitle);
  if (ev.owner) descParts.push(`담당: ${ev.owner}`);
  if (ev.contacts?.length) descParts.push(`연락처: ${ev.contacts.join(', ')}`);
  if (ev.notes?.length) descParts.push('메모:\n' + ev.notes.map(n => `- ${n}`).join('\n'));
  return {
    summary,
    description: descParts.join('\n\n') || undefined,
    start: range.start,
    end: range.end,
    status: ev.status === 'cancelled' ? 'cancelled' : 'confirmed',
  };
}

export interface GcalEventLite {
  id: string;
  summary?: string;
  description?: string;
  status?: string;
  updated?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

export function mergePulledEvents(
  data: TimelineData,
  pulled: GcalEventLite[],
): { next: TimelineData; result: SyncResult } {
  let imported = 0;
  let conflicts = 0;
  const events = [...data.events];
  const localByGcal = new Map(
    events
      .map((ev, idx) => [ev.externalIds?.gcal, idx] as [string | undefined, number])
      .filter(([k]) => !!k) as [string, number][],
  );

  for (const g of pulled) {
    const idx = localByGcal.get(g.id);
    if (idx !== undefined) {
      const local = events[idx];
      if (g.status === 'cancelled' && local.status !== 'cancelled') {
        events[idx] = {
          ...local,
          status: 'cancelled',
          cancelledAt: g.updated ?? new Date().toISOString(),
          cancelReason: 'Google Calendar에서 삭제됨',
        };
        imported++;
        continue;
      }
      const fuzzy = gcalEventToFuzzyDate(g.start);
      const newTitle = stripLanePrefix(g.summary ?? local.title);
      let changed = false;
      const patch: Partial<TimelineEvent> = {};
      if (newTitle && newTitle !== local.title) {
        patch.title = newTitle;
        changed = true;
      }
      if (fuzzy && JSON.stringify(fuzzy) !== JSON.stringify(local.date)) {
        patch.date = fuzzy;
        changed = true;
      }
      if (changed) {
        events[idx] = { ...local, ...patch };
        imported++;
      }
    } else {
      if (g.status === 'cancelled') continue;
      const fuzzy: FuzzyDate = gcalEventToFuzzyDate(g.start) ?? { kind: 'ongoing' };
      events.push({
        id: `gcal-${g.id}`,
        lane: 'channel',
        title: stripLanePrefix(g.summary ?? '(제목 없음)'),
        date: fuzzy,
        status: 'planned',
        notes: g.description ? [g.description] : undefined,
        externalIds: { gcal: g.id },
        needsClassification: true,
      });
      imported++;
    }
  }

  const next: TimelineData = {
    ...data,
    events,
    gcal: { ...(data.gcal ?? {}), lastSyncAt: new Date().toISOString() },
  };
  return { next, result: { imported, pushed: 0, conflicts } };
}

function stripLanePrefix(summary: string): string {
  return summary
    .replace(/^\(월간 미정\)\s*/, '')
    .replace(/^\(분기 후속\)\s*/, '')
    .replace(/^\[[^\]]+\]\s*/, '')
    .trim();
}

/**
 * Server-side reconcile entry point. Pulls latest from gcal, merges into
 * local store, and returns the resulting state.
 *
 * This is a placeholder: the actual MCP tool invocation must be performed by
 * the Claude Code agent (skill) which has access to mcp__claude_ai_Google_Calendar__*.
 * When called from the web server (syncTimeline action), no pulled events
 * are available — we return needsAuth=true if integration is missing.
 */
export async function reconcile(opts?: {
  pulledEvents?: GcalEventLite[];
}): Promise<SyncResult & { data: TimelineData }> {
  const store = defaultStore();
  const data = await store.read();
  if (!opts?.pulledEvents) {
    return {
      imported: 0,
      pushed: 0,
      conflicts: 0,
      needsAuth: !data.gcal?.calendarId,
      message: data.gcal?.calendarId
        ? 'Google Calendar 동기화는 /cal 스킬에서 실행해주세요.'
        : 'Google Calendar 인증이 필요합니다. /cal sync 또는 "캘린더 동기화"라고 말해주세요.',
      data,
    };
  }
  const { next, result } = mergePulledEvents(data, opts.pulledEvents);
  await store.write(next);
  return { ...result, data: next };
}
