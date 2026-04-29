import type { FuzzyDate } from './types';

export function fuzzyDateToSortKey(d: FuzzyDate): string {
  switch (d.kind) {
    case 'date':
      return `${d.iso}-${d.partOfDay === 'AM' ? '0' : d.partOfDay === 'PM' ? '1' : '2'}`;
    case 'month':
      return `${d.year}-${String(d.month).padStart(2, '0')}-99`;
    case 'quarter':
      return `${d.year}-${String(d.quarter * 3).padStart(2, '0')}-99-q`;
    case 'ongoing':
      return '9999-99-99';
  }
}

export function fuzzyDateLabel(d: FuzzyDate): string {
  switch (d.kind) {
    case 'date': {
      const part = d.partOfDay ? ` ${d.partOfDay === 'AM' ? '오전' : '오후'}` : '';
      return `${d.iso}${part}`;
    }
    case 'month':
      return `${d.year}-${String(d.month).padStart(2, '0')} (월간 미정)`;
    case 'quarter':
      return `Q${d.quarter} ${d.year} 후속`;
    case 'ongoing':
      return '상시';
  }
}

export function fuzzyDateMatchesDay(d: FuzzyDate, isoDay: string): boolean {
  return d.kind === 'date' && d.iso === isoDay;
}

export function fuzzyDateMatchesMonth(d: FuzzyDate, year: number, month: number): boolean {
  if (d.kind === 'date') {
    const [y, m] = d.iso.split('-').map(Number);
    return y === year && m === month;
  }
  if (d.kind === 'month') return d.year === year && d.month === month;
  if (d.kind === 'quarter') {
    const monthsInQ = [d.quarter * 3 - 2, d.quarter * 3 - 1, d.quarter * 3];
    return d.year === year && monthsInQ.includes(month);
  }
  return false;
}

export function isFuzzyExactDate(d: FuzzyDate): boolean {
  return d.kind === 'date';
}

export function quarterFirstDay(year: number, quarter: 1 | 2 | 3 | 4): string {
  const month = quarter * 3 - 2;
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

export function fuzzyDateToGcalRange(d: FuzzyDate): {
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  prefix?: string;
} | null {
  const TZ = 'Asia/Seoul';
  switch (d.kind) {
    case 'date': {
      if (d.partOfDay === 'AM') {
        return {
          start: { dateTime: `${d.iso}T09:00:00+09:00`, timeZone: TZ },
          end: { dateTime: `${d.iso}T12:00:00+09:00`, timeZone: TZ },
        };
      }
      if (d.partOfDay === 'PM') {
        return {
          start: { dateTime: `${d.iso}T13:00:00+09:00`, timeZone: TZ },
          end: { dateTime: `${d.iso}T18:00:00+09:00`, timeZone: TZ },
        };
      }
      const [y, m, day] = d.iso.split('-').map(Number);
      const next = new Date(Date.UTC(y, m - 1, day + 1));
      const nextIso = next.toISOString().slice(0, 10);
      return {
        start: { date: d.iso },
        end: { date: nextIso },
      };
    }
    case 'month': {
      const start = `${d.year}-${String(d.month).padStart(2, '0')}-01`;
      const next = new Date(Date.UTC(d.year, d.month, 1));
      return {
        start: { date: start },
        end: { date: next.toISOString().slice(0, 10) },
        prefix: '(월간 미정)',
      };
    }
    case 'quarter': {
      const start = quarterFirstDay(d.year, d.quarter);
      const [, m] = start.split('-').map(Number);
      const next = new Date(Date.UTC(d.year, m, 1));
      return {
        start: { date: start },
        end: { date: next.toISOString().slice(0, 10) },
        prefix: '(분기 후속)',
      };
    }
    case 'ongoing':
      return null;
  }
}

export function gcalEventToFuzzyDate(
  start: { dateTime?: string; date?: string } | undefined
): FuzzyDate | null {
  if (!start) return null;
  if (start.dateTime) {
    const iso = start.dateTime.slice(0, 10);
    const hour = Number(start.dateTime.slice(11, 13));
    const partOfDay = hour < 12 ? 'AM' : 'PM';
    return { kind: 'date', iso, partOfDay };
  }
  if (start.date) {
    return { kind: 'date', iso: start.date };
  }
  return null;
}
