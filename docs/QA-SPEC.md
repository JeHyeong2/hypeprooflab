# HypeProof QA Spec

> Based on real issues found in production. Every deploy MUST pass these checks.
> Last updated: 2026-02-13

---

## 🔴 P0 — Deploy Blockers (Must Pass)

### Mobile Responsive (Top offender)
- [ ] **M1**: Homepage renders correctly on 375px (iPhone SE) — no overflow, no overlap
- [ ] **M2**: Mobile nav menu fully covers background (no content bleed-through)
- [ ] **M3**: Mobile nav close button (X) is visible and functional
- [ ] **M4**: Column list page — cards stack vertically, no horizontal scroll
- [ ] **M5**: Column detail page — text readable, images fit viewport
- [ ] **M6**: Novel list/detail — same as M4/M5
- [ ] **M7**: My Activity page — tabs and content fit mobile width

### Content Rendering
- [ ] **R0**: No raw `**` visible in rendered output — check `**'text'**` patterns that break bold rendering. Strip quotes from inside bold markers or move bold inside quotes.
- [ ] **R1**: No `dangerouslySetInnerHTML` anywhere — ReactMarkdown + rehype-sanitize only
- [ ] **R2**: All columns render markdown correctly (headings, lists, links, code blocks, images)
- [ ] **R3**: All novels render markdown correctly
- [ ] **R4**: Author images load (check `/members/*.png` paths match frontmatter)
- [ ] **R5**: Korean + English content both render without encoding issues

### Build & Assets
- [ ] **B1**: `npm run build` passes with zero errors
- [ ] **B2**: favicon.ico exists and loads
- [ ] **B3**: OG image exists and renders in link previews (test with https://og-image-checker.vercel.app or Twitter card validator)
- [ ] **B4**: manifest.json valid
- [ ] **B5**: No console errors on page load (check all routes)

### SSR / Data
- [ ] **D1**: Homepage shows real column data (not hardcoded)
- [ ] **D2**: Column list shows all published columns
- [ ] **D3**: Column detail page loads via SSR (view-source shows content)
- [ ] **D4**: Novel list/detail same as D2/D3

---

## 🟠 P1 — Must Fix Within 24h

### Navigation
- [ ] **N1**: All nav links work (desktop + mobile): Home, Columns, Novels, My Activity
- [ ] **N2**: Language toggle (EN/KO) works on all pages
- [ ] **N3**: Auth button shows login/logout correctly
- [ ] **N4**: Logo links to homepage

### Auth & Interactive
- [ ] **A1**: Google login flow completes without error
- [ ] **A2**: GitHub login flow completes without error
- [ ] **A3**: Auth error page renders (not blank)
- [ ] **A4**: Unauthenticated users see disabled like/bookmark buttons (graceful degradation)

### Social Features (requires Supabase migration)
- [ ] **S1**: Like button toggles on/off, count updates
- [ ] **S2**: Bookmark button toggles on/off
- [ ] **S3**: Comments load, submit, display with role badges
- [ ] **S4**: My Activity page shows user's likes/bookmarks with column titles (not slugs)

---

## 🟡 P2 — Should Fix

### SEO & Sharing
- [ ] **E1**: Sitemap includes all columns, novels
- [ ] **E2**: RSS feed valid (`/feed.xml`)
- [ ] **E3**: JSON-LD structured data on column detail pages
- [ ] **E4**: Share buttons work (Twitter, copy link)
- [ ] **E5**: Discord/Twitter link previews show title + OG image

### Performance
- [ ] **F1**: Lighthouse mobile score > 80
- [ ] **F2**: No layout shift (CLS < 0.1)
- [ ] **F3**: First contentful paint < 2s

### Accessibility
- [ ] **X1**: All interactive elements have aria-labels
- [ ] **X2**: Keyboard navigation works (Tab, Enter, Escape for menus)
- [ ] **X3**: Color contrast meets WCAG AA

---

## 📋 Known Issue History

| Date | Issue | Severity | Root Cause | Fix |
|------|-------|----------|------------|-----|
| 2026-02-12 | Mobile menu overlay transparent | P0 | z-index same as navbar, pointer-events hack | Conditional render + z-[100] |
| 2026-02-12 | XSS via dangerouslySetInnerHTML | Critical | Hand-rolled markdown parser | ReactMarkdown + rehype-sanitize |
| 2026-02-12 | Author image 404 | P1 | jay.jpeg vs jay.png mismatch | Fixed frontmatter |
| 2026-02-12 | Homepage hardcoded columns | P0 | SSR not implemented | getAllColumns() → props |
| 2026-02-12 | Missing favicon/OG | P1 | Assets never created | Generated all variants |
| 2026-02-12 | My Activity shows slugs | P1 | No title lookup | /api/column-meta endpoint |
| 2026-02-13 | `**'text'**` not rendering as bold | P0 | Quotes inside bold markers break parser | Remove quotes from inside `**` |

---

## 🤖 Automated QA (Future)

### Playwright E2E Tests (TODO)
```
tests/e2e/
├── mobile-responsive.spec.ts   — viewport 375px checks for all pages
├── navigation.spec.ts          — all links, mobile menu open/close
├── column-render.spec.ts       — markdown rendering, author images
├── auth-flow.spec.ts           — login/logout/error states
├── social-features.spec.ts     — like/bookmark/comment (needs Supabase)
└── seo.spec.ts                 — sitemap, RSS, OG, JSON-LD
```

### Pre-deploy Script (TODO)
```bash
#!/bin/bash
# scripts/qa-check.sh
npm run build || exit 1
# npx playwright test --project=mobile || exit 1
# npx playwright test --project=desktop || exit 1
echo "✅ QA passed — safe to deploy"
```

---

## 🔄 Process

1. **Before every deploy**: Run through P0 checklist manually (until Playwright is set up)
2. **After deploy**: Spot-check mobile + desktop on real device
3. **New feature**: Add test cases to relevant section BEFORE implementing
4. **Bug found**: Add to Known Issue History + create test case to prevent regression
