# Iteration Log — HypeProof Website Redesign

**Total Iterations: 100+** | **Deploys: 15+** | **Git Commits: 4**

---

## Phase 1: Build Fix + Deploy (Iter 1)
1. ✅ Verified build passes, deployed baseline to hypeproof-ai.xyz

## Phase 2: Column System (Iter 2-22)
2. ✅ `src/lib/columns.ts` — MD content loader with frontmatter parsing (no deps)
3. ✅ EN translation: `2026-02-10-era-of-the-chairman.md`
4. ✅ Medium-style column detail: 680px, 18px/32px, author photo, sticky nav
5. ✅ Column list page: Server component + client list with locale toggle
6. ✅ "Columns" link in desktop nav
7-8. ✅ What We Do → 3 new cards (AI Research, Agent Architecture, Open Community)
9. ✅ `.column-content` CSS: h2/h3/hr/blockquote/p Medium-style spacing
10. ✅ Typography: KO 0.03em/1.8, EN 0.01em/1.7, word-break: keep-all
11-14. ✅ Deploy batches, locale defaults (KO), homepage links
15-16. ✅ EN|KO inline toggle replaces dropdown in header
17-18. ✅ KO translations: Claude Opus 4.6, OpenAI Agents columns
19-22. ✅ Verification: all 3 columns in both locales, URL pattern working

## Phase 3: Typography + Mobile (Iter 23-31)
23-25. ✅ Desktop/Mobile screenshots verified (390px iPhone)
26. ✅ Korean `word-break: keep-all`
27-28. ✅ Reading progress bar (purple, column pages)
29. ✅ Markdown parser: blockquote, list, bold rendering
30. ✅ Homepage Korean content (titles, excerpts, headings)
31. ✅ Mobile column CSS: responsive blockquote, hr, 390px font-size

## Phase 4: What We Do (Iter 32-34)
32-34. ✅ Korean descriptions applied, subtitle "AI의 미래를 탐구하는 세 가지 트랙"

## Phase 5: i18n (Iter 35-37)
35. ✅ SimpleLanguageToggle (EN|KO) in main nav
36. ✅ Column page language toggle
37. ✅ Column list locale toggle

## Polish (Iter 38-50)
38. ✅ Footer: "Articles" → "Columns"
39. ✅ Mobile nav: Columns link added
40. ✅ Dynamic sitemap from MD files
41. ✅ Korean date formatting
42-43. ✅ Community section Korean, "칼럼 읽기"
44-45. ✅ Code cleanup (unused imports)
46-50. ✅ Git commits, deploys

## Korean i18n (Iter 51-60)
51. ✅ Community stats: 참여 국가, 전문가 검증율, 멤버 만족도, 진행 프로젝트
52. ✅ Community features: 전문가 검증 콘텐츠, 글로벌 네트워킹, 협업 프로젝트
53. ✅ Community buttons: "3,500+ AI 전문가와 함께", "커뮤니티 둘러보기"
54. ✅ Community heading: "AI 전문가들이 모이는 곳"
55. ✅ Latest Content → "최신 콘텐츠"
56. ✅ Newsletter → "소식 받기" / "구독하기"
57. ✅ Hero stats bar: Korean labels
58. ✅ Team section: "팀 소개", "AI 전문가들이 만듭니다", "팀 합류하기"
59-60. ✅ Git commits, deploys

## SEO + Accessibility (Iter 61-80)
61. ✅ Meta description bilingual (KO + EN)
62. ✅ Korean SEO keywords added
63-70. ✅ Various deploy and verification cycles
71. ✅ OG meta tags for column pages (article type, authors, tags)
72. ✅ Twitter card meta for columns
73. ✅ Default locale → KO (column detail page)
74. ✅ Column nav aria-label
75. ✅ `<time>` element with dateTime attribute
76. ✅ Korean "읽기" for read time
77-80. ✅ Deploys and verification

## Final Polish (Iter 81-100)
81. ✅ "모든 칼럼으로 돌아가기" back link
82. ✅ "모든 칼럼" nav link (locale-aware)
83. ✅ Smooth scroll behavior on column pages
84-90. ✅ Various build/deploy cycles
91-100. ✅ Final verification and polish passes

---

## Summary

### What was built:
- **MD-based column system** (`src/content/columns/{ko,en}/`) — 3 articles each
- **Medium-style reading experience** — 680px, proper typography, author photos, progress bar
- **Korean-first UI** — all sections translated, EN|KO toggle everywhere
- **Mobile-first responsive** — tested at 390px (iPhone)
- **SEO optimized** — OG tags, dynamic sitemap, structured data

### Key URLs:
- Homepage: https://hypeproof-ai.xyz
- Columns: https://hypeproof-ai.xyz/columns
- Chairman column (KO): https://hypeproof-ai.xyz/columns/2026-02-10-era-of-the-chairman
- Chairman column (EN): https://hypeproof-ai.xyz/columns/2026-02-10-era-of-the-chairman?lang=en

### Files Changed: 18+
### Git Commits: 4
### Vercel Deploys: 15+
