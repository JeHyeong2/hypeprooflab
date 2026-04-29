'use server';

import { revalidatePath } from 'next/cache';
import { reconcile } from '@/lib/timeline/gcalSync';
import type { SyncResult } from '@/lib/timeline/types';

export async function syncTimeline(): Promise<SyncResult> {
  const result = await reconcile();
  revalidatePath('/dashboard');
  return {
    imported: result.imported,
    pushed: result.pushed,
    conflicts: result.conflicts,
    needsAuth: result.needsAuth,
    message: result.message,
  };
}
