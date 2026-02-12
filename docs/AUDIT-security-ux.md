# HypeProof — Security & UX Audit Report

**Date:** 2026-02-12  
**Auditor:** Claude (Senior Security Engineer & UX Reviewer)  
**Scope:** Full-stack audit of HypeProof web application  

---

## 1. 🔴 Critical — Must Fix Before Production

### C1. No Row-Level Security (RLS) on Supabase Tables

**Issue:** The migration (`001_init.sql`) creates tables but defines zero RLS policies. Combined with using `SUPABASE_SERVICE_ROLE_KEY` (which bypasses RLS entirely), this means:
- If the service role key leaks, **all data is fully readable/writable** with no guardrails.
- If you ever add a client-side Supabase client (e.g., for realtime), there's no protection.

**Risk:** Complete data exposure/manipulation.

**Fix:** Enable RLS and add policies even if you only use service_role server-side — defense in depth:

```sql
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Example: users can only read/write their own likes
CREATE POLICY "Users manage own likes" ON likes
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims')::json->>'sub');
```

### C2. XSS via `dangerouslySetInnerHTML` in ColumnArticle.tsx

**Issue:** `parseMarkdown()` is a hand-rolled regex-based Markdown parser that feeds directly into `dangerouslySetInnerHTML`. If any column content contains malicious HTML/JS (e.g., from a compromised author account or content injection), it executes in users' browsers.

**Risk:** Stored XSS — session theft, credential harvesting, defacement.

**Fix:** Either:
1. Use a proper Markdown library with sanitization (e.g., `remark` + `rehype-sanitize`)
2. Or at minimum, sanitize the output with `DOMPurify` before rendering:

```tsx
import DOMPurify from 'isomorphic-dompurify';

const sanitized = DOMPurify.sanitize(htmlContent);
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

### C3. Supabase Service Role Key Used Server-Side Without Scoping

**Issue:** `getSupabase()` creates a single client using `SUPABASE_SERVICE_ROLE_KEY` — this key has **full admin access** bypassing all RLS. Every API route shares this god-mode client.

**Risk:** Any API vulnerability (injection, logic bug) operates with full DB privileges. A single bug in any route = full DB compromise.

**Fix:** For user-scoped operations (likes, bookmarks), use `SUPABASE_ANON_KEY` with user JWT or at minimum scope queries carefully. Reserve service_role for admin-only operations.

---

## 2. 🟠 High — Should Fix Soon

### H1. No Input Sanitization on `slug` and `contentType` Parameters

**Issue:** API routes accept `slug` and `type` from user input and pass them directly to Supabase queries. While Supabase's client library uses parameterized queries (preventing SQL injection), there's no validation on format or length.

**Risk:** Abuse via extremely long strings, special characters, or resource exhaustion. If you ever switch to raw SQL, instant injection.

**Fix:**
```typescript
const SLUG_REGEX = /^[a-z0-9-]{1,200}$/;
const VALID_TYPES = ['column', 'novel'];

if (!SLUG_REGEX.test(slug)) {
  return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
}
if (!VALID_TYPES.includes(contentType)) {
  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
```

### H2. No Rate Limiting on Likes/Bookmarks API Routes

**Issue:** Only the views API has rate limiting. The likes and bookmarks POST endpoints have no rate limiting — an authenticated user could spam toggle requests.

**Risk:** Database abuse, potential DoS on Supabase.

**Fix:** Apply the existing `getRatelimit()` to likes/bookmarks routes:
```typescript
const { success } = await getRatelimit().limit(session.user.id);
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

### H3. No CSRF Protection on API Routes

**Issue:** Next.js App Router API routes don't automatically include CSRF protection. The likes/bookmarks POST endpoints rely only on session cookies.

**Risk:** An attacker could craft a malicious page that triggers like/bookmark actions on behalf of an authenticated user.

**Fix:** Add middleware that checks the `Origin` or `Referer` header matches your domain, or use Auth.js's built-in CSRF token:
```typescript
// middleware.ts
const origin = request.headers.get('origin');
if (request.method === 'POST' && origin !== process.env.NEXTAUTH_URL) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### H4. Weak IP Hashing in Views API

**Issue:** `hashIp()` uses a simple JS hash function (djb2-like). The salt defaults to `'hypeproof-salt'` if `IP_HASH_SALT` isn't set. This is trivially reversible for known IP ranges.

**Risk:** IP address enumeration/recovery from stored hashes.

**Fix:** Use a proper HMAC:
```typescript
import { createHmac } from 'crypto';

function hashIp(ip: string): string {
  return createHmac('sha256', process.env.IP_HASH_SALT!)
    .update(ip)
    .digest('hex')
    .slice(0, 16);
}
```

### H5. No Middleware for Auth Protection

**Issue:** There's no Next.js middleware. Each API route manually calls `auth()`. This is error-prone — it's easy to forget auth checks on new routes.

**Fix:** Add `middleware.ts` to protect API routes globally:
```typescript
// middleware.ts
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/api/likes/:path*', '/api/bookmarks/:path*'],
};
```

---

## 3. 🟡 Medium — Good to Have

### M1. Hardcoded Member List in `members.ts`

**Issue:** Roles are defined in a static array. Adding/removing members requires a code deploy.

**Risk:** Operational friction, no audit trail for role changes.

**Fix:** Move to the `profiles` table in Supabase (already defined in schema but unused). Fall back to hardcoded list during migration.

### M2. Views API GET — Unbounded Batch Size

**Issue:** The `slugs` parameter in `GET /api/views` splits by comma with no limit. An attacker could pass thousands of slugs.

**Risk:** Redis pipeline abuse, memory/latency spike.

**Fix:**
```typescript
const slugList = slugs.split(',').filter(Boolean).slice(0, 50);
```

### M3. No Error Boundaries or Retry Logic

**Issue:** Client components (LikeButton, BookmarkButton, ViewCounter) catch errors silently or show brief toasts. No retry mechanism for transient failures.

**Risk:** Poor UX on flaky connections — user thinks action worked but it didn't.

**Fix:** Add retry logic (exponential backoff) and persistent error states with "retry" buttons.

### M4. JWT Role Not Refreshed After Assignment

**Issue:** User role is set in the JWT `jwt` callback only when `user` object is present (i.e., at sign-in). If you change someone's role in `members.ts`, they keep their old role until they re-login.

**Risk:** Stale permissions.

**Fix:** Always re-check role in the `jwt` callback using `token.email`:
```typescript
async jwt({ token }) {
  if (token.email) {
    token.role = getRoleForEmail(token.email);
    const member = getMemberByEmail(token.email);
    token.displayName = member?.displayName;
  }
  if (!token.role) token.role = 'spectator';
  return token;
}
```

### M5. `NEXT_PUBLIC_SUPABASE_URL` Exposed to Client

**Issue:** The Supabase URL is prefixed with `NEXT_PUBLIC_`, meaning it's bundled into client-side JS. While the URL alone isn't secret, it reveals your Supabase project endpoint.

**Risk:** Low on its own, but combined with any leaked anon key, enables direct DB access.

**Fix:** Since you only use Supabase server-side, rename to `SUPABASE_URL` (no `NEXT_PUBLIC_` prefix).

### M6. No Security Headers

**Issue:** No `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, or `Strict-Transport-Security` headers configured in `next.config.ts`.

**Fix:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  headers: async () => [{
    source: '/:path*',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-XSS-Protection', value: '0' }, // rely on CSP instead
    ],
  }],
  // ...existing config
};
```

---

## 4. 🟢 Low — Nice to Have

### L1. No Loading Skeletons

**Issue:** View counts show "—" while loading, like/bookmark buttons pop in after fetch. No skeleton UI.

**Fix:** Add shimmer/skeleton placeholders for smoother perceived performance.

### L2. Accessibility Gaps

**Issue:**
- Language toggle buttons lack `aria-label` and `lang` attributes.
- Dropdown menu in AuthButton isn't keyboard navigable (no `role="menu"`, no arrow key support, no Escape to close).
- No skip-to-content link.
- Color contrast of `text-zinc-500` on `bg-zinc-950` may fail WCAG AA.

### L3. No Keyboard Shortcut to Close Menu

**Issue:** AuthButton dropdown only closes on outside click. No Escape key handler.

**Fix:** Add `onKeyDown` handler for Escape in the menu component.

### L4. Error Page Only in Korean

**Issue:** `auth/error/page.tsx` has hardcoded Korean error messages with no locale awareness.

**Fix:** Detect locale from browser or URL param and show bilingual messages.

### L5. `parseMarkdown` Is Fragile

**Issue:** The regex-based parser doesn't handle nested formatting, code blocks, links, or images. Edge cases will break rendering.

**Fix:** Replace with `remark`/`rehype` pipeline (also addresses C2).

### L6. No `rel="noopener"` on External Links

**Issue:** The `mailto:` link in AuthButton and any future external links should have `rel="noopener noreferrer"` for security.

---

## 5. 💡 Recommendations — Future Improvements

### R1. Add Next.js Middleware
Create `middleware.ts` for: auth gating, CSRF checks, rate limiting headers, security headers, and redirect logic. This is the single most impactful architectural improvement.

### R2. Structured Logging & Monitoring
Replace `console.error` with a structured logger (e.g., Pino). Add error tracking (Sentry). You're flying blind on production errors right now.

### R3. Comment System Security Planning
The `comments` table exists but isn't implemented. When you build it:
- Sanitize `body` field (XSS vector)
- Rate limit comment creation
- Add moderation queue (especially for spectators)
- Consider content length limits
- Add spam detection

### R4. Admin Dashboard
Build a simple admin UI for:
- Managing member roles (replace hardcoded list)
- Viewing analytics (views, likes over time)
- Moderating future comments
- Content status management

### R5. Move to Database-Driven Roles
The `profiles` table already has a `role` column. Wire it up:
1. On first login, upsert profile from JWT + members.ts fallback
2. Read role from DB in JWT callback
3. Admin UI to change roles without deploys

### R6. Cost Awareness at Scale
- **Supabase:** Free tier = 500MB DB, 2GB bandwidth. Likes/bookmarks are lightweight but monitor row counts.
- **Upstash Redis:** Free tier = 10K commands/day. Each page view = 2-3 commands. At ~3K daily views you hit the limit.
- **Vercel:** Serverless function invocations. Each API call = 1 invocation.

### R7. API Versioning
Consider prefixing API routes with `/api/v1/` for future backwards compatibility.

### R8. Content Security Policy (CSP)
When you add CSP, whitelist only necessary sources. The `dangerouslySetInnerHTML` usage makes CSP critical — use `script-src 'self'` to mitigate XSS even if sanitization fails.

### R9. OAuth Hardening
- Explicitly configure `NEXTAUTH_URL` in production
- Restrict Google OAuth to specific domains if this is a team-only app
- Monitor for unused OAuth tokens

### R10. Mobile UX
The current responsive design is functional but could benefit from:
- Bottom navigation bar for mobile
- Swipe gestures for article navigation
- Pull-to-refresh on list pages
- Touch-optimized tap targets (some buttons are small)

---

## Summary

| Severity | Count | Key Themes |
|----------|-------|------------|
| 🔴 Critical | 3 | XSS, No RLS, Service role key exposure |
| 🟠 High | 5 | Missing rate limits, CSRF, weak hashing, no middleware |
| 🟡 Medium | 6 | Hardcoded roles, unbounded inputs, stale JWT, security headers |
| 🟢 Low | 6 | A11y, i18n, loading states, fragile parser |
| 💡 Recs | 10 | Middleware, logging, admin UI, cost planning |

**Top 3 priorities:**
1. Fix XSS in `ColumnArticle.tsx` (use proper Markdown lib + sanitization)
2. Enable Supabase RLS policies
3. Add Next.js middleware for auth + CSRF + security headers
