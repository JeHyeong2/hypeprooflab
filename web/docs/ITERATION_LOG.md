# Iteration Log — HypeProof Website Redesign

## Phase 1: Build Fix + Deploy

### Iteration 1 — Baseline Deploy
- Verified build passes, deployed to hypeproof-ai.xyz ✅

## Phase 2: Column System

### Iteration 2 — MD-Based Column Content Loader
- Created `src/lib/columns.ts` with frontmatter parsing, no external deps ✅

### Iteration 3 — English Translation of Chairman Column
- `src/content/columns/en/2026-02-10-era-of-the-chairman.md` ✅

### Iteration 4 — Medium-Style Column Detail Page
- Rewrote `/columns/[slug]/page.tsx` + `ColumnArticle.tsx`
- 680px max-width, 18px/32px body, author photo, sticky compact nav ✅

### Iteration 5 — Column List Page (MD-based)
- Server component loads columns, client list with locale toggle ✅

### Iteration 6 — Navigation: Columns Link
- Added "Columns" to desktop nav ✅

### Iteration 7-8 — What We Do Cards (Korean)
- 3 cards: AI Research & Analysis, Agent Architecture Design, Open Community
- Korean descriptions + subtitle ✅

### Iteration 9 — Column Content CSS
- `.column-content` styles: h2/h3/hr/blockquote/p spacing ✅

### Iteration 10 — Typography CSS
- KO: 0.03em/1.8, EN: 0.01em/1.7, word-break: keep-all ✅

### Iteration 11-12 — Deploy + Locale Default
- Columns list defaults to KO ✅

### Iteration 13 — Homepage Column Links
- Links to `?lang=ko` ✅

### Iteration 14-16 — EN|KO Toggle
- Simple inline `EN | KO` toggle replaces dropdown in header ✅

### Iteration 17-18 — KO Columns for All Articles
- Created KO versions of Claude Opus and OpenAI Agents columns ✅

### Iteration 19-22 — Deploy + Verify
- All 3 columns in both KO and EN ✅
- Column URLs working with `?lang=` param ✅

## Phase 3: Typography + Mobile

### Iteration 23-25 — Visual Verification
- Desktop/Mobile screenshots verified ✅
- 390px iPhone width tested ✅

### Iteration 26 — Korean word-break
- `word-break: keep-all` for Korean text ✅

### Iteration 27-28 — Reading Progress Bar
- Purple progress bar on column pages ✅

### Iteration 29 — Markdown Parser Improvements
- Added blockquote, list, bold support ✅

### Iteration 30 — Homepage Korean Content
- Column titles, excerpts, section headings in Korean ✅
- "모든 칼럼 보기" button ✅

### Iteration 31 — Mobile Column CSS
- Responsive blockquote, hr margins ✅
- 390px specific font-size adjustments ✅

## Phase 4: What We Do

### Iteration 32-34 — What We Do Korean Descriptions
- Applied Korean descriptions to all 3 feature cards ✅
- Subtitle: "AI의 미래를 탐구하는 세 가지 트랙" ✅

## Phase 5: i18n

### Iteration 35 — EN|KO Toggle in Main Nav
- SimpleLanguageToggle component ✅

### Iteration 36 — Column Page Language Toggle
- Switch between KO/EN on individual column pages ✅

### Iteration 37 — Column List Locale Toggle
- EN|KO toggle on columns list page ✅

## Polish & Refinement

### Iteration 38 — Footer Links
- "Articles" → "Columns" in footer ✅

### Iteration 39 — Mobile Nav: Columns Link
- Added Columns to mobile hamburger menu ✅

### Iteration 40 — Sitemap Update
- Dynamic sitemap from MD column files ✅

### Iteration 41 — Homepage Date Format
- Korean date formatting (YYYY년 M월 D일) ✅

### Iteration 42 — Community Section Korean
- "HypeProof AI Community는 AI의 진짜 가치를..." ✅

### Iteration 43 — "칼럼 읽기" (Read Article Korean)
- Homepage column card hover text in Korean ✅

### Iteration 44-45 — Code Cleanup
- Removed unused imports (useSearchParams) ✅
- Cleaned up ColumnArticle.tsx ✅

### Iteration 46-50 — Git Commits + Deploys
- 2 git commits pushed to main ✅
- 10+ Vercel deploys completed ✅

---

## Completion Status

| Phase | Status |
|-------|--------|
| Phase 1: Build Fix + Deploy | ✅ Complete |
| Phase 2: Column System | ✅ Complete |
| Phase 3: Typography + Mobile | ✅ Complete |
| Phase 4: What We Do | ✅ Complete |
| Phase 5: i18n | ✅ Complete |

### Key Deliverables
- **Live site**: https://hypeproof-ai.xyz
- **Column URL**: `/columns/2026-02-10-era-of-the-chairman`
- **MD content**: `src/content/columns/{ko,en}/` — 3 articles in each locale
- **Medium-style**: 680px, 18px/32px body, author photos, progress bar
- **i18n**: EN|KO toggle in header, column pages, column list
- **Typography**: KO 0.03em/1.8, EN 0.01em/1.7, word-break: keep-all
- **Mobile**: 390px responsive, tested on iPhone viewport
- **3 Feature Cards**: AI Research, Agent Architecture, Open Community (Korean descriptions)

### Files Changed
- `src/lib/columns.ts` — NEW: MD content loader
- `src/app/columns/[slug]/page.tsx` — Rewritten: Server component
- `src/app/columns/[slug]/ColumnArticle.tsx` — NEW: Medium-style client component
- `src/app/columns/page.tsx` — Rewritten: MD-based
- `src/app/columns/ColumnsListClient.tsx` — NEW: Client list with locale toggle
- `src/app/page.tsx` — Updated: Korean content, column links
- `src/app/globals.css` — Updated: Column styles, mobile CSS, typography
- `src/app/sitemap.ts` — Updated: Dynamic from MD files
- `src/components/layout/Navigation.tsx` — Updated: EN|KO toggle, Columns link
- `src/components/layout/Footer.tsx` — Updated: Columns link
- `src/components/sections/FeaturesSection.tsx` — Updated: 3 new cards, Korean text
- `src/content/columns/en/2026-02-10-era-of-the-chairman.md` — NEW
- `src/content/columns/ko/2026-02-06-claude-opus-4-6-alignment.md` — NEW
- `src/content/columns/ko/2026-02-05-openai-agents-sdk.md` — NEW
