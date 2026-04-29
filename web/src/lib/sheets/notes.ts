import 'server-only';
import { sheetsFetch, isSheetsConfigured } from './client';

export type NoteCategory = 'spec' | 'curriculum' | 'shoot' | 'pitchpack' | 'general';

export const NOTE_CATEGORIES: { id: NoteCategory; title: string; subtitle: string }[] = [
  { id: 'spec', title: '제품 명세서', subtitle: '무엇을 제공하는가' },
  { id: 'curriculum', title: '커리큘럼', subtitle: '누구에게 무엇을 훈련시키는가' },
  { id: 'shoot', title: '촬영 방향성', subtitle: '무엇이 증거인가' },
  { id: 'pitchpack', title: '세일즈 피치팩', subtitle: 'Jay / 정우가 바로 사용' },
  { id: 'general', title: '일반', subtitle: '자유 메모' },
];

export interface Note {
  id: string;
  category: NoteCategory;
  authorEmail: string;
  authorName: string;
  content: string;
  mentions: string[];
  createdAt: string;
  deletedAt?: string;
}

export interface NewNote {
  category: NoteCategory;
  content: string;
  authorEmail: string;
  authorName: string;
  mentions: string[];
}

const SHEET_NAME = 'Notes';
const HEADER = [
  'id',
  'category',
  'author_email',
  'author_name',
  'content',
  'mentions',
  'created_at',
  'deleted_at',
];
const HEADER_RANGE = `${SHEET_NAME}!A1:H1`;
const ALL_RANGE = `${SHEET_NAME}!A2:H10000`;

interface ValuesResponse {
  range: string;
  values?: string[][];
}

async function ensureHeader(): Promise<void> {
  try {
    const data = await sheetsFetch<ValuesResponse>(`/values/${encodeURIComponent(HEADER_RANGE)}`);
    const row = data.values?.[0] ?? [];
    if (row.length >= HEADER.length) return;
  } catch {
    /* fall through to write header */
  }
  await sheetsFetch(`/values/${encodeURIComponent(HEADER_RANGE)}`, {
    method: 'PUT',
    query: { valueInputOption: 'RAW' },
    body: { values: [HEADER] },
  });
}

function rowToNote(row: string[]): Note | null {
  const [id, category, authorEmail, authorName, content, mentions, createdAt, deletedAt] = row;
  if (!id || !category || !content) return null;
  return {
    id,
    category: (category as NoteCategory) ?? 'general',
    authorEmail: authorEmail ?? '',
    authorName: authorName ?? '',
    content,
    mentions: mentions ? mentions.split(',').map(s => s.trim()).filter(Boolean) : [],
    createdAt: createdAt ?? '',
    deletedAt: deletedAt || undefined,
  };
}

export async function listNotes(): Promise<Note[]> {
  if (!isSheetsConfigured()) return [];
  try {
    const data = await sheetsFetch<ValuesResponse>(`/values/${encodeURIComponent(ALL_RANGE)}`);
    const rows = data.values ?? [];
    return rows
      .map(rowToNote)
      .filter((n): n is Note => n !== null && !n.deletedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function addNote(input: NewNote): Promise<Note> {
  if (!isSheetsConfigured()) throw new Error('Sheets not configured');
  await ensureHeader();
  const note: Note = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: input.category,
    authorEmail: input.authorEmail,
    authorName: input.authorName,
    content: input.content,
    mentions: input.mentions,
    createdAt: new Date().toISOString(),
  };
  const row = [
    note.id,
    note.category,
    note.authorEmail,
    note.authorName,
    note.content,
    note.mentions.join(','),
    note.createdAt,
    '',
  ];
  await sheetsFetch(`/values/${encodeURIComponent(`${SHEET_NAME}!A:H`)}:append`, {
    method: 'POST',
    query: {
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
    },
    body: { values: [row] },
  });
  return note;
}

export async function softDeleteNote(id: string): Promise<void> {
  if (!isSheetsConfigured()) throw new Error('Sheets not configured');
  // Find row index by id
  const data = await sheetsFetch<ValuesResponse>(`/values/${encodeURIComponent(ALL_RANGE)}`);
  const rows = data.values ?? [];
  const idx = rows.findIndex(r => r[0] === id);
  if (idx < 0) return;
  // Sheet row is idx+2 (header at row 1, data starts at row 2)
  const targetRow = idx + 2;
  await sheetsFetch(`/values/${encodeURIComponent(`${SHEET_NAME}!H${targetRow}`)}`, {
    method: 'PUT',
    query: { valueInputOption: 'RAW' },
    body: { values: [[new Date().toISOString()]] },
  });
}

export function parseMentions(text: string): string[] {
  const re = /@([A-Za-z가-힣][A-Za-z0-9가-힣_]*)/g;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.add(m[1]);
  return [...out];
}
