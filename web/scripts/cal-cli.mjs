#!/usr/bin/env node
// /cal skill의 단일 진입점.
// JSON 파일 모드 / Supabase 모드를 env(TIMELINE_STORE)로 자동 분기.
// 명령 단위로 호출, --dry-run 지원, stdout에 JSON 결과 1줄.
//
// 사용:
//   node --env-file=.env.development.local scripts/cal-cli.mjs <cmd> [json-payload] [--dry-run]
//
// 명령:
//   read                                     → 전체 TimelineData JSON 출력
//   event-add      <json>                    이벤트 추가
//   event-update   <id> <json>               이벤트 변경
//   event-cancel   <id> [reason]             상태 cancelled (이력 보존)
//   event-remove   <id>                      완전 삭제
//   asset-add      <json>                    재사용 자산 추가
//   asset-remove   <id>
//   task-add       <json>                    sub-task 추가 (eventId 있으면 due 자동 default = event date - 3일)
//   task-update    <id> <json>
//   task-done      <id> [doneBy]
//   task-undone    <id>
//   task-remove    <id>
//   task-list      [filter-json]             {eventId?, assignee?, doneOnly?, openOnly?}
//   set-banner     <json|null>
//
// JSON payload는 TimelineEvent / SubTask / ReusableAsset 스키마.

import fs from 'node:fs';
import path from 'node:path';

const [, , cmd, ...rest] = process.argv;
const dryRun = process.argv.includes('--dry-run');
const args = rest.filter(a => a !== '--dry-run');

function out(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}
function fail(msg, extra = {}) {
  out({ ok: false, error: msg, ...extra });
  process.exit(1);
}

function parseJson(s, label) {
  try { return JSON.parse(s); }
  catch (e) { fail(`Invalid JSON for ${label}: ${e.message}`); }
}

// ─── Storage adapters ─────────────────────────────────────
const MODE = process.env.TIMELINE_STORE === 'supabase' ? 'supabase' : 'json';

const JSON_PATHS = [
  path.join(process.cwd(), 'data', 'project-timeline.json'),
  path.join(process.cwd(), 'web', 'data', 'project-timeline.json'),
  path.join(process.cwd(), '..', 'data', 'project-timeline.json'),
];

function resolveJsonPath() {
  for (const p of JSON_PATHS) if (fs.existsSync(p)) return p;
  return JSON_PATHS[0];
}

function jsonRead() {
  try { return JSON.parse(fs.readFileSync(resolveJsonPath(), 'utf-8')); }
  catch { return { version: 1, updatedAt: '', lanes: {}, events: [], reusableAssets: [], tasks: [], taskLog: [] }; }
}
function jsonWrite(data) {
  const next = { ...data, updatedAt: new Date().toISOString() };
  const filePath = resolveJsonPath();
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2) + '\n', 'utf-8');
  fs.renameSync(tmp, filePath);
  return next;
}

async function supa() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) fail('Supabase 모드인데 env 미설정 (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── helpers ───────────────────────────────────────────────
function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function appendLog(data, entry) {
  data.taskLog = [
    ...(data.taskLog ?? []),
    { id: newId('log'), createdAt: new Date().toISOString(), ...entry },
  ];
}

function subtractDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d - n));
  return t.toISOString().slice(0, 10);
}

function applyDueDefault(task, events) {
  if (task.dueDate || !task.eventId) return task;
  const ev = events.find(e => e.id === task.eventId);
  if (!ev) return task;
  if (ev.date?.kind === 'date' && ev.date.iso) {
    return { ...task, dueDate: subtractDays(ev.date.iso, 3) };
  }
  return task;
}

// ─── Command handlers (JSON mode) ─────────────────────────
async function handleJson() {
  const data = jsonRead();

  switch (cmd) {
    case 'read':
      out(data);
      return;

    case 'event-add': {
      const ev = parseJson(args[0] ?? '', 'event');
      if (!ev?.id || !ev?.title || !ev?.lane) fail('event needs {id,lane,title,date,status}');
      if (data.events.some(e => e.id === ev.id)) {
        out({ ok: false, error: `event ${ev.id} already exists` });
        return;
      }
      const next = { ...data, events: [...data.events, ev] };
      if (!dryRun) jsonWrite(next);
      out({ ok: true, mode: MODE, dryRun, action: 'event-add', event: ev });
      return;
    }

    case 'event-update': {
      const id = args[0];
      const patch = parseJson(args[1] ?? '{}', 'patch');
      const idx = data.events.findIndex(e => e.id === id);
      if (idx < 0) fail(`event ${id} not found`);
      const before = data.events[idx];
      const after = { ...before, ...patch, id };
      const events = [...data.events];
      events[idx] = after;
      if (!dryRun) jsonWrite({ ...data, events });
      out({ ok: true, mode: MODE, dryRun, action: 'event-update', before, after });
      return;
    }

    case 'event-cancel': {
      const id = args[0];
      const reason = args[1];
      const idx = data.events.findIndex(e => e.id === id);
      if (idx < 0) fail(`event ${id} not found`);
      const after = {
        ...data.events[idx],
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelReason: reason ?? undefined,
      };
      const events = [...data.events];
      events[idx] = after;
      if (!dryRun) jsonWrite({ ...data, events });
      out({ ok: true, mode: MODE, dryRun, action: 'event-cancel', after });
      return;
    }

    case 'event-remove': {
      const id = args[0];
      const before = data.events.find(e => e.id === id);
      if (!before) fail(`event ${id} not found`);
      if (!dryRun) jsonWrite({ ...data, events: data.events.filter(e => e.id !== id) });
      out({ ok: true, mode: MODE, dryRun, action: 'event-remove', removed: before });
      return;
    }

    case 'task-add': {
      const t = parseJson(args[0] ?? '', 'task');
      if (!t?.title) fail('task needs {title, assignees, eventId?, dueDate?, priority?}');
      const fullTask = applyDueDefault(
        {
          id: t.id ?? newId('t'),
          eventId: t.eventId,
          title: t.title,
          assignees: t.assignees ?? [],
          reporter: t.reporter,
          dueDate: t.dueDate,
          priority: t.priority ?? 'med',
          done: false,
          sourceExcerpt: t.sourceExcerpt,
          createdAt: new Date().toISOString(),
        },
        data.events,
      );
      const next = { ...data, tasks: [...(data.tasks ?? []), fullTask] };
      appendLog(next, {
        taskId: fullTask.id,
        actor: fullTask.reporter ?? 'cli',
        action: 'created',
        after: fullTask,
      });
      if (!dryRun) jsonWrite(next);
      out({ ok: true, mode: MODE, dryRun, action: 'task-add', task: fullTask });
      return;
    }

    case 'task-done':
    case 'task-undone': {
      const id = args[0];
      const doneBy = args[1] ?? 'cli';
      const idx = (data.tasks ?? []).findIndex(t => t.id === id);
      if (idx < 0) fail(`task ${id} not found`);
      const before = data.tasks[idx];
      const nowDone = cmd === 'task-done';
      const after = {
        ...before,
        done: nowDone,
        doneAt: nowDone ? new Date().toISOString() : undefined,
        doneBy: nowDone ? doneBy : undefined,
      };
      const tasks = [...data.tasks];
      tasks[idx] = after;
      const next = { ...data, tasks };
      appendLog(next, {
        taskId: id,
        actor: doneBy,
        action: nowDone ? 'done:true' : 'done:false',
        before: { done: before.done },
        after: { done: nowDone },
      });
      if (!dryRun) jsonWrite(next);
      out({ ok: true, mode: MODE, dryRun, action: cmd, task: after });
      return;
    }

    case 'task-remove': {
      const id = args[0];
      const before = (data.tasks ?? []).find(t => t.id === id);
      if (!before) fail(`task ${id} not found`);
      const next = { ...data, tasks: (data.tasks ?? []).filter(t => t.id !== id) };
      appendLog(next, {
        taskId: id,
        actor: before.reporter ?? 'cli',
        action: 'removed',
        before,
      });
      if (!dryRun) jsonWrite(next);
      out({ ok: true, mode: MODE, dryRun, action: 'task-remove', removed: before });
      return;
    }

    case 'task-list': {
      const f = args[0] ? parseJson(args[0], 'filter') : {};
      let list = data.tasks ?? [];
      if (f.eventId) list = list.filter(t => t.eventId === f.eventId);
      if (f.assignee) list = list.filter(t => t.assignees?.includes(f.assignee));
      if (f.openOnly) list = list.filter(t => !t.done);
      if (f.doneOnly) list = list.filter(t => t.done);
      out({ ok: true, mode: MODE, count: list.length, tasks: list });
      return;
    }

    default:
      fail(`unknown command: ${cmd}`);
  }
}

// ─── Supabase mode dispatcher ──────────────────────────────
async function handleSupabase() {
  const s = await supa();
  // Minimal supabase passthrough — JSON 모드와 같은 인터페이스
  switch (cmd) {
    case 'read': {
      const [e, t, a, m] = await Promise.all([
        s.from('timeline_events').select('*'),
        s.from('timeline_tasks').select('*'),
        s.from('timeline_reusable_assets').select('*'),
        s.from('timeline_meta').select('*').eq('id', 'singleton').single(),
      ]);
      out({
        ok: true,
        mode: MODE,
        events: e.data ?? [],
        tasks: t.data ?? [],
        reusableAssets: a.data ?? [],
        meta: m.data ?? null,
      });
      return;
    }
    case 'task-add': {
      const t = parseJson(args[0] ?? '', 'task');
      if (!t?.title) fail('task needs {title}');
      if (dryRun) { out({ ok: true, mode: MODE, dryRun, task: t }); return; }
      const row = {
        id: t.id ?? newId('t'),
        event_id: t.eventId ?? null,
        title: t.title,
        assignees: t.assignees ?? [],
        reporter: t.reporter ?? null,
        due_date: t.dueDate ?? null,
        priority: t.priority ?? 'med',
        done: false,
        source_excerpt: t.sourceExcerpt ?? null,
      };
      const { error } = await s.from('timeline_tasks').upsert(row);
      if (error) fail(error.message);
      await s.from('timeline_task_log').insert({
        task_id: row.id, actor: row.reporter, action: 'created', after_value: row,
      });
      out({ ok: true, mode: MODE, action: 'task-add', task: row });
      return;
    }
    case 'task-done':
    case 'task-undone': {
      const id = args[0];
      const doneBy = args[1] ?? 'cli';
      const nowDone = cmd === 'task-done';
      const update = {
        done: nowDone,
        done_at: nowDone ? new Date().toISOString() : null,
        done_by: nowDone ? doneBy : null,
      };
      if (dryRun) { out({ ok: true, mode: MODE, dryRun, update }); return; }
      const { error } = await s.from('timeline_tasks').update(update).eq('id', id);
      if (error) fail(error.message);
      await s.from('timeline_task_log').insert({
        task_id: id, actor: doneBy, action: nowDone ? 'done:true' : 'done:false', after_value: update,
      });
      out({ ok: true, mode: MODE, action: cmd, taskId: id });
      return;
    }
    case 'task-remove': {
      const id = args[0];
      if (dryRun) { out({ ok: true, mode: MODE, dryRun, removedId: id }); return; }
      await s.from('timeline_task_log').insert({ task_id: id, actor: 'cli', action: 'removed' });
      const { error } = await s.from('timeline_tasks').delete().eq('id', id);
      if (error) fail(error.message);
      out({ ok: true, mode: MODE, action: 'task-remove', removedId: id });
      return;
    }
    case 'task-list': {
      const f = args[0] ? parseJson(args[0], 'filter') : {};
      let q = s.from('timeline_tasks').select('*');
      if (f.eventId) q = q.eq('event_id', f.eventId);
      if (f.assignee) q = q.contains('assignees', [f.assignee]);
      if (f.openOnly) q = q.eq('done', false);
      if (f.doneOnly) q = q.eq('done', true);
      const { data: rows, error } = await q;
      if (error) fail(error.message);
      out({ ok: true, mode: MODE, count: rows.length, tasks: rows });
      return;
    }
    default:
      fail(`supabase mode: ${cmd} not implemented yet`);
  }
}

if (!cmd) {
  out({
    ok: false,
    error: 'usage: cal-cli.mjs <cmd> [args] [--dry-run]',
    cmds: [
      'read', 'event-add', 'event-update', 'event-cancel', 'event-remove',
      'task-add', 'task-update', 'task-done', 'task-undone', 'task-remove', 'task-list',
    ],
  });
  process.exit(1);
}

(MODE === 'supabase' ? handleSupabase : handleJson)().catch(e => fail(e.message));
