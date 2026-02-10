# Iteration Log — HypeProof Website Redesign

## Iteration 1 — Baseline Deploy
- **Date**: 2026-02-10
- **Change**: Verified build passes, deployed current state
- **Result**: ✅ Deployed to hypeproof-ai.xyz

## Iteration 2 — MD-Based Column System
- **Change**: Created `src/lib/columns.ts` — file-based MD content loader with frontmatter parsing
- **Files**: New `src/lib/columns.ts`
- **Result**: ✅ Columns now load from `src/content/columns/{locale}/{slug}.md`

## Iteration 3 — English Translation of Chairman Column
- **Change**: Created `src/content/columns/en/2026-02-10-era-of-the-chairman.md`
- **Result**: ✅ Full English translation of "회장님의 시대가 열리다"

## Iteration 4 — Medium-Style Column Detail Page
- **Change**: Complete rewrite of `/columns/[slug]/page.tsx` + new `ColumnArticle.tsx`
- **Features**: 680px max-width, 18px/32px body, author photo, sticky compact nav, KO|EN toggle
- **Result**: ✅ Clean Medium-style reading experience

## Iteration 5 — Column List Page Rewrite
- **Change**: Rewrote `/columns/page.tsx` to use MD files via server component + client list
- **Files**: New `ColumnsListClient.tsx`
- **Result**: ✅ Columns list with EN/KO toggle, sorted by date

## Iteration 6 — Navigation: Columns Link
- **Change**: Added "Columns" link to desktop nav
- **Result**: ✅ Users can navigate to columns from homepage

## Iteration 7 — What We Do Cards Updated
- **Change**: Updated FeaturesSection cards to: AI Research & Analysis, Agent Architecture Design, Open Community
- **Description**: Korean descriptions per spec
- **Result**: ✅ 3 cards with Korean text

## Iteration 8 — FeaturesSection Subtitle KO
- **Change**: Subtitle changed to "AI의 미래를 탐구하는 세 가지 트랙"
- **Result**: ✅

## Iteration 9 — Column Content CSS (Medium Style)
- **Change**: Added `.column-content` styles to `globals.css` — h2/h3/hr/blockquote/p spacing
- **Mobile**: 16px/28px for mobile columns
- **Result**: ✅ Clean article typography

## Iteration 10 — Korean Typography CSS
- **Change**: Added `word-break: keep-all` for Korean, confirmed letter-spacing 0.03em/0.01em
- **Result**: ✅ Typography matches spec

## Iteration 11 — Deploy (Iteration 2-10 batch)
- **Result**: ✅ Deployed to hypeproof-ai.xyz

## Iteration 12 — Columns List Default Locale
- **Change**: Changed default locale from 'en' to 'ko' in ColumnsListClient
- **Result**: ✅ Columns list shows Korean content first

## Iteration 13 — Homepage Column Links
- **Change**: Changed homepage column links from `?lang=en` to `?lang=ko`
- **Result**: ✅ Homepage columns link to Korean versions

## Iteration 14 — Deploy
- **Result**: ✅ Deployed

## Iteration 15 — EN|KO Toggle in Header
- **Change**: Replaced LanguageSwitcher dropdown with simple `EN | KO` inline toggle
- **Component**: `SimpleLanguageToggle` in Navigation.tsx
- **Result**: ✅ Clean EN|KO toggle in header

## Iteration 16 — Deploy
- **Result**: ✅ Deployed

## Iteration 17 — KO Column: Claude Opus 4.6
- **Change**: Created `ko/2026-02-06-claude-opus-4-6-alignment.md` — Korean translation
- **Result**: ✅

## Iteration 18 — KO Column: OpenAI Agents SDK
- **Change**: Created `ko/2026-02-05-openai-agents-sdk.md` — Korean translation
- **Result**: ✅

## Iteration 19 — Deploy (with all KO columns)
- **Result**: ✅ Deployed — now 3 columns in both KO and EN

## Iteration 20 — Column Detail Typography (KO/EN specific)
- **Change**: Column article applies locale-specific letter-spacing and line-height
- **KO**: tracking-[0.03em] leading-[1.8], EN: tracking-[0.01em] leading-[1.7]
- **Result**: ✅ Already implemented in ColumnArticle.tsx

## Iteration 21 — Mobile Column Responsive (390px)
- **Change**: CSS media query for mobile columns (16px/28px body)
- **Verified**: Screenshot at 390px width — content readable, nav compact
- **Result**: ✅

## Iteration 22 — Column URL Pattern
- **Spec**: `/columns/2026-02-10-era-of-the-chairman`
- **Verified**: Working with `?lang=ko` and `?lang=en` query params
- **Result**: ✅

## Iteration 23-25 — Visual Verification
- Screenshots captured: Desktop column (KO), Desktop column (EN), Mobile column (KO)
- Homepage hero, What We Do section, Navigation
- All verified working correctly
- **Result**: ✅

## Iteration 26 — Typography word-break
- **Change**: Added `[lang="ko"], .lang-ko { word-break: keep-all; }` to globals.css
- **Result**: ✅ Korean text no longer breaks mid-word

## Iteration 27 — Deploy
- **Result**: ✅ Deployed

---

## Status Summary (Iteration 27)

### Phase 1: Build Fix + Deploy ✅
- Build passes, deployed to Vercel

### Phase 2: Column System ✅
- MD-based content from `src/content/columns/{ko,en}/`
- "회장님의 시대가 열리다" added (KO + EN)
- Medium-style column page (680px, 18px/32px, author photo, sticky nav)
- URL: `/columns/2026-02-10-era-of-the-chairman`

### Phase 3: Typography + Mobile ✅
- KO: 0.03em letter-spacing, 1.8 line-height
- EN: 0.01em letter-spacing, 1.7 line-height
- Mobile 390px responsive ✅

### Phase 4: What We Do ✅
- 3 cards: AI Research & Analysis, Agent Architecture Design, Open Community
- Korean descriptions

### Phase 5: i18n ✅
- EN|KO toggle in header
- Column pages support `?lang=ko` / `?lang=en`
- Columns list has locale switcher
