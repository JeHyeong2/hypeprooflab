# HypeProof Website Redesign Spec

## Current State
- **Repo**: https://github.com/jayleekr/hypeprooflab.git
- **Stack**: Next.js 16 + React 19 + Tailwind + Framer Motion
- **Status**: 배포 깨져있음 (검은 화면), 콘텐츠 하드코딩
- **Members photos**: `/public/members/` (jay.png, jy.png, kiwon.svg, ryan.png, sebastian.png, tj.svg)
- **Columns**: 하드코딩 (slug page에 직접 content 배열)

## Issues to Fix (Jay Feedback)

### 1. 자간 (Letter Spacing)
- 전체적으로 너무 좁음
- Korean: `letter-spacing: 0.03em`, `line-height: 1.8`
- English: `letter-spacing: 0.01em`, `line-height: 1.7`
- Body: 18px desktop, 16px mobile

### 2. Mobile 미대응
- 반응형 미적용 부분 수정
- Mobile-first 재설계
- 390px (iPhone) 기준 테스트

### 3. "What We Do" 부족
- 현재 FeaturesSection 이 빈약
- 어라인 안 맞음
- 카드형 3가지:
  - **AI Research & Analysis**: 최신 AI 기술 리서치 + 심층 분석 칼럼
  - **Agent Architecture Design**: 멀티 에이전트 시스템 설계 + 실전 구축
  - **Open Community**: 디스코드 기반 AI 엔지니어 커뮤니티

### 4. Column Page (Medium-style)
- 현재 dark theme + glass morphism → Medium 스타일 리딩 경험으로
- **Max width**: 680px reading area
- **Typography**: 
  - Title: 32px/42px bold
  - Body: 18px/32px (desktop), 16px/28px (mobile)
  - 넉넉한 자간/행간
- **Author block**: 실제 사진 (jay.png) + 이름 + 날짜 + 읽기 시간
- **Section dividers**: subtle gray line, margin 48px
- **Sticky header**: compact nav + language toggle

### 5. 다국어 (i18n)
- EN default, KO toggle
- Header 우측 `EN | KO` 토글
- URL: `/en/columns/...` / `/ko/columns/...`
- 칼럼 번역: Opus로 KO → EN

### 6. Column Content System
- 하드코딩 → **MDX 기반** or **content/ 디렉토리 JSON/MD**
- frontmatter: title, author, date, category, tags, slug, readTime, excerpt
- URL: `/[locale]/columns/YYYY-MM-DD-slug`

### 7. 배포 수정
- 현재 빌드 깨짐 → 수정 후 Vercel 재배포
- `vercel --prod` or git push

## Design Reference
- **Column page**: Medium.com article layout
- **Landing**: 현재 dark theme 유지, 다만 spacing/typography 수정
- **Mobile**: Medium mobile reading experience

## File Structure Target
```
src/
├── app/
│   ├── [locale]/           # NEW: i18n routing
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Landing
│   │   └── columns/
│   │       ├── page.tsx    # Column list
│   │       └── [slug]/
│   │           └── page.tsx # Column detail (Medium-style)
│   └── globals.css
├── content/
│   └── columns/
│       ├── ko/
│       │   └── 2026-02-10-era-of-the-chairman.md
│       └── en/
│           └── 2026-02-10-era-of-the-chairman.md
├── components/
│   ├── layout/
│   ├── sections/
│   └── columns/
│       ├── ColumnLayout.tsx    # Medium-style reading layout
│       ├── AuthorProfile.tsx   # Author photo + bio
│       └── LanguageToggle.tsx  # EN/KO switch
└── lib/
    ├── columns.ts              # Content loading from files
    └── i18n.ts
```
