import 'server-only';

/**
 * Minimal Discord webhook poster. Optional — silently no-ops if URL absent.
 *
 * Set DISCORD_TASK_WEBHOOK_URL in env to enable.
 * For richer formatting (embeds), upgrade later.
 */
export async function postDiscordMessage(content: string): Promise<{ ok: boolean }> {
  const url = process.env.DISCORD_TASK_WEBHOOK_URL;
  if (!url || !content.trim()) return { ok: false };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.slice(0, 1900) }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

/**
 * Format a task notification with member mentions.
 * Members can map displayName → Discord user id via DISCORD_MEMBER_IDS env (JSON).
 */
function resolveMention(displayName: string): string {
  try {
    const map = JSON.parse(process.env.DISCORD_MEMBER_IDS || '{}') as Record<string, string>;
    const id = map[displayName];
    return id ? `<@${id}>` : `@${displayName}`;
  } catch {
    return `@${displayName}`;
  }
}

export function formatTaskAddedMessage(input: {
  title: string;
  assignees: string[];
  dueDate?: string;
  eventTitle?: string;
  reporterName?: string;
}): string {
  const mentions = input.assignees.map(resolveMention).join(' ');
  const meta: string[] = [];
  if (input.dueDate) meta.push(`due ${input.dueDate}`);
  if (input.eventTitle) meta.push(`📅 ${input.eventTitle}`);
  const head = mentions ? `${mentions} ` : '';
  const tail = meta.length ? ` _(${meta.join(' · ')})_` : '';
  const by = input.reporterName ? ` — by ${input.reporterName}` : '';
  return `${head}**${input.title}**${tail}${by}`;
}
