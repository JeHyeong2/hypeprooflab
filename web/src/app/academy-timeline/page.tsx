import type { Metadata } from 'next';
import path from 'path';
import fs from 'fs';
import AcademyTimelineClient from './AcademyTimelineClient';
import type { TimelineData } from './types';

export const metadata: Metadata = {
  title: 'Academy Timeline | HypeProof AI',
  description: 'Academy launch timeline — internal only',
  robots: { index: false, follow: false },
};

export const revalidate = 60;

function loadTimeline(): TimelineData {
  const paths = [
    path.join(process.cwd(), '..', 'data', 'academy-timeline.json'),
    path.join(process.cwd(), 'data', 'academy-timeline.json'),
  ];
  for (const p of paths) {
    try {
      const raw = fs.readFileSync(p, 'utf-8');
      return JSON.parse(raw) as TimelineData;
    } catch {
      // try next path
    }
  }
  return { version: 1, updatedAt: '', title: '', subtitle: '', dday: '', milestones: [], members: [], tasks: [], decisions: {}, weeks: [] };
}

export default function AcademyTimelinePage() {
  const data = loadTimeline();
  return <AcademyTimelineClient data={data} />;
}
