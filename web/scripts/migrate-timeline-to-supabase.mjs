#!/usr/bin/env node
// Migrate web/data/project-timeline.json → Supabase timeline_* tables.
// Idempotent: re-running is safe (upsert).
//
// Usage:
//   cd web && node --env-file=.env.development.local scripts/migrate-timeline-to-supabase.mjs
//
// Prereqs:
//   - Supabase project + migrations 003_timeline.sql / 004_timeline_rls.sql applied
//   - env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('✗ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}
const supa = createClient(url, key, { auth: { persistSession: false } });

const file = path.join(process.cwd(), 'data', 'project-timeline.json');
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

function eventToRow(e) {
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
    date_iso: null,
    date_year: null,
    date_month: null,
    date_quarter: null,
    date_part_of_day: null,
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

function taskToRow(t) {
  return {
    id: t.id,
    event_id: t.eventId ?? null,
    title: t.title,
    assignees: t.assignees ?? [],
    reporter: t.reporter ?? null,
    due_date: t.dueDate ?? null,
    priority: t.priority ?? 'med',
    done: !!t.done,
    done_at: t.doneAt ?? null,
    done_by: t.doneBy ?? null,
    source_excerpt: t.sourceExcerpt ?? null,
    created_at: t.createdAt ?? new Date().toISOString(),
  };
}

async function go() {
  // 1) meta (lanes, priority banner, gcal)
  const { error: metaErr } = await supa.from('timeline_meta').upsert({
    id: 'singleton',
    lanes: data.lanes,
    priority_banner: data.priorityBanner ?? null,
    gcal: data.gcal ?? null,
  });
  if (metaErr) throw metaErr;
  console.log('✓ meta');

  // 2) events
  if (data.events?.length) {
    const rows = data.events.map(eventToRow);
    const { error } = await supa.from('timeline_events').upsert(rows);
    if (error) throw error;
    console.log(`✓ events: ${rows.length}`);
  }

  // 3) reusable assets
  if (data.reusableAssets?.length) {
    const rows = data.reusableAssets.map(a => ({
      id: a.id,
      title: a.title,
      subtitle: a.subtitle ?? null,
      status: a.status,
      owned_by: a.ownedBy ?? null,
    }));
    const { error } = await supa.from('timeline_reusable_assets').upsert(rows);
    if (error) throw error;
    console.log(`✓ reusable assets: ${rows.length}`);
  }

  // 4) sub-tasks (may be absent in legacy JSON)
  if (data.tasks?.length) {
    const rows = data.tasks.map(taskToRow);
    const { error } = await supa.from('timeline_tasks').upsert(rows);
    if (error) throw error;
    console.log(`✓ tasks: ${rows.length}`);
  }

  console.log('\nMigration complete. Set TIMELINE_STORE=supabase in .env to flip the store.');
}

go().catch(err => {
  console.error('✗ Migration failed:', err);
  process.exit(1);
});
