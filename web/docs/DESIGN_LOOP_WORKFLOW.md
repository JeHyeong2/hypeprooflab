# HypeProof Website — Recursive Design Loop Workflow

## Overview

```
MD 작성 → Design/Code → Deploy (Vercel) → Screenshot 테스트 → 피드백 → Redesign
                                                                    ↑         │
                                                                    └─────────┘
                                                                    (재귀 루프)
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Content**: MDX (Markdown → 페이지 자동 변환)
- **i18n**: next-intl (EN default, KO toggle)
- **Deploy**: Vercel (Git push → auto deploy)
- **Translation**: Claude Opus (KO → EN)

### Directory Structure
```
hypeproof/web/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Root layout (locale wrapper)
│   │   ├── page.tsx            # Landing page
│   │   └── columns/
│   │       ├── page.tsx        # Column list page
│   │       └── [slug]/
│   │           └── page.tsx    # Individual column page (Medium-style)
│   └── globals.css
├── components/
│   ├── Header.tsx              # Nav + language toggle (EN/KO)
│   ├── Footer.tsx
│   ├── ColumnCard.tsx          # Column list item
│   ├── ColumnLayout.tsx        # Medium-style reading layout
│   ├── AuthorProfile.tsx       # Author photo + bio
│   ├── LanguageToggle.tsx      # EN ↔ KO switch
│   └── WhatWeDo.tsx            # "What We Do" section (redesigned)
├── content/
│   ├── columns/
│   │   └── en/
│   │       └── 2026-02-10-era-of-the-chairman.mdx
│   │   └── ko/
│   │       └── 2026-02-10-era-of-the-chairman.mdx
│   └── authors/
│       └── jay.json            # { name, bio, photo, social }
├── public/
│   ├── authors/
│   │   └── jay.jpg             # Profile photo
│   └── og/                     # OG images for social sharing
├── lib/
│   ├── mdx.ts                  # MDX processing
│   ├── columns.ts              # Column data fetching
│   └── i18n.ts                 # i18n config
├── messages/
│   ├── en.json                 # UI strings (EN)
│   └── ko.json                 # UI strings (KO)
├── next.config.mjs
├── tailwind.config.ts
├── package.json
└── vercel.json
```

### URL Structure
```
hypeproof-ai.xyz/en/columns/2026-02-10-era-of-the-chairman    # English (default)
hypeproof-ai.xyz/ko/columns/2026-02-10-era-of-the-chairman    # Korean
hypeproof-ai.xyz/en                                            # Landing (EN)
hypeproof-ai.xyz/ko                                            # Landing (KO)
```

## Design Spec

### Column Page (Medium-style)
- **Max width**: 680px (reading area), centered
- **Font**: 
  - Title: 32px / 42px line-height, bold
  - Body: 18px / 32px line-height (넉넉한 자간/행간)
  - **letter-spacing**: 0.02em (한국어), 0.01em (영어)
- **Author block**: Profile photo (48px circle) + name + date + read time
- **Section dividers**: `---` → subtle gray line with margin 48px top/bottom
- **Mobile**: 
  - Body font 16px / 28px
  - Padding 20px horizontal
  - Full-width images
  - Sticky header with language toggle

### Landing Page Fixes
- **자간**: `letter-spacing: 0.02em` 전역 적용
- **"What We Do"**: 카드 그리드 → 아이콘 + 제목 + 설명, align center/left 통일
- **Mobile**: 햄버거 메뉴, 섹션 간 spacing 확대, font-size 조정

### Language Toggle
- Header 우측에 `EN | KO` 토글
- Default: EN
- 클릭 시 URL locale prefix 변경 (/en/ ↔ /ko/)
- 현재 언어 bold 표시

## Content Pipeline

### 새 칼럼 게시 프로세스
```
1. MD 작성 (research/columns/에 저장)
2. Korean → English 번역 (Opus)
3. MDX 변환 + frontmatter 추가
4. content/columns/ko/ + en/ 에 저장
5. git commit + push
6. Vercel auto-deploy
7. Screenshot 테스트 (desktop + mobile)
8. 피드백 → 수정 → 재배포
```

### MDX Frontmatter
```yaml
---
title: "회장님의 시대가 열리다"
titleEn: "The Era of the Chairman"
author: "jay"
date: "2026-02-10"
category: "column"
tags: ["AI Agent", "디지털 경제"]
slug: "2026-02-10-era-of-the-chairman"
readTime: "12 min"
excerpt: "에이전트가 모든 실행을 대행하는 세상에서..."
---
```

## Recursive Design Loop

### Loop Definition
```
for each iteration:
    1. IMPLEMENT — code changes based on feedback
    2. DEPLOY — git push → Vercel auto-deploy (or vercel --prod)
    3. TEST — screenshot desktop (1440px) + mobile (390px)
    4. EVALUATE — check against design spec
    5. FEEDBACK — list issues found
    6. DECIDE — fix now or backlog
```

### Evaluation Checklist
- [ ] 자간/행간 spec 대로인가 (letter-spacing, line-height)
- [ ] Mobile 390px에서 깨지는 거 없는가
- [ ] Language toggle 동작하는가
- [ ] Column 페이지 Medium 느낌 나는가
- [ ] "What We Do" 정렬 맞는가
- [ ] Author profile 사진 + 이름 나오는가
- [ ] OG meta tags 설정됐는가
- [ ] 로딩 속도 3초 이내인가

## Agent: Column Publisher

HypeProof Org 스킬 내에 Column Publisher 에이전트 추가:

### Role
- MD 파일 → MDX 변환
- KO → EN 번역 (Opus)
- content/ 디렉토리에 저장
- git push → Vercel deploy 트리거
- Screenshot 테스트 실행
- 결과 보고

### Trigger
- `칼럼 올려줘` / `이 글 hypeproof에 게시해줘`
- MD 파일 경로 + 작성자 지정

---

*Created: 2026-02-10 | Status: Design Phase*
