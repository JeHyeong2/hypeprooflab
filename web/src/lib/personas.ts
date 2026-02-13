export interface Persona {
  id: string;
  name: string;
  creator: string;
  genres: string[];
  status: string;
  worksCount: number;
  signature: string;
  avatarUrl: string;
}

let cachedPersonas: Persona[] = [];
let lastFetchedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;
let fetchPromise: Promise<void> | null = null;

async function fetchPersonasFromNotion(): Promise<Persona[]> {
  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_PERSONAS_DB_ID;
  if (!apiKey || !dbId) {
    console.warn('[personas] NOTION_API_KEY or NOTION_PERSONAS_DB_ID not set');
    return [];
  }

  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 100 }),
  });

  if (!res.ok) {
    console.error('[personas] Notion API error:', res.status, await res.text());
    return [];
  }

  const data = await res.json();
  const personas: Persona[] = [];

  for (const page of data.results) {
    const props = page.properties;
    const name = props.Name?.title?.[0]?.plain_text ?? '';
    if (!name) continue;

    const creator = props.Creator?.rich_text?.[0]?.plain_text ?? props['Human Creator']?.rich_text?.[0]?.plain_text ?? '';
    const genres = (props.Genres?.multi_select ?? props.Genre?.multi_select ?? []).map((g: any) => g.name);
    const status = props.Status?.select?.name ?? 'active';
    const worksCount = props['Works Count']?.number ?? props.Works?.number ?? 0;
    const signature = props.Signature?.rich_text?.[0]?.plain_text ?? props.Voice?.rich_text?.[0]?.plain_text ?? '';
    const avatarUrl = props.Avatar?.url ?? props['Avatar URL']?.url ?? props.Avatar?.files?.[0]?.file?.url ?? props.Avatar?.files?.[0]?.external?.url ?? '';

    personas.push({ id: page.id, name, creator, genres, status, worksCount, signature, avatarUrl });
  }

  // Sort: CIPHER first
  personas.sort((a, b) => {
    if (a.name === 'CIPHER') return -1;
    if (b.name === 'CIPHER') return 1;
    return a.name.localeCompare(b.name);
  });

  return personas;
}

async function refreshCache(): Promise<void> {
  try {
    const fresh = await fetchPersonasFromNotion();
    if (fresh.length > 0) {
      cachedPersonas = fresh;
    }
    lastFetchedAt = Date.now();
  } catch (err) {
    console.error('[personas] Failed to fetch:', err);
    lastFetchedAt = Date.now();
  }
}

function ensureFresh(): void {
  if (Date.now() - lastFetchedAt > CACHE_TTL_MS && !fetchPromise) {
    fetchPromise = refreshCache().finally(() => { fetchPromise = null; });
  }
}

if (typeof window === 'undefined') {
  refreshCache();
}

export async function getPersonas(): Promise<Persona[]> {
  if (Date.now() - lastFetchedAt > CACHE_TTL_MS) {
    await refreshCache();
  } else {
    ensureFresh();
  }
  return cachedPersonas;
}
