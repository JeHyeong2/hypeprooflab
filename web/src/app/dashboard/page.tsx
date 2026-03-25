import type { Metadata } from 'next';
import path from 'path';
import fs from 'fs';
import DashboardClient from './DashboardClient';
import type { MembersData } from './types';

export const metadata: Metadata = {
  title: 'Dashboard | HypeProof AI',
  description: 'HypeProof Lab internal dashboard',
  robots: { index: false, follow: false },
};

export const revalidate = 300;

function loadMembers(): MembersData {
  // Try project root data/ (one level up from web/)
  const paths = [
    path.join(process.cwd(), '..', 'data', 'members.json'),
    path.join(process.cwd(), 'data', 'members.json'),
  ];
  for (const p of paths) {
    try {
      const raw = fs.readFileSync(p, 'utf-8');
      return JSON.parse(raw) as MembersData;
    } catch {
      // try next path
    }
  }
  return { version: 1, updatedAt: '', members: [] };
}

export default function DashboardPage() {
  const data = loadMembers();
  return <DashboardClient members={data.members} updatedAt={data.updatedAt} />;
}
