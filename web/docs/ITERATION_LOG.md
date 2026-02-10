# Iteration Log

## Iteration 1 — Baseline Deploy
- **Date**: 2026-02-10 22:25
- **Change**: Verify build passes, deploy current state as baseline
- **Status**: ✅ deployed

## Iteration 2 — EN Default + Language Toggle + Column Links
- **Date**: 2026-02-10 22:30
- **Changes**:
  - ColumnsListClient: default locale → 'en'
  - Column [slug] page: default locale → 'en'
  - Added LanguageSwitcher to desktop Navigation
  - Homepage columns cards now link to `/columns/{slug}?lang=en`
- **Deploy**: ✅ https://hypeproof-ai.xyz

## Iteration 3 — Typography + Mobile 390px
- **Date**: 2026-02-10 22:32
- **Changes**:
  - Global CSS: `html[lang="ko"]` → letter-spacing 0.03em, line-height 1.8
  - Global CSS: `html[lang="en"]` → letter-spacing 0.01em, line-height 1.7
  - Mobile 390px responsive: smaller glass border-radius, column content font adjustments
- **Deploy**: ✅ https://hypeproof-ai.xyz

## Iteration 4 — EN Content for Homepage
- **Date**: 2026-02-10 22:34
- **Changes**:
  - Homepage columns preview: EN titles/excerpts
  - FeaturesSection: 3 cards with EN descriptions (AI Research, Agent Architecture, Open Community)
  - CommunityHero: all text → EN
- **Deploy**: ✅ https://hypeproof-ai.xyz

## Iteration 5 — Mobile Article Improvements
- **Date**: 2026-02-10 22:36
- **Changes**:
  - Column article: responsive padding (px-4 sm:px-6, py-8 sm:py-12)
  - Title: text-2xl sm:text-3xl md:text-[32px] for mobile
  - Columns list: responsive padding
- **Deploy**: ✅ https://hypeproof-ai.xyz

## Iteration 6 — FeaturesSection EN + Grid Fix
- **Date**: 2026-02-10 22:38
- **Changes**:
  - FeaturesSection descriptions → English
  - Subtitle → "Three tracks to explore the future of AI"
  - Grid: `grid-cols-1 md:grid-cols-3` (was sm:grid-cols-2 lg:grid-cols-3)
  - KO column translations created for all 3 articles
- **Deploy**: ✅ https://hypeproof-ai.xyz
- **Git**: d90528a

## Iteration 7 — Fix Columns List EN Default (for real)
- **Date**: 2026-02-10 22:42
- **Changes**:
  - ColumnsListClient useState default fixed to 'en' (was reverted in previous commit)
  - Verified: columns page now shows EN by default
  - Verified: article page renders Medium-style with author photo, proper typography
- **Deploy**: ✅ https://hypeproof-ai.xyz
- **Git**: f38a162

## Summary of All Changes
- ✅ Build errors: none (build was clean from start)
- ✅ Column system: MD-based in `src/content/columns/{en,ko}/`
- ✅ Column page: Medium-style (680px, 18px/32px, author photo)
- ✅ Typography: letter-spacing 0.03em (KO), 0.01em (EN); line-height 1.8 (KO), 1.7 (EN)
- ✅ Mobile 390px: responsive padding, font sizes
- ✅ "What We Do": 3 cards — AI Research / Agent Architecture / Open Community
- ✅ i18n: EN/KO toggle in nav, EN default everywhere
- ✅ All homepage text in English
- ✅ 7 deploys to production
