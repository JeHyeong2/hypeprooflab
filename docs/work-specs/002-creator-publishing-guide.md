# Work Spec #002: Creator Publishing Guide & Submission Flow

## Assignee: JeHyeong
## Priority: P1
## Due: 2026-04-25

---

## Goal

크리에이터가 Jay 없이 글을 쓰고 발행 요청할 수 있는 셀프서비스 환경.
현재는 Jay가 `/write-column` 실행 안 하면 아무것도 안 나옴.

## Background

- 크리에이터 7명 (JY, Ryan, Kiwon, TJ, BH, JeHyeong, Simon)
- 콘텐츠: 칼럼 (KO/EN), 리서치, 소설
- 발행 경로: `web/src/content/columns/ko/<slug>.md` + `en/<slug>.md`
- Frontmatter 규칙: `.claude/skills/content-standards/SKILL.md`
- QA: Herald agent (GEO scoring)

## Spec

### 1. Creator Publishing Guide

**파일**: `docs/creator-guide.md` (웹에서도 접근 가능하도록 향후 웹 페이지화)

**내용**:
- 칼럼 작성법 (마크다운, frontmatter 필수 필드)
- 카테고리 분류 (content-standards 참고)
- 이미지 추가 방법 (`web/public/` 경로)
- KO/EN 쌍 작성 규칙
- 제출 방법 (아래 2번 참고)
- 리뷰 프로세스 (AI Editorial Director → Herald QA → 발행)
- 예시 칼럼 링크

### 2. Submission Flow (MVP)

**Phase 1 (GitHub PR 기반)**:
```
Creator가 마크다운 파일 작성
  → web/src/content/columns/ko/<slug>.md 생성
  → (선택) en/<slug>.md 생성
  → GitHub PR 생성
  → CI 빌드 체크 (Work Spec #001)
  → Jay or AI 리뷰
  → 머지 → 배포
```

**가이드에 포함할 것**:
- GitHub web editor로 파일 생성하는 방법 (IDE 없이)
- frontmatter 템플릿 (복붙용)
- PR 제목 컨벤션: `[content] <topic>`

### 3. Frontmatter Template

`docs/templates/column-template.md` 생성:
```markdown
---
title: ""
creator: ""
date: "YYYY-MM-DD"
category: ""
tags: []
slug: ""
readTime: ""
excerpt: ""
creatorImage: "/members/<name>.png"
---

(본문)
```

### 4. (Stretch) Web Submission UI

향후 웹에서 직접 제출할 수 있는 `/submit` 페이지.
이번 스펙에서는 가이드 문서 + 템플릿만.

## Acceptance Criteria

- [ ] `docs/creator-guide.md` 작성됨
- [ ] `docs/templates/column-template.md` 작성됨
- [ ] 크리에이터가 가이드만 보고 PR을 올릴 수 있음 (JY에게 테스트 요청)
- [ ] content-standards 스킬과 일관성 있음

## Reference

- `.claude/skills/content-standards/SKILL.md` — frontmatter schema, categories
- `.claude/skills/column-workflow/SKILL.md` — column pipeline rules
- `web/src/content/columns/ko/` — existing columns (examples)
- `novels/authors/editorial-director.yaml` — AI editorial standards
- `ROLES.md` — role definitions
