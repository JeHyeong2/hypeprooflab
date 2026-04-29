'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { addNote, softDeleteNote, parseMentions, type NoteCategory } from '@/lib/sheets/notes';
import { isSheetsConfigured } from '@/lib/sheets/client';

export interface CreateNoteResult {
  ok: boolean;
  error?: string;
}

export async function createNoteAction(formData: {
  category: NoteCategory;
  content: string;
}): Promise<CreateNoteResult> {
  if (!isSheetsConfigured()) {
    return { ok: false, error: 'Google Sheets 연결이 설정되지 않았습니다.' };
  }
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, error: '로그인이 필요합니다.' };
  }
  const content = formData.content?.trim();
  if (!content) {
    return { ok: false, error: '내용을 입력해주세요.' };
  }
  if (content.length > 2000) {
    return { ok: false, error: '메모는 2000자 이내로 작성해주세요.' };
  }
  const u = session.user as { email?: string; name?: string; displayName?: string };
  const authorName =
    (u.displayName as string) ?? u.name ?? u.email!.split('@')[0];
  const mentions = parseMentions(content);
  try {
    await addNote({
      category: formData.category,
      content,
      authorEmail: u.email!,
      authorName,
      mentions,
    });
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteNoteAction(id: string): Promise<CreateNoteResult> {
  if (!isSheetsConfigured()) {
    return { ok: false, error: 'Google Sheets 연결이 설정되지 않았습니다.' };
  }
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, error: '로그인이 필요합니다.' };
  }
  try {
    await softDeleteNote(id);
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
