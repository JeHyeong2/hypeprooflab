# Migration 테스트 환경 가이드

> 트랙 1A (markdown → Supabase) 마이그레이션을 **운영 DB를 건드리지 않고** 검증하기 위한 로컬 테스트 환경.
> 본 문서는 `docs/MIGRATION-RFC.md` §6(검증 전략)의 실행 매뉴얼이다.

---

## 0. 한 줄 요약

```bash
cd web
cp .env.test.example .env.test
set -a && source .env.test && set +a
npm run db:start          # Docker 위에 로컬 Supabase 스택 기동 (≈30초)
npm run test:migration    # reset → 003 적용 → seed → verify
npm run db:stop           # 종료
```

**`test:migration`이 종료 코드 0이면 마이그레이션은 깨끗하다 — 운영 DB에 적용해도 안전.**

---

## 1. 사전 요건

| 도구 | 확인 |
|---|---|
| Docker Desktop (macOS) 실행 중 | `docker ps` 무에러 |
| Node 20+ | `node -v` |
| `web/`에서 `npm install` 완료 | `node_modules/` 존재 |
| `web/.env.test` 존재 | `cp .env.test.example .env.test` |

> **Docker 미설치 시**: https://www.docker.com/products/docker-desktop/ → 설치 후 실행. 첫 기동에 5분.
> **Apple Silicon**: Rosetta 없이 그대로 작동. 단 Postgres 컨테이너 첫 pull은 1~2분.

---

## 2. 환경 구조

```
web/
├── supabase/
│   ├── config.toml                  ← 로컬 스택 설정 (포트, 활성 서비스)
│   └── migrations/
│       ├── 001_init.sql             ← profiles/likes/bookmarks/comments
│       ├── 002_rls.sql              ← RLS 정책
│       └── 003_content.sql          ← articles/novels/research_posts (이번 추가)
│
├── scripts/
│   ├── seed-content.ts              ← src/content/*.md → Supabase 일괄 upsert
│   └── verify-content-migration.ts  ← .md vs DB row 비교, 차이 리포트
│
├── .env.test                        ← 로컬 키 (gitignored)
└── .env.test.example                ← 템플릿 (deterministic 키, 안전하게 커밋됨)
```

---

## 3. 명령어 레퍼런스

`web/`에서 실행. `set -a; source .env.test; set +a`로 env 로드 필수.

| 명령 | 동작 | 시간 |
|---|---|---|
| `npm run db:start` | Docker 컨테이너 기동 (Postgres + Auth + Storage + Studio) | 30s |
| `npm run db:status` | 로컬 스택 URL/키 출력 | 즉시 |
| `npm run db:reset` | DB 초기화 + `migrations/*.sql` 모두 적용 | 5s |
| `npm run db:seed` | 186개 .md → DB 일괄 upsert (멱등) | 10~30s |
| `npm run db:verify` | .md ↔ DB byte 비교, 차이 리포트 | 5~10s |
| `npm run db:stop` | 컨테이너 정지 (데이터 보존) | 5s |
| **`npm run test:migration`** | **reset + seed + verify 일괄 실행** ⭐ | ≈1m |

### 로컬 Studio (DB GUI)
`npm run db:start` 후 → http://127.0.0.1:54323 → 테이블 직접 조회·편집 가능.

---

## 4. 검증 항목 (`db:verify`)

각 .md 파일에 대해 DB 대응 row를 찾아 비교:

| 항목 | 체크 방식 |
|---|---|
| 존재 여부 | `(slug, locale)` 키로 row 1개 정확히 매칭 |
| `title` | 문자열 일치 |
| `body` | **byte-identical** (ReactMarkdown 렌더 동일성 보장) |
| `tags` | 배열 일치 |
| `citations`(있을 때) | JSON 일치 |
| novels: `series`/`chapter` | 정확 일치 |

**body diff가 0 bytes**여야 마이그레이션 후 페이지가 동일하게 렌더링됨 — 이게 최우선 게이트.

---

## 5. 흔한 실패 시나리오

| 실패 | 원인 | 해결 |
|---|---|---|
| `Cannot connect to the Docker daemon` | Docker 미실행 | Docker Desktop 켜기 |
| `port 54322 already allocated` | 기존 Postgres 점유 | `lsof -i :54322` → kill 또는 `[db].port` 변경 |
| `seed: column "X" does not exist` | 003 미적용 또는 migration drift | `npm run db:reset` |
| `verify: missing_in_db` | seed가 빠뜨린 파일 | seed 로그에서 해당 파일 에러 확인 |
| `verify: body_mismatch` | gray-matter 파싱이 .md의 특수 케이스를 다르게 해석 | 로그의 first-diff 위치 보고 .md 수정 또는 seed 보강 |
| `verify: tags_mismatch` | frontmatter의 `tags`가 YAML 리스트가 아닌 단일 문자열 | .md frontmatter 정규화 |

---

## 6. 운영 DB로 승격 (verify 통과 후)

테스트 통과한 *마이그레이션 SQL*을 운영에 적용:

```bash
# 1. 운영 Supabase 프로젝트에 연결
cd web
npx supabase link --project-ref <production-ref>

# 2. 003 적용 (DRY RUN — DB 변경 없이 무엇이 실행될지만 확인)
npx supabase db push --dry-run

# 3. 실제 적용
npx supabase db push
```

> ⚠️ **운영 적용은 별도 사용자 승인이 필요한 작업이다.** 테스트 통과 ≠ 자동 적용. 테스트 결과를 사람에게 보여주고 OK 받은 다음 진행.

운영 적용 후 운영 DB에 seed:
```bash
SUPABASE_URL=<prod-url> \
SUPABASE_SERVICE_ROLE_KEY=<prod-key> \
tsx scripts/seed-content.ts
```

이 단계는 **첫 1회만 필요**. 이후는 어드민 UI(트랙 1B)가 작성·발행 담당.

---

## 7. CI 통합 (향후)

`.github/workflows/test-migration.yml` 신설 예정 — PR이 `web/supabase/migrations/**` 또는 `web/src/content/**`를 건드리면 GitHub Actions에서:

1. `services: postgres:15` 컨테이너 띄우고 (Supabase 전체 스택은 무겁고 사실상 Postgres만 검증해도 충분)
2. `*.sql` 적용
3. `npm run db:seed && npm run db:verify`
4. exit code 0이어야 PR 머지 가능

이 workflow는 트랙 1A 듀얼 소스 코드가 들어간 다음에 추가한다 (지금은 로컬에서 검증).

---

## 8. 관련 문서

- `docs/MIGRATION-RFC.md` — 전체 마이그레이션 마스터 플랜 (§6 검증 전략 본문)
- `web/supabase/migrations/003_content.sql` — 이번 검증 대상 스키마
- `web/scripts/seed-content.ts` — seed 구현
- `web/scripts/verify-content-migration.ts` — 검증 구현
