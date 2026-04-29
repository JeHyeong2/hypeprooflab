# Migration & Refactor RFC

> HypeProof Lab 서버 기반 전환 + 페이지 전체 리뉴얼 마스터 플랜.
> 본 문서는 **결정 기록(decision log)이자 작업 가이드**다. 변경이 생기면 본 문서부터 갱신한 뒤 코드를 손댄다.

**Branch**: `feat/migration-and-refactor`
**Started**: 2026-04-27
**Owner**: @jayleekr (감독), Claude (실무)

---

## 1. 배경

현재 사이트(`https://hypeproof-ai.xyz`)는 이미 Next.js 16 App Router + Vercel 서버 런타임으로 동작하지만, **콘텐츠는 markdown 파일**(`web/src/content/{columns,novels,research}/*.md`)로 저장되어 있다. 이 때문에:

- 새 글 발행 = 재빌드 + 재배포 필수 → 글 1개 추가에 수 분 소요
- 작성·편집 인터페이스가 없음 → 모든 발행이 markdown 직접 편집
- 멤버 간 실시간 소통이 외부(Discord)에 의존
- 댓글·좋아요 등 인터랙션은 있으나 실시간 푸시 부재

본 RFC는 이를 **DB 기반 + 실시간 + 통합 백오피스**로 전환한다.

---

## 2. 작업 트랙

### 트랙 1 — 콘텐츠 DB화 (markdown → Supabase)
재빌드 없이 발행 가능한 구조로 전환.

- **1A. 듀얼 소스** — Supabase에 `articles`, `novels`, `research_posts` 테이블 추가. `lib/columns.ts` 등을 DB 우선 + markdown fallback으로 변경. seed script로 기존 .md 일괄 이전.
- **1B. 어드민 UI** — `/admin/posts` 마크다운 에디터. 발행 시 `revalidateTag()`로 즉시 반영.
- **1C. markdown 폐기** — 듀얼 소스 검증 후 `src/content/` 제거. `/write-column` 등 스킬도 DB 모드로.

### 트랙 2 — 실시간 인터랙션
- **2A. Realtime 댓글** — 기존 `comments` 테이블에 Supabase Realtime 구독 추가.
- **2B. 알림** — `notifications` 테이블 + 헤더 종 아이콘. 멘션·답글·좋아요 시 unread count.

### 트랙 3 — 백오피스 메신저 (슬랙 스타일)
Discord에서 진행 중인 소통을 자체 페이지에서. 문서 인라인 참조 가능.

- **3A. MVP 채널 채팅** — 테이블: `channels`, `channel_members`, `messages`, `mentions`. 페이지: `/back-office/channels/[id]`. Realtime + presence.
- **3B. 문서 인라인 참조** — `[[col:slug]]` 또는 `/cite slug` 슬래시 명령 → 메시지에 콘텐츠 카드 렌더.
- **3C. DM·스레드·첨부** — 1:1 DM, 스레드 답장, Supabase Storage 첨부.
- **3D. Discord 브리지(선택)** — Herald 봇 위에 양방향 미러링. 점진 이주용.

### 트랙 4 — 페이지 전체 리뉴얼
사용자 요청: "페이지 전체 수정 작업". 범위/방향은 트랙 1·2·3 진행하면서 별도 확정.

---

## 3. 의존 그래프 / 추천 순서

```
1A (DB 듀얼소스) ─┬─→ 1B (어드민 UI) ─→ 1C (markdown 폐기)
                  │
                  ├─→ 2A (Realtime 댓글) ─→ 2B (알림)
                  │
                  └─→ 3A (메신저 MVP) ─→ 3B (문서 참조) ─→ 3C ─→ 3D
```

**1A부터** — 다른 거의 모든 게 이 위에 올라간다. 2~3개월 로드맵.

---

## 4. 콘텐츠 인벤토리 (현 상태 스냅샷)

2026-04-27 점검 기준:

| 타입 | KO | EN | 합 | frontmatter 복합 필드 |
|---|---|---|---|---|
| columns | 34 | 34 | 68 | `citations`(2개), `references`(1개), `howto`(0), `articleType`(0) |
| novels | 32 | — | 32 | series/volume/chapter/aiModel/authorImage |
| research | 43 | 43 | 86 | citations 거의 없음 |
| **합계** | | | **186** | 98.9%가 단순 flat frontmatter |

→ multi-line YAML 케이스 0건. 자체 파서가 못 읽는 글 0건. **마이그레이션 깨끗하게 됨.**

---

## 5. 데이터베이스 스키마 (트랙 1)

### 5.1 articles (columns 대응)
```sql
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  locale TEXT NOT NULL,                -- 'ko' | 'en'
  title TEXT NOT NULL,
  creator TEXT NOT NULL,
  creator_image TEXT,
  date DATE NOT NULL,
  updated DATE,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  read_time TEXT,
  excerpt TEXT,
  citations JSONB,
  references_list JSONB,
  author_type TEXT,                    -- 'human' | 'ai'
  body TEXT NOT NULL,
  status TEXT DEFAULT 'published',     -- 'draft' | 'published'
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slug, locale)
);
```

### 5.2 novels (KO 전용)
```sql
CREATE TABLE novels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  series TEXT NOT NULL,
  volume INT,
  chapter INT,
  author TEXT NOT NULL,                -- AI 페르소나명: 'CIPHER'
  author_human TEXT,                   -- 실제 작가: 'Jay'
  author_image TEXT,
  ai_model TEXT,                       -- 'Claude Opus 4.6' (UI 비표시 — CLAUDE.md 규칙)
  date DATE,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  read_time TEXT,
  excerpt TEXT,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.3 research_posts
```sql
CREATE TABLE research_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  creator TEXT,
  creator_image TEXT,
  date DATE NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  excerpt TEXT,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slug, locale)
);
```

### 5.4 RLS 정책 원칙
- 서버는 `SUPABASE_SERVICE_ROLE_KEY` 사용 → RLS 우회 (이미 패턴 정해진 상태, `lib/supabase.ts` 참조)
- 클라이언트(anon)에서 직접 SELECT 가능: `status='published'`인 행만
- INSERT/UPDATE/DELETE: 클라이언트 직접 금지, 항상 API 라우트 경유 → 권한 검증

### 5.5 마이그레이션 SQL 파일 위치
`web/supabase/migrations/003_content.sql` (이번 RFC 커밋과 함께 추가)

---

## 6. 검증 전략 (트랙 1A)

duals source 활성화 후 byte-identical 보장 테스트:

```bash
# 같은 글을 fs와 DB에서 가져와 SSR HTML diff
curl 'http://localhost:3000/columns/era-of-the-chairman?source=fs' > a.html
curl 'http://localhost:3000/columns/era-of-the-chairman?source=db' > b.html
diff a.html b.html   # 0 bytes 차이여야 통과
```

frontmatter 파싱 차이로 diff가 나면 seed script 보강. 통과 후에만 1B(어드민 UI) 진행.

---

## 7. 미해결 결정 (Open Questions)

진행 중 결정 필요. 답이 정해지지 않은 항목은 본 문서에 **TBD** 로 표시되며, 결정되는 시점에 본 문서를 갱신한다.

| # | 질문 | 옵션 | 현재 디폴트 |
|---|---|---|---|
| Q1 | Discord와의 관계? | 대체 / 병행 / 브리지(양방향 미러) | **TBD** (메신저 MVP 시작 전 결정) |
| Q2 | 백오피스 메신저 외부 공개? | 멤버 전용 / spectator도 read-only | **멤버 전용** (보수적 디폴트) |
| Q3 | 콘텐츠 참조 UX? | `[[slug]]` 위키 / `/cite` 슬래시 / URL unfurl | **URL unfurl + 슬래시 보조** (Slack 스타일) |
| Q4 | 마크다운 에디터? | Tiptap (WYSIWYG) / Lexical / CodeMirror (raw md) | **Tiptap** (협업·실시간 강점) |
| Q5 | 메신저 검색 강도? | Postgres ILIKE / Postgres FTS / Meilisearch | **Postgres FTS** (별도 인프라 없이 한국어 색인 가능) |
| Q6 | 배포 흐름 — 현재 모순 | CLAUDE.md "Vercel: Git 미연결" vs `.github/workflows/ci.yml`의 main push 자동 deploy | **GitHub Actions 자동 deploy 채택** + CLAUDE.md 갱신 (이번 마이그레이션과 함께) |
| Q7 | 외부 기고 정책 | Closed / Trusted-only / Open — 자세한 시나리오는 §7.1 | **TBD** (트랙 1B 어드민 UI 안정 후 결정) |
| Q8 | 외부 기고 게이트 | 어드민 100% 검토 / 에이전트 필터+spot-check / 자동발행+사후검토 — §7.1 | **TBD** (Q7과 묶어 결정) |
| Q9 | 번역 정책 | 작성자 책임 / 에이전트 초안+작성자 검토 / 어드민 발행권 — §7.1 | **TBD** (내부 1B에선 자동 권장) |

### 7.1 외부 기고 시나리오 분석

커뮤니티 확장 시 외부에서 칼럼/리서치를 기고받는 경우의 설계 매트릭스. 세 축(Q7/Q8/Q9)이 독립적이지 않고 정합적인 조합이 있다 — 마지막에 추천 조합 3가지로 정리.

#### Q7. 외부 기고 정책 — 누가 글을 쓸 수 있는가

| 옵션 | 의미 | 권한 모델 | 추가 인프라 | 어드민 부담 | 적합 시점 |
|---|---|---|---|---|---|
| **A. Closed** | 멤버 7명만 작성. 외부는 read·comment·like 가능 | 현재 그대로 (admin/author/spectator) | 없음 — 현재 운영 유지 | 0 | 초기 정체성 확립 단계, lab 폐쇄 운영 |
| **B. Trusted-only** | 어드민이 초대·승인한 외부인만 author 권한 받음. 게스트 칼럼 형식 | `contributor` 신규 role 추가 → 신청 → 승인 → `author`로 승격 | 신청 폼(`/apply`), 승인 큐, 멤버 디렉토리 확장 | 신청자 검토 (월 X건) | 활성화 후 점진 확장. 양질 유지 |
| **C. Open** | 가입한 누구나 글 제출. 모든 글이 어드민 큐로 | 새 가입 = `contributor` 자동, 어드민 검토 후 발행 | 모더레이션 큐, 자동 필터, 신고 시스템 | 모더레이션 (자동화 정도에 따라 큰 폭) | 자동화·인력 갖춘 후. 커뮤니티 폭발 단계 |

#### Q8. 게이트 — 발행까지 누가 어떻게 통과시키는가

| 옵션 | 흐름 | 발행 속도 | 품질 통제 | 자동화 | 리스크 |
|---|---|---|---|---|---|
| **A. 어드민 100% 검토** | 제출 → 어드민 큐 → 검토 → 발행 | 수 시간 ~ 수 일 | 최고 | 대시보드만 필요 | 어드민 병목, 작성자 이탈 |
| **B. 에이전트 1차 필터 + spot-check** ⭐ | 제출 → `claude -p` 모더레이터 → 통과 시 자동 발행 → 어드민 사후 점검 | 수 분 | 높음 | 모더레이터 에이전트 필수 (스팸·욕설·중복·표절·인용 검증) | 에이전트 false negative (놓침) |
| **C. 자동 발행 + 사후 검토** | 즉시 발행 → 신고 시 takedown | 즉시 | 낮음 | 신고 시스템 + 자동 takedown | 평판/법적 리스크. Reddit 식 운영. |

> **B의 모더레이터 에이전트 자동 점검 항목**: 스팸 점수 / 명예훼손 등 위반 / 표절·중복 콘텐츠 / 인용 정확성(citations URL 살아있는지) / 카테고리 일관성 / Red Lines 위반 (CLAUDE.md "실명 고객사 금지" 등)

#### Q9. 번역 정책 — KO·EN 누가 만드는가

| 옵션 | 흐름 | 작성자 부담 | 어드민 부담 | 품질 | 인프라 |
|---|---|---|---|---|---|
| **A. 작성자 책임** | KO/EN 둘 다 작성자가 직접 입력 | ⬆⬆ (이중 작업, 영어 능력 필수) | 0 | 100% 작성자 voice | 폼에 KO/EN 두 필드 |
| **B. 에이전트 초안 + 작성자 검토** ⭐ | 작성자 KO 작성 → `claude -p` 번역 → 작성자 검토·수정 → 발행 | ⬆ (KO만 작성, EN은 검토만) | 0 | 80% 자동, 작성자가 voice 보정 | 번역 에이전트 + 사이드바이사이드 에디터 |
| **C. 어드민 발행권** | 작성자 KO만 → 에이전트 자동 EN → 어드민 검토 → 발행 | 0 (KO만) | ⬆ (영문 톤까지 책임) | 어드민 voice 통일됨 | 어드민 큐에 KO/EN 동시 표시 |

#### 추천 조합 3가지 (정합성 있는 셋)

```
[조합 1] Conservative                 = Q7-A + Q8-A + Q9-A
       Closed lab (현재 그대로)
       → 외부 안 받음. 멤버 7명이 KO/EN 둘 다 직접 작성.
       → 트랙 1B는 내부 어드민 전용.
       → 적합: lab 정체성 확립 단계 (지금 ~ 6개월)

[조합 2] Curated  ⭐ (저자 추천)         = Q7-B + Q8-B + Q9-B
       Trusted contributor + agent filter + agent translate hybrid
       → 어드민이 초대한 외부인 author 권한.
       → 제출 시 모더레이터 에이전트 통과 → 자동 발행 → 어드민 사후 점검.
       → KO 작성 → 번역 에이전트 EN 초안 → 작성자 검토 후 발행.
       → 적합: 트랙 1B 어드민 UI 안정화 후 (3-6개월)

[조합 3] Community                    = Q7-C + Q8-B + Q9-C
       Open submission + agent filter + admin-translate
       → 누구나 제출 가능.
       → 에이전트 1차 필터 + 어드민 spot-check.
       → KO만 작성하면 어드민이 EN까지 검토하고 발행.
       → 적합: 자동화 성숙 + 어드민 인력 충분한 후 (1-2년)
```

#### DB 스키마 영향 (조합 2 또는 3 채택 시)

```sql
-- profiles role enum 확장
ALTER TYPE user_role ADD VALUE 'contributor' BEFORE 'spectator';

-- articles에 작성자 추적 + 검토 상태 추가
ALTER TABLE articles
  ADD COLUMN author_user_id TEXT REFERENCES profiles(user_id),
  ADD COLUMN review_state   TEXT NOT NULL DEFAULT 'draft',
    -- 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'published'
  ADD COLUMN moderation_flags JSONB,
    -- 모더레이터 에이전트의 자동 점검 결과
  ADD COLUMN translation_origin TEXT;
    -- 'human' | 'agent-draft' | 'agent-edited' | 'admin-edited'

-- 검토 큐 색인
CREATE INDEX idx_articles_review_state ON articles (review_state, created_at DESC);

-- novels, research_posts에도 동일 패턴 (필요 시)
```

#### 결정 시점

- **트랙 1B(내부 어드민 UI) 짤 때 Q7=A로 가정**하고 만들면, 이후 B/C 확장 시 새 role + state machine만 얹으면 됨
- Q9는 1B 시작 시 결정 필요 (에디터 UI가 KO/EN 어떻게 다룰지에 영향)
- Q7/Q8은 트랙 1B 안정화 후(3-6개월) 결정해도 늦지 않음

---

## 8. 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-04-27 | RFC 신설, 트랙 1·2·3 정의, 콘텐츠 인벤토리 + 스키마 설계 확정 | 첫 commit |
| 2026-04-27 | §7에 Q7-Q9 추가 (외부 기고 정책 / 게이트 / 번역 정책). §7.1 시나리오 분석 신설 — 옵션별 매트릭스 + 추천 조합 3가지 + DB 스키마 영향 설계 | "글쓰기 버튼" UX 도입 시 결정 필요 |

---

## 9. 관련 문서

- `docs/SEO-INDEXING.md` — 색인·사이트맵 운영 (선결 fix 완료, 2026-04-27)
- `CLAUDE.md` — 프로젝트 전체 지침 (배포 흐름은 Q6에서 갱신 예정)
- `web/supabase/migrations/` — DB 스키마 변경 이력
- `web/src/lib/{columns,novels,research}.ts` — 듀얼 소스화 대상

---

## 10. 다음 액션

본 RFC 머지 직후:

1. `web/supabase/migrations/003_content.sql` 작성 (이번 커밋에 포함)
2. Supabase 프로젝트에 003 적용 (`npx supabase db push` — 별도 단계, **실행 시 운영 DB 변경**)
3. `scripts/seed-content.ts` 작성 — `gray-matter`로 .md 186개 → DB 일괄 insert (멱등 upsert)
4. `lib/columns.ts` 듀얼 소스화 — `?source=db` 쿼리로 분기, 검증 후 디폴트 변경
5. 검증 통과 시 1B 어드민 UI 착수
