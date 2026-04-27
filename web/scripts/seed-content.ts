#!/usr/bin/env tsx
/**
 * Seed Supabase content tables from markdown files.
 *
 * Usage (from web/):
 *   npm run db:seed                 # seed local Supabase
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... tsx scripts/seed-content.ts  # any target
 *
 * Idempotent — uses upsert by (slug, locale) so re-running is safe.
 *
 * Source: src/content/{columns,novels,research}/{ko,en}/*.md
 * Targets: articles, novels, research_posts (defined in supabase/migrations/003_content.sql)
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

type Result = { table: string; ok: number; fail: number; errors: string[] };

function listMd(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => path.join(dir, f));
}

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') return [v];
  return [];
}

function asJsonOrNull(v: unknown): unknown {
  if (v === undefined || v === null || v === '') return null;
  return v;
}

async function seedArticles(): Promise<Result> {
  const result: Result = { table: 'articles', ok: 0, fail: 0, errors: [] };
  for (const locale of ['ko', 'en']) {
    const dir = path.join(ROOT, 'columns', locale);
    for (const file of listMd(dir)) {
      try {
        const raw = fs.readFileSync(file, 'utf-8');
        const { data: fm, content } = matter(raw);
        const slug = fm.slug || path.basename(file, '.md');

        const row = {
          slug,
          locale,
          title: fm.title,
          creator: fm.creator || 'Unknown',
          creator_image: fm.creatorImage || null,
          date: fm.date,
          updated: fm.updated || null,
          category: fm.category || null,
          tags: asArray(fm.tags),
          read_time: fm.readTime || null,
          excerpt: fm.excerpt || null,
          citations: asJsonOrNull(fm.citations),
          references_list: asJsonOrNull(fm.references),
          author_type: fm.authorType || null,
          body: content.trim(),
          status: fm.status || 'published',
          published_at: fm.date ? new Date(fm.date).toISOString() : null,
        };

        const { error } = await supabase.from('articles').upsert(row, { onConflict: 'slug,locale' });
        if (error) throw error;
        result.ok++;
      } catch (e) {
        result.fail++;
        result.errors.push(`${path.relative(ROOT, file)}: ${(e as Error).message}`);
      }
    }
  }
  return result;
}

async function seedNovels(): Promise<Result> {
  const result: Result = { table: 'novels', ok: 0, fail: 0, errors: [] };
  const dir = path.join(ROOT, 'novels', 'ko');
  for (const file of listMd(dir)) {
    try {
      const raw = fs.readFileSync(file, 'utf-8');
      const { data: fm, content } = matter(raw);
      const slug = fm.slug || path.basename(file, '.md');

      const row = {
        slug,
        title: fm.title,
        series: fm.series || 'UNKNOWN',
        volume: typeof fm.volume === 'number' ? fm.volume : null,
        chapter: typeof fm.chapter === 'number' ? fm.chapter : null,
        author: fm.author || 'Unknown',
        author_human: fm.authorHuman || null,
        author_image: fm.authorImage || null,
        ai_model: fm.aiModel || null,
        date: fm.date || null,
        category: fm.category || null,
        tags: asArray(fm.tags),
        read_time: fm.readTime || null,
        excerpt: fm.excerpt || null,
        body: content.trim(),
        status: fm.status || 'published',
      };

      const { error } = await supabase.from('novels').upsert(row, { onConflict: 'slug' });
      if (error) throw error;
      result.ok++;
    } catch (e) {
      result.fail++;
      result.errors.push(`${path.relative(ROOT, file)}: ${(e as Error).message}`);
    }
  }
  return result;
}

async function seedResearch(): Promise<Result> {
  const result: Result = { table: 'research_posts', ok: 0, fail: 0, errors: [] };
  for (const locale of ['ko', 'en']) {
    const dir = path.join(ROOT, 'research', locale);
    for (const file of listMd(dir)) {
      try {
        const raw = fs.readFileSync(file, 'utf-8');
        const { data: fm, content } = matter(raw);
        const slug = fm.slug || path.basename(file, '.md');

        const row = {
          slug,
          locale,
          title: fm.title,
          creator: fm.creator || null,
          creator_image: fm.creatorImage || null,
          date: fm.date,
          tags: asArray(fm.tags),
          excerpt: fm.excerpt || null,
          body: content.trim(),
          status: fm.status || 'published',
        };

        const { error } = await supabase.from('research_posts').upsert(row, { onConflict: 'slug,locale' });
        if (error) throw error;
        result.ok++;
      } catch (e) {
        result.fail++;
        result.errors.push(`${path.relative(ROOT, file)}: ${(e as Error).message}`);
      }
    }
  }
  return result;
}

(async () => {
  console.log(`Seeding to ${SUPABASE_URL}`);
  const results = [await seedArticles(), await seedNovels(), await seedResearch()];

  let totalFail = 0;
  for (const r of results) {
    console.log(`  ${r.table.padEnd(16)} ok=${r.ok} fail=${r.fail}`);
    if (r.fail > 0) {
      for (const err of r.errors.slice(0, 5)) console.log(`    ✗ ${err}`);
      if (r.errors.length > 5) console.log(`    … and ${r.errors.length - 5} more`);
      totalFail += r.fail;
    }
  }

  if (totalFail > 0) {
    console.error(`\nSeed completed with ${totalFail} failure(s).`);
    process.exit(1);
  }
  console.log('\nSeed completed successfully.');
})();
