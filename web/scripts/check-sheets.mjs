// Quick smoke test: verify GOOGLE_SHEETS_ID + service account auth.
// Usage:
//   cd web && node --env-file=.env.development.local scripts/check-sheets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { JWT } from 'google-auth-library';

const sheetId = process.env.GOOGLE_SHEETS_ID;
const filePath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_FILE;

if (!sheetId) {
  console.error('✗ GOOGLE_SHEETS_ID is empty. Add it to .env.development.local');
  process.exit(1);
}
if (!filePath) {
  console.error('✗ GOOGLE_SERVICE_ACCOUNT_JSON_FILE is empty.');
  process.exit(1);
}

const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
const sa = JSON.parse(fs.readFileSync(abs, 'utf-8'));

const client = new JWT({
  email: sa.client_email,
  key: sa.private_key.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

await client.authorize();
console.log('✓ Auth OK as', sa.client_email);

const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?includeGridData=false`;
try {
  const res = await client.request({ url });
  const sheetTitles = (res.data.sheets ?? []).map(s => s.properties?.title);
  console.log('✓ Sheet readable:', res.data.properties?.title);
  console.log('  Worksheets:', sheetTitles);
  if (!sheetTitles.includes('Notes')) {
    console.warn('⚠ Worksheet "Notes" not found — rename a tab to "Notes".');
  } else {
    console.log('✓ "Notes" worksheet exists.');
  }
} catch (e) {
  const status = e?.response?.status;
  const body = e?.response?.data;
  console.error('✗ Sheet API error:', status, body?.error?.message ?? e.message);
  if (status === 403) {
    console.error('  → 시트에 service account 공유 안 됐을 가능성. 공유 추가:');
    console.error('    ', sa.client_email, '(편집자)');
  }
  if (status === 404) {
    console.error('  → GOOGLE_SHEETS_ID가 잘못됐을 가능성. URL의 /d/<ID>/edit에서 다시 추출.');
  }
  process.exit(1);
}
