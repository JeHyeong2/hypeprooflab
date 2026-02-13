export type MemberRole = 'admin' | 'creator' | 'spectator';

export interface MemberInfo {
  email: string;
  displayName: string;
  role: MemberRole;
}

// Fallback hardcoded list (used when Notion API is unavailable)
const FALLBACK_MEMBERS: MemberInfo[] = [
  { email: 'jayleekr0125@gmail.com', displayName: 'Jay', role: 'admin' },
  { email: 'jabang3@gmail.com', displayName: 'Jay', role: 'admin' },
  { email: 'kiwonam96@gmail.com', displayName: 'Kiwon', role: 'creator' },
  { email: 'tj456852@gmail.com', displayName: 'TJ', role: 'creator' },
  { email: 'jkimak1124@gmail.com', displayName: 'Ryan', role: 'creator' },
  { email: 'jysin0102@gmail.com', displayName: 'JY', role: 'creator' },
  { email: 'xoqhdgh@gmail.com', displayName: 'BH', role: 'creator' },
];

// Cache
let memberMap = new Map<string, MemberInfo>(
  FALLBACK_MEMBERS.map((m) => [m.email.toLowerCase(), m])
);
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
    return new Map(FALLBACK_MEMBERS.map((m) => [m.email.toLowerCase(), m]));
  }

  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
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
    const email1: string | null = props.Email?.email ?? null;
    const email2: string | null = props['Email 2']?.email ?? null;

    if (email1) {
      map.set(email1.toLowerCase(), { email: email1, displayName: name, role });
    }
    if (email2) {
      map.set(email2.toLowerCase(), { email: email2, displayName: name, role });
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

export { FALLBACK_MEMBERS as KNOWN_MEMBERS };
