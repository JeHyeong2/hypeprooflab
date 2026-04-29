import type { Metadata } from 'next';
import path from 'path';
import fs from 'fs';
import DashboardClient from './DashboardClient';
import type { MembersData } from './types';
import type { TimelineData, Holiday } from '@/lib/timeline/types';
import { getKoreanHolidays } from '@/lib/timeline/holidays.server';
import { listNotes } from '@/lib/sheets/notes';
import { isSheetsConfigured } from '@/lib/sheets/client';

export const metadata: Metadata = {
  title: 'Dashboard | HypeProof AI',
  description: 'HypeProof Lab internal dashboard',
  robots: { index: false, follow: false },
};

export const revalidate = 300;

function loadJsonFromDataDir<T>(filename: string, fallback: T): T {
  const paths = [
    // primary: web/data/ (bundled by Next.js outputFileTracing automatically)
    path.join(process.cwd(), 'data', filename),
    // skill cwd at repo root → hypeprooflab/web/data/
    path.join(process.cwd(), 'web', 'data', filename),
    // backward compat: legacy ../data layout (e.g. members.json still there)
    path.join(process.cwd(), '..', 'data', filename),
  ];
  for (const p of paths) {
    try {
      const raw = fs.readFileSync(p, 'utf-8');
      return JSON.parse(raw) as T;
    } catch {
      // try next path
    }
  }
  return fallback;
}

function loadMembers(): MembersData {
  return loadJsonFromDataDir<MembersData>('members.json', {
    version: 1,
    updatedAt: '',
    members: [],
  });
}

function loadTimeline(): TimelineData {
  return loadJsonFromDataDir<TimelineData>('project-timeline.json', {
    version: 1,
    updatedAt: '',
    lanes: {
      direct: { label: 'HypeProof Direct', color: '#a78bfa' },
      channel: { label: 'Filamentree Channel', color: '#34d399' },
      reusable: { label: 'Reusable Asset Layer', color: '#94a3b8' },
    },
    events: [],
    reusableAssets: [],
  });
}

export default async function DashboardPage() {
  const members = loadMembers();
  const timeline = loadTimeline();
  const currentYear = new Date().getFullYear();
  const holidays: Holiday[] = [
    ...getKoreanHolidays(currentYear),
    ...getKoreanHolidays(currentYear + 1),
  ];
  const sheetsReady = isSheetsConfigured();
  const notes = sheetsReady ? await listNotes() : [];
  return (
    <DashboardClient
      members={members.members}
      updatedAt={members.updatedAt}
      timeline={timeline}
      holidays={holidays}
      notes={notes}
      sheetsReady={sheetsReady}
    />
  );
}
