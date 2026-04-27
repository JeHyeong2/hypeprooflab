#!/usr/bin/env tsx
/**
 * Verify that DB content matches markdown source.
 *
 * For each .md file under src/content/, fetch the corresponding row from
 * Supabase and compare. Body must be byte-identical; key frontmatter fields
 * must match. Reports first failures with diffs and exits non-zero if any.
 *
 * Usage (from web/):
 *   npm run db:verify
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_KEY) {
  console.error('FATAL: SUPABASE_SERVICE_ROLE_KEY not set. For local: source .env.test');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ROOT = path.resolve(__dirname, '..', 'src', 'content');
const MAX_FAILURES_TO_PRINT = 10;

type Diff = { file: string; reason: string; details?: string };

function listMd(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => path.join(dir, f));
}

function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function bodyDiffSummary(fileBody: string, dbBody: string): string {
  if (fileBody === dbBody) return '';
  const fileLen = fileBody.length;
  const dbLen = dbBody.length;
  let firstDiffIndex = -1;
  const max = Math.min(fileLen, dbLen);
  for (let i = 0; i < max; i++) {
    if (fileBody[i] !== dbBody[i]) { firstDiffIndex = i; break; }
  }
  if (firstDiffIndex === -1) firstDiffIndex = max;
  const ctx = 40;
  const start = Math.max(0, firstDiffIndex - ctx);
  return `body length: file=${fileLen} db=${dbLen}; first diff at char ${firstDiffIndex}\n` +
         `  file: …${JSON.stringify(fileBody.slice(start, firstDiffIndex + ctx))}\n` +
         `  db:   …${JSON.stringify(dbBody.slice(start, firstDiffIndex + ctx))}`;
}

async function verifyArticles(): Promise<Diff[]> {
  const diffs: Diff[] = [];
  for (const locale of ['ko', 'en']) {
    const dir = path.join(ROOT, 'columns', locale);
    for (const file of listMd(dir)) {
      const rel = path.relative(ROOT, file);
      const raw = fs.readFileSync(file, 'utf-8');
      const { data: fm, content } = matter(raw);
      const slug = fm.slug || path.basename(file, '.md');

      const { data, error } = await supabase
        .from('articles').select('*').eq('slug', slug).eq('locale', locale).maybeSingle();
      if (error) { diffs.push({ file: rel, reason: 'query_error', details: error.message }); continue; }
      if (!data) { diffs.push({ file: rel, reason: 'missing_in_db' }); continue; }

      if (data.title !== fm.title) diffs.push({ file: rel, reason: 'title_mismatch', details: `file=${fm.title} db=${data.title}` });
      if (data.body !== content.trim()) diffs.push({ file: rel, reason: 'body_mismatch', details: bodyDiffSummary(content.trim(), data.body) });
      if (!arraysEqual(data.tags || [], Array.isArray(fm.tags) ? fm.tags : [])) {
        diffs.push({ file: rel, reason: 'tags_mismatch', details: `file=${JSON.stringify(fm.tags)} db=${JSON.stringify(data.tags)}` });
      }
      if (fm.citations && !jsonEqual(data.citations, fm.citations)) {
        diffs.push({ file: rel, reason: 'citations_mismatch' });
      }
    }
  }
  return diffs;
}

async function verifyNovels(): Promise<Diff[]> {
  const diffs: Diff[] = [];
  const dir = path.join(ROOT, 'novels', 'ko');
  for (const file of listMd(dir)) {
    const rel = path.relative(ROOT, file);
    const raw = fs.readFileSync(file, 'utf-8');
    const { data: fm, content } = matter(raw);
    const slug = fm.slug || path.basename(file, '.md');

    const { data, error } = await supabase.from('novels').select('*').eq('slug', slug).maybeSingle();
    if (error) { diffs.push({ file: rel, reason: 'query_error', details: error.message }); continue; }
    if (!data) { diffs.push({ file: rel, reason: 'missing_in_db' }); continue; }

    if (data.title !== fm.title) diffs.push({ file: rel, reason: 'title_mismatch' });
    if (data.body !== content.trim()) diffs.push({ file: rel, reason: 'body_mismatch', details: bodyDiffSummary(content.trim(), data.body) });
    if (data.series !== fm.series) diffs.push({ file: rel, reason: 'series_mismatch', details: `file=${fm.series} db=${data.series}` });
    if (data.chapter !== fm.chapter) diffs.push({ file: rel, reason: 'chapter_mismatch', details: `file=${fm.chapter} db=${data.chapter}` });
  }
  return diffs;
}

async function verifyResearch(): Promise<Diff[]> {
  const diffs: Diff[] = [];
  for (const locale of ['ko', 'en']) {
    const dir = path.join(ROOT, 'research', locale);
    for (const file of listMd(dir)) {
      const rel = path.relative(ROOT, file);
      const raw = fs.readFileSync(file, 'utf-8');
      const { data: fm, content } = matter(raw);
      const slug = fm.slug || path.basename(file, '.md');

      const { data, error } = await supabase
        .from('research_posts').select('*').eq('slug', slug).eq('locale', locale).maybeSingle();
      if (error) { diffs.push({ file: rel, reason: 'query_error', details: error.message }); continue; }
      if (!data) { diffs.push({ file: rel, reason: 'missing_in_db' }); continue; }

      if (data.title !== fm.title) diffs.push({ file: rel, reason: 'title_mismatch' });
      if (data.body !== content.trim()) diffs.push({ file: rel, reason: 'body_mismatch', details: bodyDiffSummary(content.trim(), data.body) });
    }
  }
  return diffs;
}

(async () => {
  console.log(`Verifying against ${SUPABASE_URL}`);
  const [articles, novels, research] = await Promise.all([
    verifyArticles(), verifyNovels(), verifyResearch(),
  ]);

  const all = [
    ['articles', articles] as const,
    ['novels', novels] as const,
    ['research_posts', research] as const,
  ];

  let total = 0;
  for (const [name, diffs] of all) {
    console.log(`  ${name.padEnd(16)} diffs=${diffs.length}`);
    for (const d of diffs.slice(0, MAX_FAILURES_TO_PRINT)) {
      console.log(`    ✗ ${d.file} — ${d.reason}${d.details ? '\n      ' + d.details.split('\n').join('\n      ') : ''}`);
    }
    if (diffs.length > MAX_FAILURES_TO_PRINT) {
      console.log(`    … and ${diffs.length - MAX_FAILURES_TO_PRINT} more`);
    }
    total += diffs.length;
  }

  if (total > 0) {
    console.error(`\nVerification FAILED — ${total} discrepancies.`);
    process.exit(1);
  }
  console.log('\nVerification PASSED — markdown and DB are in sync.');
})();
