import 'server-only';
import path from 'path';
import fs from 'fs';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let cachedClient: JWT | null = null;

export function isSheetsConfigured(): boolean {
  if (!process.env.GOOGLE_SHEETS_ID) return false;
  return Boolean(decodeServiceAccount());
}

export function getSheetsId(): string {
  return process.env.GOOGLE_SHEETS_ID ?? '';
}

/**
 * Service Account credentials are read in this priority:
 *   1. GOOGLE_SERVICE_ACCOUNT_JSON_FILE     — path to a JSON key file on disk (dev-friendly)
 *   2. GOOGLE_SERVICE_ACCOUNT_JSON          — raw JSON string (best for stringified JSON)
 *   3. GOOGLE_SERVICE_ACCOUNT_JSON_BASE64   — JSON encoded as base64 (avoids escape issues)
 *   4. GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 *      — email + PEM private_key. Newlines may be literal "\n" — they are unescaped.
 *
 * Relative paths in (1) resolve from the web/ directory (process.cwd() during build/runtime).
 * Pick whichever is most convenient for your env / hosting platform.
 */
function decodeServiceAccount(): { client_email: string; private_key: string } | null {
  const filePath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_FILE;
  if (filePath) {
    try {
      const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
      const raw = fs.readFileSync(abs, 'utf-8');
      const parsed = JSON.parse(raw) as { client_email?: string; private_key?: string };
      if (parsed.client_email && parsed.private_key) {
        return { client_email: parsed.client_email, private_key: parsed.private_key };
      }
    } catch {
      /* fall through */
    }
  }

  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw) as { client_email?: string; private_key?: string };
      if (parsed.client_email && parsed.private_key) {
        return { client_email: parsed.client_email, private_key: parsed.private_key };
      }
    } catch {
      /* fall through */
    }
  }

  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  if (b64) {
    try {
      const json = Buffer.from(b64, 'base64').toString('utf-8');
      const parsed = JSON.parse(json) as { client_email?: string; private_key?: string };
      if (parsed.client_email && parsed.private_key) {
        return { client_email: parsed.client_email, private_key: parsed.private_key };
      }
    } catch {
      /* fall through */
    }
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (email && key) {
    return { client_email: email, private_key: key };
  }

  return null;
}

export async function getAuthClient(): Promise<JWT | null> {
  if (cachedClient) return cachedClient;
  const sa = decodeServiceAccount();
  if (!sa) return null;
  const client = new JWT({
    email: sa.client_email,
    key: sa.private_key.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });
  await client.authorize();
  cachedClient = client;
  return client;
}

export async function sheetsFetch<T>(
  pathSuffix: string,
  init?: { method?: string; body?: unknown; query?: Record<string, string> },
): Promise<T> {
  const client = await getAuthClient();
  if (!client) throw new Error('Sheets not configured');
  const sheetId = getSheetsId();
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}${pathSuffix}`;
  const qs = init?.query
    ? '?' + new URLSearchParams(init.query).toString()
    : '';
  const res = await client.request<T>({
    url: `${base}${qs}`,
    method: (init?.method as 'GET' | 'POST' | 'PUT' | 'DELETE') ?? 'GET',
    data: init?.body,
  });
  return res.data;
}
