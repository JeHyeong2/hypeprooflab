import { readFileSync } from 'fs';
import { join } from 'path';

export type MemberRole = 'admin' | 'creator' | 'spectator';

export interface MemberInfo {
  email: string;
  displayName: string;
  role: MemberRole;
  discordUsername?: string;
  joinDate?: string;       // YYYY-MM-DD
  totalPoints?: number;
}

interface MembersJsonEntry {
  displayName: string;
  role: MemberRole;
  [key: string]: unknown;
}

// Load fallback members from data/members.json (SSOT)
function loadFallbackMembers(): { displayName: string; role: MemberRole }[] {
  try {
    const jsonPath = join(process.cwd(), '..', 'data', 'members.json');
    const raw = readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw);
    return (data.members as MembersJsonEntry[])
      .filter((m) => m.status === 'active')
      .map((m) => ({ displayName: m.displayName, role: m.role as MemberRole }));
  } catch {
    // Hardcoded fallback if JSON file is unavailable (e.g. standalone build)
    return [
      { displayName: 'Jay', role: 'admin' },
      { displayName: 'Kiwon', role: 'creator' },
      { displayName: 'TJ', role: 'creator' },
      { displayName: 'Ryan', role: 'creator' },
      { displayName: 'JY', role: 'creator' },
      { displayName: 'BH', role: 'creator' },
      { displayName: 'Sebastian', role: 'creator' },
      { displayName: '재형', role: 'creator' },
      { displayName: '정우', role: 'creator' },
      { displayName: 'Simon', role: 'creator' },
    ];
  }
}

const FALLBACK_MEMBERS = loadFallbackMembers();

// Cache — keyed by displayName (lowercased) for lookup, stores full list
let memberList: MemberInfo[] = [];
let memberMap = new Map<string, MemberInfo>();
let lastFetchedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let fetchPromise: Promise<MemberInfo[]> | null = null;

function parseRole(raw: string | undefined | null): MemberRole {
  const lower = raw?.toLowerCase();
  if (lower === 'admin') return 'admin';
  if (lower === 'creator') return 'creator';
  return 'spectator';
}

interface NotionPage {
  properties: Record<string, any>;
}

async function fetchMembersFromNotion(): Promise<MemberInfo[]> {
  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_MEMBERS_DB_ID;
  if (!apiKey || !dbId) {
    console.warn('[members] NOTION_API_KEY or NOTION_MEMBERS_DB_ID not set, using fallback');
    return [];
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
    next: { revalidate: 300 }, // ISR: revalidate every 5 min
  });

  if (!res.ok) {
    throw new Error(`Notion API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const members: MemberInfo[] = [];

  for (const page of data.results as NotionPage[]) {
    const props = page.properties;
    const name = props.Name?.title?.[0]?.plain_text ?? 'Unknown';
    const role = parseRole(props.Role?.select?.name);
    const email: string | null = props.Email?.email ?? null;
    const discordUsername: string | null =
      props['Discord ID']?.rich_text?.[0]?.plain_text ?? null;
    const joinDate: string | null = props['Join Date']?.date?.start ?? null;
    const totalPoints: number = props.Points?.number ?? 0;

    members.push({
      email: email ?? '',
      displayName: name,
      role,
      ...(discordUsername ? { discordUsername } : {}),
      ...(joinDate ? { joinDate } : {}),
      totalPoints,
    });
  }

  return members;
}

async function refreshCache(): Promise<MemberInfo[]> {
  try {
    const fresh = await fetchMembersFromNotion();
    if (fresh.length > 0) {
      memberList = fresh;
      memberMap = new Map();
      for (const m of fresh) {
        if (m.email) memberMap.set(m.email.toLowerCase(), m);
      }
    }
    lastFetchedAt = Date.now();
    return memberList;
  } catch (err) {
    console.error('[members] Failed to fetch from Notion, using cached/fallback:', err);
    lastFetchedAt = Date.now();
    return memberList;
  }
}

function ensureFresh(): Promise<MemberInfo[]> | null {
  if (Date.now() - lastFetchedAt > CACHE_TTL_MS && !fetchPromise) {
    fetchPromise = refreshCache().finally(() => {
      fetchPromise = null;
    });
    return fetchPromise;
  }
  return fetchPromise;
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

/** Synchronous — returns cached members (may be empty on cold start) */
export function getAllMembers(): MemberInfo[] {
  ensureFresh();
  return memberList;
}

/** Async — guaranteed to have data if Notion is reachable */
export async function getAllMembersAsync(): Promise<MemberInfo[]> {
  if (memberList.length === 0 || Date.now() - lastFetchedAt > CACHE_TTL_MS) {
    await refreshCache();
  }
  return memberList;
}

export { FALLBACK_MEMBERS };
