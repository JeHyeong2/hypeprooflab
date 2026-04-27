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

---

## 8. 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-04-27 | RFC 신설, 트랙 1·2·3 정의, 콘텐츠 인벤토리 + 스키마 설계 확정 | 첫 commit |

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
