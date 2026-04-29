import type { Holiday } from './types';

export function isHoliday(iso: string, holidays: Holiday[]): Holiday | null {
  return holidays.find(h => h.date === iso) ?? null;
}

export function isWeekend(iso: string): 'sat' | 'sun' | null {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (dow === 0) return 'sun';
  if (dow === 6) return 'sat';
  return null;
}

export function getHolidaysInMonth(year: number, month: number, holidays: Holiday[]): Holiday[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  return holidays.filter(h => h.date.startsWith(prefix));
}
