export type MemberRole = 'admin' | 'creator' | 'spectator';

export interface MemberInfo {
  email: string;
  displayName: string;
  role: MemberRole;
  discordId?: string;
}

// Fallback list (no emails for security — Notion is source of truth)
const FALLBACK_MEMBERS: { displayName: string; role: MemberRole }[] = [
  { displayName: 'Jay', role: 'admin' },
  { displayName: 'Kiwon', role: 'creator' },
  { displayName: 'TJ', role: 'creator' },
  { displayName: 'Ryan', role: 'creator' },
  { displayName: 'JY', role: 'creator' },
  { displayName: 'BH', role: 'creator' },
  { displayName: 'Sebastian', role: 'creator' },
];

// Cache
let memberMap = new Map<string, MemberInfo>();
let lastFetchedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let fetchPromise: Promise<void> | null = null;

function parseRole(raw: string | undefined | null): MemberRole {
  const lower = raw?.toLowerCase();
  if (lower === 'admin') return 'admin';
  if (lower === 'creator') return 'creator';
  return 'spectator';
}

interface NotionPage {
  properties: Record<string, any>;
}

async function fetchMembersFromNotion(): Promise<Map<string, MemberInfo>> {
  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_MEMBERS_DB_ID;
  if (!apiKey || !dbId) {
    console.warn('[members] NOTION_API_KEY or NOTION_MEMBERS_DB_ID not set, using fallback');
    return new Map();
  }

  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        property: 'Status',
        select: { equals: 'Active' },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Notion API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const map = new Map<string, MemberInfo>();

  for (const page of data.results as NotionPage[]) {
    const props = page.properties;
    const name = props.Name?.title?.[0]?.plain_text ?? 'Unknown';
    const role = parseRole(props.Role?.select?.name);
    const email: string | null = props.Email?.email ?? null;
    const discordId: string | null =
      props['Discord ID']?.rich_text?.[0]?.plain_text ?? null;

    if (email) {
      map.set(email.toLowerCase(), {
        email,
        displayName: name,
        role,
        ...(discordId ? { discordId } : {}),
      });
    }
  }

  return map;
}

async function refreshCache(): Promise<void> {
  try {
    const fresh = await fetchMembersFromNotion();
    if (fresh.size > 0) {
      memberMap = fresh;
    }
    lastFetchedAt = Date.now();
  } catch (err) {
    console.error('[members] Failed to fetch from Notion, using cached/fallback:', err);
    lastFetchedAt = Date.now(); // avoid hammering on repeated failures
  }
}

function ensureFresh(): void {
  if (Date.now() - lastFetchedAt > CACHE_TTL_MS && !fetchPromise) {
    fetchPromise = refreshCache().finally(() => {
      fetchPromise = null;
    });
  }
}

// Eagerly load on module init (server-side)
if (typeof window === 'undefined') {
  refreshCache();
}

export function getMemberByEmail(email: string): MemberInfo | undefined {
  ensureFresh();
  return memberMap.get(email.toLowerCase());
}

export function getRoleForEmail(email: string): MemberRole {
  return getMemberByEmail(email)?.role ?? 'spectator';
}

export function isKnownMember(email: string): boolean {
  ensureFresh();
  return memberMap.has(email.toLowerCase());
}

export function getAllMembers(): MemberInfo[] {
  ensureFresh();
  return Array.from(memberMap.values());
}

export { FALLBACK_MEMBERS };
