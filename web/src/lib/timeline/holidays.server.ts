import 'server-only';
import path from 'path';
import fs from 'fs';
import type { Holiday, HolidayData } from './types';

function resolveHolidayPath(year: number): string | null {
  const candidates = [
    path.join(process.cwd(), '..', 'data', `kr-holidays-${year}.json`),
    path.join(process.cwd(), 'data', `kr-holidays-${year}.json`),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const cache = new Map<number, Holiday[]>();

export function getKoreanHolidays(year: number): Holiday[] {
  if (cache.has(year)) return cache.get(year)!;
  const filePath = resolveHolidayPath(year);
  if (!filePath) {
    cache.set(year, []);
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw) as HolidayData;
    const list = data.holidays ?? [];
    cache.set(year, list);
    return list;
  } catch {
    cache.set(year, []);
    return [];
  }
}
