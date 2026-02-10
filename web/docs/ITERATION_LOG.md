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
