# Work Spec #002: Creator Publishing Guide & Submission Flow

## Assignee: JeHyeong
## Depends on: Work Spec #001 (CI 빌드 체크)
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
- QA: Herald agent (GEO scoring) — AI Editorial Director가 품질 판단
- 멤버 이미지: `web/public/members/<name>.png`

## Spec

### 1. Creator Publishing Guide

**파일**: `docs/creator-guide.md`

**내용**:

#### 1.1 칼럼 작성법
- 마크다운 형식, frontmatter 필수
- 파일 위치: `web/src/content/columns/ko/<slug>.md`
- slug = 파일명 (확장자 제외). 예: `my-first-column.md` → slug: `my-first-column`
- EN 버전은 선택: `web/src/content/columns/en/<같은 slug>.md`

#### 1.2 Frontmatter 필수 필드

```yaml
---
title: "제목"                              # 필수
creator: "이름"                            # 필수 — displayName 기준 (Jay, JY, Ryan, Kiwon, TJ, BH, JeHyeong, Simon)
date: "2026-04-15"                         # 필수 — YYYY-MM-DD
category: "Column"                         # 필수 — Column, Opinion, Tutorial, Research, Essay 중 택1
tags: ["tag1", "tag2"]                     # 필수 — 2~5개
slug: "my-first-column"                    # 필수 — 파일명과 일치
readTime: "8분"                            # 필수
excerpt: "한 줄 요약"                       # 필수
creatorImage: "/members/<name>.png"        # 필수 — 본인 이미지 경로
lang: "ko"                                 # 필수 — "ko" 또는 "en"
authorType: "human"                        # 필수 — "human" (직접 작성) 또는 "ai" (AI 보조). "creator"는 레거시, 사용 금지
---
```

> 참고: 실제 칼럼 예시는 `web/src/content/columns/ko/` 디렉토리에서 확인

#### 1.3 카테고리 정의

> Source of truth: `.claude/skills/content-standards/SKILL.md`

| Category | 설명 |
|----------|------|
| `Opinion` | 개인 시각, 에디토리얼 |
| `Column` | 일반 칼럼 형식 |
| `Analysis` | 데이터 기반 분석 |
| `Research` | 리서치 요약/딥다이브 |
| `AI Engineering` | AI/ML 기술 구현 |
| `AI × Society` | AI의 사회적 영향 |
| `AI × Science` | 과학 분야 AI 적용 |
| `AI × Philosophy` | AI와 철학적 질문 |
| `AI × Psychology` | AI와 인지/행동 |
| `AI × Finance` | AI와 금융/경제 |
| `Tutorial` | 단계별 실습 가이드 |
| `Use Case` | 실제 적용 사례 |

새 도메인은 `AI × {Domain}` 패턴으로 추가 가능.

#### 1.4 이미지
- 본문 이미지: `web/public/` 하위에 저장, 마크다운에서 `/images/my-image.png`로 참조
- 크리에이터 이미지: `web/public/members/<name>.png` — 없으면 JeHyeong에게 요청

#### 1.5 KO/EN 쌍 규칙
- **KO + EN 둘 다 필수**
- 한국어 먼저 작성, 영어는 번역이 아니라 재작성
- 같은 slug 사용: `ko/my-column.md` + `en/my-column.md`
- `lang` 필드는 디렉토리와 일치: `ko/` → `lang: "ko"`, `en/` → `lang: "en"`

### 2. Submission Flow

```
1. 크리에이터가 마크다운 파일 작성 (위 가이드 따라)
2. GitHub에서 PR 생성:
   - web/src/content/columns/ko/<slug>.md 추가
   - web/src/content/columns/en/<slug>.md 추가 (KO/EN 둘 다 필수)
   - PR 제목: [content] <주제>
3. CI 자동 빌드 체크 (Work Spec #001)
4. 리뷰 (JeHyeong 또는 AI Herald)
5. 머지 → 배포
```

**GitHub Web Editor 사용법도 가이드에 포함**:
- github.com에서 파일 직접 생성하는 방법 (IDE 없는 크리에이터용)
- 템플릿 복붙 → 내용 채우기 → PR 생성 3단계

### 3. Frontmatter Template 파일

**파일**: `docs/templates/column-template-ko.md`

위 1.2의 frontmatter + 본문 뼈대 포함. 복붙용.

**파일**: `docs/templates/column-template-en.md`

영어 버전 템플릿.

### 4. (Stretch) Web Submission UI

향후 웹에서 직접 제출할 수 있는 `/submit` 페이지.
이번 스펙에서는 가이드 문서 + 템플릿만. 웹 UI는 별도 스펙으로.

## Acceptance Criteria

- [ ] `docs/creator-guide.md` 작성됨
- [ ] `docs/templates/column-template-ko.md` 작성됨
- [ ] `docs/templates/column-template-en.md` 작성됨
- [ ] frontmatter 필드가 실제 칼럼과 100% 일치 (lang, authorType 포함)
- [ ] GitHub Web Editor 스크린샷 또는 단계별 설명 포함
- [ ] 크리에이터가 가이드만 보고 PR을 올릴 수 있음 (JY에게 테스트 요청)

## Reference

- `.claude/skills/content-standards/SKILL.md` — 전체 콘텐츠 규칙
- `.claude/skills/column-workflow/SKILL.md` — 칼럼 파이프라인 규칙
- `web/src/content/columns/ko/` — 기존 칼럼 예시
- `novels/authors/editorial-director.yaml` — AI 에디토리얼 기준
- `ROLES.md` — 역할 정의
