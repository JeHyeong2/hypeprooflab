# Supabase Migration Runbook

> HypeProof Lab markdown → Supabase 본격 운영 전환 시 따라가는 **단일 실행 가이드**.
> [`docs/MIGRATION-RFC.md`](./MIGRATION-RFC.md)(설계·결정)와 [`docs/MIGRATION-TEST-SETUP.md`](./MIGRATION-TEST-SETUP.md)(로컬 검증) 위에 **운영 실행 절차·롤백·관찰**을 더한다.
>
> 본 문서는 시점에 의존하지 않는 영구 playbook이다. 본격 마이그레이션이 결정되면 §0 한줄요약부터 §14까지 순차로 따라가면 끝나야 한다.

**Last verified**: 2026-04-29 / Supabase CLI 1.x / Next.js 16 App Router
**Branch**: `feat/migration-and-refactor` (코드) + `docs/migration-runbook` (본 문서)
**Owner**: @jayleekr (감독), Claude (실무)

---

## 0. 한 줄 요약

```
Phase A: 환경 준비 (Vercel env + Supabase project link)
   ↓
Phase B: 운영 DB에 003_content.sql 적용 (스키마만, 데이터 0건)
   ↓
Phase C: 운영 DB에 markdown 186건 일괄 seed (1회성, 멱등)
   ↓
Phase D: Track 1A 점진 cutover — `?source=db` 카나리아 → 디폴트 전환 → research/novels 확장
   ↓
Phase E: Track 1B 어드민 UI (ADR-002 Phase 1→3)
   ↓
Phase F: Track 1C markdown 폐기 (1A+1B 90일 안정 후)
```

각 Phase는 4개 항목으로 구성된다: **사전조건 → 실행 → 검증 → 롤백**. 각 게이트를 통과하지 않으면 다음 Phase로 진입하지 않는다.

---

## 1. 사전 요건 (Pre-flight)

본격 마이그 진입 전 모두 ✅이어야 한다. 하나라도 미흡하면 그 항목부터 정리.

### 1.1 도구·계정·권한

| 항목 | 확인 명령 / 위치 |
|---|---|
| Docker Desktop 실행 | `docker ps` 무에러 |
| Node 20+ | `node -v` |
| Supabase CLI 설치 | `npx supabase --version` |
| `web/`에서 `npm install` 완료 | `node_modules/` 존재 |
| 운영 Supabase 프로젝트 admin 권한 | https://supabase.com/dashboard에서 project owner 확인 |
| Vercel 프로젝트 admin 권한 | Vercel dashboard에서 hypeproof-ai project Settings 접근 가능 |
| GitHub repo write 권한 | `gh auth status` |

### 1.2 환경 변수 매트릭스

| 변수 | local (`.env.test`) | production (Vercel) | 용도 |
|---|---|---|---|
| `SUPABASE_URL` | `http://127.0.0.1:54321` | `https://<project-ref>.supabase.co` | 서버 측 Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | local fixture key | production service_role key | 서버 측 RLS 우회. **NEXT_PUBLIC_ 접두사 절대 금지** |
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` | `https://<project-ref>.supabase.co` | 클라이언트 anon 사용 |
| `SUPABASE_ANON_KEY` | local fixture | production anon key | 클라이언트 RLS-aware 쿼리 |
| `CONTENT_SOURCE` (Phase D 이후) | `markdown`(default) | `markdown` → `db` 점진 전환 | dual-source 디폴트 분기 |

### 1.3 로컬 검증 통과

```bash
cd web
cp .env.test.example .env.test    # 최초 1회
set -a && source .env.test && set +a
npm run db:start                  # Docker 위에 로컬 Supabase 기동 (≈30s)
npm run test:migration            # reset + seed + verify (≈1m)
echo $?                           # 0이어야 함
```

**0이 아니면 진입 불가.** [`docs/MIGRATION-TEST-SETUP.md §5`](./MIGRATION-TEST-SETUP.md) 흔한 실패 시나리오 참조해서 해결 후 재시도.

### 1.4 빌드 통과 + SEO 시그널 정상

```bash
cd web && npm run build
# Compiled successfully + 156/156 static pages 이상

# 현재 SEO 시그널 baseline 캡처 (after-비교용)
curl -s 'https://hypeproof-ai.xyz/sitemap.xml' | grep -c '<url>' > /tmp/baseline-sitemap-count.txt
curl -s 'https://hypeproof-ai.xyz/columns/2026-04-08-claude-code-leak-copyright' | grep -c 'rel="canonical"' > /tmp/baseline-canonical-count.txt
# 기대값: sitemap N (현재 ~116), canonical 1
```

[`docs/SEO-INDEXING.md §4`](./SEO-INDEXING.md) 검증 명령어 모두 baseline으로 수집해 둘 것.

### 1.5 백업·복구

| 항목 | 확인 |
|---|---|
| Supabase 자동 백업 활성 | dashboard → Settings → Backups → "Daily backups: enabled" |
| 백업 보존 기간 | Pro: 7일, Free: 미제공 (Pro 최소 권장) |
| 수동 백업 가능성 | `npx supabase db dump --schema public > /tmp/pre-migration-$(date +%Y%m%d).sql` (Phase B 직전 권장) |
| markdown 원본 git 보존 | `web/src/content/` 디렉토리가 `feat/migration-and-refactor` 또는 main에 살아있음 |

---

## 2. Phase A — 운영 환경 준비 (코드 변경 0건)

### 2.1 사전조건
- §1 모두 ✅
- 운영 Supabase 프로젝트 생성 완료 (없으면 dashboard에서 신규 project 생성 → free tier OK, 향후 Pro 권장)

### 2.2 실행

#### 2.2.1 Supabase 프로젝트 link
```bash
cd web
npx supabase link --project-ref <project-ref>
# Enter database password: <prompt>
# 성공 시 supabase/config.toml에 project_id 박힘. config.toml은 commit OK.
```

#### 2.2.2 Vercel 환경 변수 동기화

Vercel dashboard → Settings → Environment Variables. **Production / Preview / Development** 각각 설정:

```
Production만:
  SUPABASE_URL                = https://<project-ref>.supabase.co
  SUPABASE_SERVICE_ROLE_KEY   = <production service_role key>
  NEXT_PUBLIC_SUPABASE_URL    = https://<project-ref>.supabase.co
  SUPABASE_ANON_KEY           = <production anon key>

Preview / Development:
  (선택) staging Supabase 프로젝트 키 또는 미설정
```

또는 CLI:
```bash
cd web
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# … 나머지 동일
```

#### 2.2.3 service_role_key 보안 점검
```bash
# ❌ 다음 패턴이 존재하면 즉시 정리
grep -rn "NEXT_PUBLIC_SUPABASE_SERVICE" web/src web/.env* 2>/dev/null
grep -rn "sb_secret_" web/ --include="*.ts" --include="*.tsx" --include="*.md" --include="*.example" 2>/dev/null | grep -v node_modules

# ✅ 빈 결과여야 함
```

> **금지**: `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` 같은 변수명. 어떤 형태로든 `service_role` 값을 클라이언트 번들에 노출하면 RLS 우회 권한이 모든 사용자에게 풀림.

### 2.3 검증

```bash
# Vercel env 적용 확인 (Preview deploy 한 번 트리거)
vercel --prebuilt 2>&1 | head -5

# Supabase link 상태
npx supabase projects list   # 본인 project가 ★ 마크
```

### 2.4 롤백
- Vercel env 잘못 입력 시: dashboard에서 직접 삭제·재입력. 재배포 필요.
- Supabase link 실수 (다른 프로젝트 연결): `web/supabase/config.toml`의 `project_id` 라인 제거 후 재 link.

**Phase A는 운영 데이터에 손대지 않는 단계 — 모든 작업 reversible.**

---

## 3. Phase B — 운영 DB 스키마 적용 (Track 1A 진입)

### 3.1 사전조건
- §2 통과
- 운영 DB의 기존 테이블 보존 확인 (001_init/002_rls는 이미 적용 중일 가능성):
  ```bash
  npx supabase db remote query "SELECT tablename FROM pg_tables WHERE schemaname='public';" 2>&1
  # 기존: profiles, likes, bookmarks, comments
  # 신규 (003 적용 후): + articles, novels, research_posts
  ```

### 3.2 실행

#### 3.2.1 dry-run
```bash
cd web
npx supabase db push --dry-run
# 출력 검토:
#   - "Would apply: 003_content.sql"
#   - 003 안의 CREATE TABLE / CREATE POLICY / CREATE INDEX 모두 나열
# 의도 외 SQL이 있으면 즉시 중단하고 003_content.sql 검토
```

#### 3.2.2 수동 백업 (선택, 권장)
```bash
mkdir -p /tmp/pre-migration
npx supabase db dump --schema public --data-only > /tmp/pre-migration/data-$(date +%Y%m%d-%H%M).sql
# 데이터 양에 따라 5초 ~ 1분
```

#### 3.2.3 실제 push
```bash
npx supabase db push
# "Applied migrations: 003_content.sql"
# 실패 시 console에 SQL line 번호 + 에러 출력
```

### 3.3 검증

```bash
# 1) 테이블 생성 확인
npx supabase db remote query "
  SELECT tablename FROM pg_tables 
  WHERE schemaname='public' AND tablename IN ('articles','novels','research_posts');
"
# 기대: 3 rows

# 2) RLS 활성 확인
npx supabase db remote query "
  SELECT tablename, rowsecurity FROM pg_tables 
  WHERE schemaname='public' AND tablename IN ('articles','novels','research_posts');
"
# 기대: 3 rows, rowsecurity=t (true)

# 3) RLS 정책 명세 확인
npx supabase db remote query "
  SELECT tablename, policyname, cmd FROM pg_policies 
  WHERE schemaname='public' AND tablename IN ('articles','novels','research_posts');
"
# 기대: 각 테이블에 published-only SELECT 정책

# 4) 인덱스 확인
npx supabase db remote query "
  SELECT indexname FROM pg_indexes 
  WHERE schemaname='public' AND tablename IN ('articles','novels','research_posts');
"
# 기대: 각 테이블의 (slug,locale) UNIQUE + status/date 복합 + GIN tags
```

### 3.4 롤백

스키마만 적용했고 데이터 0건이므로 안전:
```bash
npx supabase db remote query "
  DROP TABLE IF EXISTS articles CASCADE;
  DROP TABLE IF EXISTS novels CASCADE;
  DROP TABLE IF EXISTS research_posts CASCADE;
"
```
이후 §3.1로 복귀.

> **주의**: 다음 Phase(seed)가 진행되면 데이터 삭제 위험이 생기므로 그 시점부터 롤백 절차가 달라진다 (§4.4 참조).

---

## 4. Phase C — 운영 DB 1회 seed

### 4.1 사전조건
- §3 통과 (스키마 OK)
- 로컬에서 `npm run test:migration` 직전 24시간 내 통과 이력
- 운영 service_role key가 손에 있음 (Vercel env 또는 1Password 같은 vault에서 즉시 추출 가능)

### 4.2 실행

```bash
cd web

# secret을 shell history에 남기지 않으려면 vault에서 stdin으로 주입
SUPABASE_URL='https://<project-ref>.supabase.co' \
SUPABASE_SERVICE_ROLE_KEY="$(security find-generic-password -s 'supabase-prod' -w)" \
npx tsx scripts/seed-content.ts

# 또는 1Password CLI:
# op run --env-file=.env.production -- npx tsx scripts/seed-content.ts
```

기대 출력:
```
Seeding to https://<project-ref>.supabase.co
  articles         ok=68 fail=0
  novels           ok=32 fail=0
  research_posts   ok=86 fail=0

Seed completed successfully.
```

### 4.3 검증

#### 4.3.1 row count
```bash
npx supabase db remote query "
  SELECT 'articles' AS t, count(*) FROM articles
  UNION ALL SELECT 'novels', count(*) FROM novels
  UNION ALL SELECT 'research_posts', count(*) FROM research_posts;
"
# 기대 (2026-04-29 기준):
#   articles        68   (KO 34 + EN 34)
#   novels          32
#   research_posts  86   (KO 43 + EN 43)
# 합 186 = MIGRATION-RFC.md §4 인벤토리와 동일
```

#### 4.3.2 byte-identical sanity (1-2개 페이지)

**먼저 dual-source가 활성화된 상태에서만 가능 (Phase D 진입 후).** Phase C 단계에선 다음만 가능:

```bash
# DB에 들어간 본문이 정상인지 spot check
npx supabase db remote query "
  SELECT slug, locale, length(body) AS body_len, length(title) AS title_len
  FROM articles WHERE slug='2026-04-08-claude-code-leak-copyright';
"
# 기대: ko/en 두 row, body_len > 1000
```

자세한 SSR 비교는 §5.2(카나리아) 참조.

### 4.4 실패 / 부분 실패 대응

#### 4.4.1 일부 row fail (`fail>0`)

seed-content.ts는 `(slug, locale)` 멱등 upsert이므로 **그냥 다시 실행해도 안전**.

실패 원인 분류:
- `column "X" does not exist` → 003 스키마와 seed 스크립트 mismatch. 003 재배포 또는 스크립트 수정.
- `null value in column "title"` → markdown frontmatter 누락. 해당 .md 파일 frontmatter 보강 후 재실행.
- 네트워크 에러 → 그냥 재실행.

#### 4.4.2 전부 fail / 데이터 오염
```bash
# 모든 콘텐츠 row 삭제 (스키마는 보존)
npx supabase db remote query "
  TRUNCATE articles, novels, research_posts RESTART IDENTITY;
"
# 그리고 §4.2부터 재실행
```

> **주의**: TRUNCATE는 즉시·되돌릴 수 없다. 운영에 트래픽이 도는 상태(Phase D 진입 후)에서는 dual-source의 markdown fallback이 살아있는지 먼저 확인하고 실행.

---

## 5. Phase D — Track 1A: dual-source 점진 cutover

이 Phase는 단일 작업이 아니라 **4단계 점진 전환**이다. 각 Step 사이에 관찰 기간을 둔다.

### 5.0 현재 상태 (출발점)

- `web/src/lib/columns.ts:121-150` — `getColumnFromDb` 구현 완료
- `web/src/app/columns/[slug]/page.tsx:48` — `?source=db` 쿼리로 분기. 디폴트는 `'markdown'`(쿼리 미지정 시)
- `web/src/lib/research.ts`, `web/src/lib/novels.ts` — DB 함수 미구현
- 기본 동작: 모든 트래픽이 markdown 사용. DB는 명시 요청 시만.

### 5.1 Step 1 — 카나리아 5개 페이지 수동 검증

#### 5.1.1 사전조건
- §4 통과 (운영 DB seed 성공)

#### 5.1.2 실행 + 검증

대표 페이지 5개를 골라 markdown 출력과 DB 출력의 SSR HTML diff:

```bash
PAGES=(
  '/columns/2026-04-08-claude-code-leak-copyright'
  '/columns/2026-03-31-content-depreciation'
  '/columns/2026-03-23-identity-compass'
  '/columns/2026-02-10-era-of-the-chairman'
  '/research/<대표 슬러그>'
)

for p in "${PAGES[@]}"; do
  curl -s "https://hypeproof-ai.xyz${p}" > "/tmp/md-$(basename $p).html"
  curl -s "https://hypeproof-ai.xyz${p}?source=db" > "/tmp/db-$(basename $p).html"
  diff "/tmp/md-$(basename $p).html" "/tmp/db-$(basename $p).html" \
    | head -50 > "/tmp/diff-$(basename $p).txt"
  echo "$(basename $p): $(wc -l < /tmp/diff-$(basename $p).txt) diff lines"
done
```

기대: 모든 페이지 **diff 0** 또는 *무의미한 차이*(공백·임시 ID·timestamp만). 본문 / metadata / hreflang / canonical은 **반드시 동일**.

#### 5.1.3 차이 발생 시
- frontmatter 파싱 차이 → seed-content.ts의 `asArray`/`asJsonOrNull` 보강 후 §4.4.2 재seed
- 줄바꿈 차이 → seed의 `content.trim()`과 markdown 원본 비교, 필요 시 trim 정책 통일
- locale 페어링 차이 → `getAvailableLocalesForSlug` vs DB의 `SELECT DISTINCT locale ...` 결과 비교

#### 5.1.4 롤백
- 카나리아는 별도 트래픽 분기 없이 *수동 curl*만 하므로 롤백 불필요. 검증만 통과시키고 다음 Step.

### 5.2 Step 2 — 디폴트를 DB로 전환 (markdown fallback 유지)

#### 5.2.1 사전조건
- §5.1의 5개 페이지 모두 diff 무의미 통과

#### 5.2.2 실행

`web/src/app/columns/[slug]/page.tsx:48`의 디폴트 분기 로직 수정:

```typescript
// 변경 전 (현재):
const useDb = source === 'db';

// 변경 후:
const defaultSource = process.env.CONTENT_SOURCE || 'markdown';
const useDb = source === 'db' || (source !== 'markdown' && defaultSource === 'db');
```

Vercel env에 `CONTENT_SOURCE=markdown` 먼저 설정 → deploy → 트래픽 정상 확인 → `CONTENT_SOURCE=db`로 swap → 재배포.

이 패턴은 코드 1번 배포 + env 변경만으로 cutover 가능 → 즉시 rollback도 env flip 1번.

#### 5.2.3 검증
```bash
# DB 디폴트로 전환 후
curl -s 'https://hypeproof-ai.xyz/columns/2026-04-08-claude-code-leak-copyright' \
  | md5sum > /tmp/after-cutover.md5

# 직전 §5.1의 db 버전과 비교
md5sum /tmp/db-2026-04-08-claude-code-leak-copyright.html
# 두 md5가 같아야 함
```

추가:
- 24시간 Vercel Analytics 관찰: SSR p95/p99 변화 (DB 추가 latency)
- Supabase Dashboard: query duration / error rate

#### 5.2.4 롤백
```bash
vercel env rm CONTENT_SOURCE production
vercel env add CONTENT_SOURCE production
# value: markdown
# 다시 배포 → 1~2분 내 markdown 디폴트 복귀
```

### 5.3 Step 3 — Research / Novels dual-source 확장

#### 5.3.1 사전조건
- §5.2의 columns DB cutover 후 7일 이상 회귀 0건
- Search Console "Crawled - currently not indexed" 추이 baseline 대비 악화 없음

#### 5.3.2 실행

`columns.ts:121-150`의 `getColumnFromDb` 패턴을 그대로 복제:

**`web/src/lib/research.ts`**:
```typescript
export async function getResearchFromDb(slug: string, locale: string) {
  const { data, error } = await supabase
    .from('research_posts')
    .select('*')
    .eq('slug', slug).eq('locale', locale).eq('status', 'published')
    .single();
  if (error || !data) return null;
  return mapDbRowToResearch(data);  // columns의 mapper와 동일 패턴
}

export async function getAvailableLocalesForResearchSlugFromDb(slug: string) {
  const { data } = await supabase
    .from('research_posts')
    .select('locale').eq('slug', slug).eq('status', 'published');
  return (data || []).map(r => r.locale);
}
```

**`web/src/lib/novels.ts`** — 단일 locale(KO)이므로 더 단순:
```typescript
export async function getNovelFromDb(slug: string) {
  const { data, error } = await supabase
    .from('novels')
    .select('*').eq('slug', slug).eq('status', 'published').single();
  if (error || !data) return null;
  return mapDbRowToNovel(data);
}
```

각 페이지에서도 columns/[slug]/page.tsx와 동일한 분기 패턴 적용:
- `web/src/app/research/[slug]/page.tsx`
- `web/src/app/novels/[slug]/page.tsx`

#### 5.3.3 검증
- 로컬 `npm run test:migration` 통과
- 로컬 dev에서 research, novels 페이지 `?source=db` curl diff 0
- 운영 배포 후 §5.1과 동일한 5-페이지 sanity (research/novels에서)

#### 5.3.4 롤백
- env flag `CONTENT_SOURCE=markdown`로 복귀 (columns와 동일 메커니즘)
- 또는 git revert로 lib/research.ts·lib/novels.ts 변경분만 되돌리기

### 5.4 Step 4 — sitemap·feed·jsonld의 lastmod 소스 전환

#### 5.4.1 사전조건
- §5.3까지 모두 ✅, dual-source 30일 안정

#### 5.4.2 실행

현재 `web/src/app/sitemap.ts:12-17`의 `lastmodFromContent`:
```typescript
function lastmodFromContent(item: Item): Date | undefined {
  const raw = item.frontmatter.updated || item.frontmatter.date
  // …
}
```

`item`이 markdown frontmatter 기반인데, 이를 DB row의 `updated_at` 기반으로 swap:

```typescript
function lastmodFromContent(item: Item): Date | undefined {
  // DB 우선
  if (item.dbUpdatedAt) return new Date(item.dbUpdatedAt);
  // markdown fallback
  const raw = item.frontmatter?.updated || item.frontmatter?.date
  // …
}
```

`getAllColumns` 등의 함수가 DB row를 반환할 때 `updated_at`을 함께 실어주도록 mapping 보강.

마찬가지로:
- `web/src/app/feed.xml/route.ts` — `pubDate`를 DB의 `published_at` 사용
- `web/src/lib/jsonld.ts` — `dateModified`를 DB의 `updated_at` 사용

#### 5.4.3 검증

```bash
# 배포 후 sitemap의 lastmod이 DB updated_at과 일치하는지
curl -s 'https://hypeproof-ai.xyz/sitemap.xml' | grep -A1 'claude-code-leak' | grep lastmod

# DB쪽
npx supabase db remote query "
  SELECT slug, updated_at FROM articles WHERE slug='2026-04-08-claude-code-leak-copyright';
"
# 두 값이 일치 (DB가 frontmatter date보다 더 최신이면 sitemap도 그 값)
```

[`docs/SEO-INDEXING.md §1.2`](./SEO-INDEXING.md) lastmod 신뢰성 룰 준수: DB 자동 트리거(`set_updated_at`)가 *콘텐츠 변경 시점*에만 발동하는지 확인 (단순 row touch로 변경 안 되어야 함).

#### 5.4.4 롤백
- git revert로 sitemap.ts/feed.xml/jsonld.ts 직전 커밋 회귀
- 데이터 변경 없음, 즉시 안전

---

## 6. Phase E — Track 1B: 어드민 UI

본 Phase는 [`shin_bro/ADR-002.md`](../shin_bro/ADR-002.md)의 3단계 phasing을 따른다. 본 runbook은 운영 진입·검증·롤백만 다루고, 설계는 ADR을 link.

### 6.1 Phase 1 (1~2시간 작업) — Header-Auth API

#### 6.1.1 사전조건
- §5 (Track 1A) 안정 30일 이상
- ADR-002 §Phase 1 설계 검토 완료

#### 6.1.2 실행 (ADR-002 §Phase 1 그대로)
- `POST /api/admin/posts` 라우트 신설 (header-based auth, multipart/json 둘 다)
- gray-matter 파싱 → DB upsert → `revalidateTag('content:articles')`
- token은 Vercel env `ADMIN_API_TOKEN` (랜덤 32바이트, 1Password 보관)

#### 6.1.3 검증

```bash
# 새 글 발행 → 즉시 사이트 반영 확인
curl -X POST https://hypeproof-ai.xyz/api/admin/posts \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -F "file=@/tmp/test-post.md"

# 30초 안에 reflect 확인 (revalidateTag 동작)
sleep 30
curl -s 'https://hypeproof-ai.xyz/columns/<new-slug>' | grep -c '<h1>'
# 기대: 1
```

#### 6.1.4 롤백
- `/api/admin/posts` 라우트 비활성화 (환경 변수 `ADMIN_API_DISABLED=1` 가드 또는 코드 revert)
- 발행된 row는 DB에 남으므로 별도 삭제: `DELETE FROM articles WHERE slug='<new-slug>'`

### 6.2 Phase 2 — 웹 폼 + NextAuth

#### 6.2.1 사전조건
- §6.1 Phase 1이 30일 이상 운영 사용

#### 6.2.2 실행 (ADR-002 §Phase 2)
- `/admin/posts` 페이지 + Tiptap 에디터 (RFC Q4 디폴트)
- NextAuth 세션 기반 admin 권한 가드
- KO/EN 사이드바이사이드

#### 6.2.3 검증·롤백 — Phase 1과 동일 패턴

### 6.3 Phase 3 — 모더레이터 게이트 + 자동 번역

#### 6.3.1 사전조건
- RFC §7의 **Q7·Q8·Q9 결정 완료**. 결정 안 되면 본 Phase는 진입 불가.
- §6.2 Phase 2가 30일 이상 운영 사용

#### 6.3.2 실행
- ADR-002 §Phase 3 + RFC §7.1의 추천 조합 (Conservative / Curated / Community 중 결정된 것)
- `claude -p` 모더레이터 에이전트 호출 wrapper
- 번역 에이전트 (Q9 결과 따라)

#### 6.3.3 검증
- 카나리아 외부 기고자 1명에게 3건 제출 시켜 발행까지 흐름 측정
- 모더레이터 false positive/negative 비율
- 번역 품질 (작성자가 만족하는지 인터뷰)

#### 6.3.4 롤백
- 모더레이터 비활성화 → 어드민 100% 수동 검토(Q8-A)로 일시 회귀
- 번역 에이전트 비활성화 → 어드민이 EN 직접 검토(Q9-C)로 회귀

---

## 7. Phase F — Track 1C: markdown 폐기

### 7.1 사전조건 (게이트, 모두 ✅이어야 진입)

| 게이트 | 측정 |
|---|---|
| Track 1A 안정 90일 이상 | dual-source DB 디폴트 운영 + 회귀 0건 |
| Track 1B Phase 1+2 안정 90일 이상 | 어드민 UI 일상 사용 + 발행 사고 0건 |
| Search Console 색인 회귀 없음 | indexed pages baseline 이상 유지 |
| 멤버 합의 | 7명 중 6명 이상 markdown 폐기 동의 |

### 7.2 실행

#### 7.2.1 markdown snapshot 보존
```bash
# 1C 진입 직전 last-snapshot 태그
git tag content-snapshot-pre-1c -m "markdown content snapshot before 1C deletion"
git push origin content-snapshot-pre-1c
```

#### 7.2.2 lib에서 fs 코드패스 제거

`web/src/lib/columns.ts`, `research.ts`, `novels.ts`:
- `fs.readSync` / `fs.readdirSync` 등 파일시스템 접근 제거
- `getAllColumns(locale)` → `getAllColumnsFromDb(locale)`로 일원화 (이름은 유지하고 내부만 교체)
- markdown fallback 제거 (Step 2의 env flag 분기도 함께 제거)

#### 7.2.3 generateStaticParams 비동기화 검증

```typescript
// 변경 전:
export function generateStaticParams() {
  const koSlugs = getAllColumns('ko').map(c => ({ slug: c.frontmatter.slug }))
  // …
}

// 변경 후:
export async function generateStaticParams() {
  const koSlugs = (await getAllColumnsFromDb('ko')).map(c => ({ slug: c.slug }))
  // …
}
```

빌드 시간 변화 측정:
```bash
cd web
time npm run build
# baseline: ~2.5s (markdown), 마이그 후: < 30s 목표 (DB fetch 포함)
```

#### 7.2.4 src/content/ 디렉토리 삭제

```bash
git rm -r web/src/content/
git commit -m "chore(track-1c): remove markdown content directory after 90-day stability"
```

#### 7.2.5 콘텐츠 스킬 DB 모드 전환
- `.claude/skills/research-columnist.md`, `column-workflow.md` 등에서 "markdown 파일 생성" 단계를 "/api/admin/posts" 호출로 교체

### 7.3 검증

```bash
# 1) 빌드 통과
npm run build

# 2) 모든 콘텐츠 페이지 정상 응답
for slug in $(curl -s 'https://hypeproof-ai.xyz/sitemap.xml' | grep -oE '/columns/[^<"]+' | head -20); do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://hypeproof-ai.xyz${slug}")
  [[ "$status" == "200" ]] || echo "FAIL: $slug → $status"
done

# 3) Search Console 색인 7일 추이 정상
# (수동 확인)

# 4) 어드민 UI로 새 글 발행 → 즉시 반영
```

### 7.4 롤백

markdown 디렉토리는 `content-snapshot-pre-1c` 태그로 복원 가능:
```bash
git checkout content-snapshot-pre-1c -- web/src/content/
git commit -m "revert(track-1c): restore markdown content directory"
```

lib 코드는 git revert로 1C 이전 상태로:
```bash
git revert <1c-commits>
```

env flag `CONTENT_SOURCE=markdown` 다시 활성화 → 1A 디폴트 상태로 복귀.

> **이 롤백은 비싼 작업이다.** 1C 진입 게이트(§7.1)를 보수적으로 적용해 진입 자체를 늦추는 게 비용 최소화.

---

## 8. 횡단 관심사 (모든 Phase 공통)

### 8.1 SEO 무결성

각 Phase 적용 후 [`docs/SEO-INDEXING.md §4`](./SEO-INDEXING.md) 검증 명령어 모두 실행. 특히 Phase D 이후:

```bash
# canonical 1개 (중복 없음)
curl -s 'https://hypeproof-ai.xyz/columns/<slug>' | grep -c 'rel="canonical"'  # → 1

# canonical이 페이지 자기 URL을 가리킴
curl -s 'https://hypeproof-ai.xyz/columns/<slug>' | grep -oE '<link rel="canonical" href="[^"]*"'

# sitemap의 lastmod이 DB updated_at과 일치 (§5.4 이후)
curl -s 'https://hypeproof-ai.xyz/sitemap.xml' | grep -A1 '<slug>' | grep lastmod

# robots.txt Googlebot 그룹에 Allow 명시
curl -s 'https://hypeproof-ai.xyz/robots.txt' | grep -A2 '^User-Agent: Googlebot$'

# hreflang 정상 출력
curl -s 'https://hypeproof-ai.xyz/columns/<bilingual-slug>' \
  | grep -oE '<link rel="alternate"[^>]*hreflang="[^"]*"'
```

색인 회귀 발견 시 §9.3 SEO 회귀 시나리오로.

### 8.2 빌드 시간 영향

| 상태 | 빌드 시간 | 비고 |
|---|---|---|
| markdown only (baseline) | ~2.5s | turbopack + 156 static pages |
| dual-source (Phase D) | ~10~30s | DB 페치 추가, ISR로 다소 완화 |
| DB only (Phase F) | < 30s 목표 | generateStaticParams 비동기 fetch |

빌드 시간 60s 초과 시:
- `generateStaticParams`에서 KO만 prerender, EN은 on-demand SSR로 분리
- 또는 ISR `revalidate` 줄여 빌드 부담 분산

### 8.3 ISR 전략

| 타입 | 현재 | Track 1A~1C 권장 |
|---|---|---|
| `/sitemap.xml` | `revalidate=3600` | 유지. DB 변경 시 1h 내 반영 |
| `/columns/[slug]` | static (1h fallback) | 유지. 어드민 발행 시 `revalidateTag` |
| `/columns` (목록) | static | `revalidate=300` (5분) — 신규 발행 빠른 노출 |
| `/feed.xml` | `s-maxage=3600` | 유지 |

`revalidateTag`는 발행/수정 시 어드민 API에서 호출 (§6.1).

### 8.4 이미지 호스팅 전환 (본 runbook 범위 외)

현재 이미지(`/members/`, `/authors/`, og-image 등)는 모두 정적 `web/public/`. Supabase Storage 사용은 **Track 1A~1C 범위에 없다**. 향후 Storage 사용 시:

```typescript
// next.config.ts:8 remotePatterns에 추가
{ protocol: 'https', hostname: '<project-ref>.supabase.co', pathname: '/storage/v1/object/public/**' }
```

세부 절차는 별도 RFC.

### 8.5 generateStaticParams 동기→비동기

Phase D Step 3 이후 동기 fs 호출이 비동기 DB fetch로 전환됨. 다음을 점검:

- 빌드 환경에서 운영 Supabase 접근 가능 (Vercel 빌드 컨테이너 → public Supabase URL)
- DB 다운 시 빌드 실패 → ISR 캐시로 fallback (Vercel은 직전 빌드의 정적 페이지 유지)
- 빌드 시 N+1 쿼리 방지: `getAllColumns()`를 한 번에 batch fetch

---

## 9. 롤백 시나리오

### 9.1 DB 다운 (Track 1A 운영 중)

**증상**: Supabase API 5xx, Vercel 함수 timeout, 사용자 페이지 503

**조치 (5분 내)**:
```bash
# Vercel env flag 즉시 swap
vercel env rm CONTENT_SOURCE production
vercel env add CONTENT_SOURCE production   # value: markdown
vercel --prod --yes
```

→ markdown fallback 재활성화. 1C 이전이면 src/content/가 살아있어 즉시 회복.

### 9.2 데이터 불일치 (DB row vs markdown 상이)

**증상**: §5.1 검증 시 diff > 0, 또는 사용자 제보로 발견

**조치**:
1. 즉시 §9.1과 동일하게 markdown 디폴트로 환원 (사용자 노출 차단)
2. 차이 분석:
   ```bash
   cd web && set -a && source .env.test && set +a
   npm run db:reset && npm run db:seed && npm run db:verify
   ```
3. seed-content.ts 또는 frontmatter 보강
4. 운영 DB에 재seed (§4.4.1 멱등 upsert)
5. §5.1 재실행 후 diff 0 확인 → 디폴트 다시 DB로

### 9.3 SEO 회귀 (색인 감소 / canonical 오류)

**증상**: Search Console "indexed pages" 감소, "Crawled - currently not indexed" 급증

**조치**:
1. 즉시 검증:
   ```bash
   curl -s 'https://hypeproof-ai.xyz/columns/<대표슬러그>' | grep -c 'rel="canonical"'  # 1이어야
   curl -s 'https://hypeproof-ai.xyz/sitemap.xml' | grep -c '<url>'  # baseline 이상
   ```
2. SEO-INDEXING.md §5.4 메시지별 조치표 따라 분류
3. 직전 deploy로 Vercel rollback:
   ```bash
   vercel rollback   # interactive — 직전 안정 deploy 선택
   ```
4. Search Console에서 sitemap 재제출 + URL 검사 도구로 우선순위 5-10개 색인 요청

### 9.4 Vercel 빌드 실패

**증상**: 새 commit push 후 deploy 실패

**조치**:
1. 빌드 로그 확인: Vercel dashboard → Deployments → 실패 deploy → "View Logs"
2. 흔한 원인:
   - `generateStaticParams`에서 DB fetch 실패 → §8.5 점검
   - 환경 변수 누락 → §2.2.2 재확인
   - TypeScript 에러 → 로컬 `npm run build` 재현
3. 즉시 회복:
   ```bash
   vercel rollback
   ```
4. 원인 fix → 로컬 build 통과 확인 → 재 push

---

## 10. 금지사항 (Hard Rules)

이 룰은 **어떤 상황에서도** 위반하면 안 된다. 위반 시 즉시 중단·복구.

| # | 룰 | 위반 시 결과 |
|---|---|---|
| H1 | `sb_secret_*` literal을 git에 커밋 금지. placeholder + db:status 안내 패턴 사용 | GitHub Push Protection 차단, 이력 청소 비용 큼 |
| H2 | `service_role_key`를 `NEXT_PUBLIC_` 접두사 변수에 두지 말 것 | 클라이언트 번들에 노출 → 모든 사용자가 RLS 우회 권한 획득 |
| H3 | Track 1C(markdown 폐기)는 1A+1B 90일 안정 후 진입 | 회귀 시 복구 비용 폭증 |
| H4 | 운영 seed 시점에 로컬 `npm run test:migration` 24시간 내 통과 이력 필수 | seed 도중 schema/script drift로 row 손실 가능 |
| H5 | markdown 본문에 빌드 타임 정보(`new Date()`, `process.env` 등) 박지 말 것 | DB sync 시 byte-identical 깨짐 |
| H6 | 운영 DB에 `TRUNCATE` 또는 `DROP TABLE` 실행은 사용자 명시 승인 필수 | 데이터 손실 |
| H7 | `git push --force` to main/origin 절대 금지 | 협업자 작업 손실 |

H1·H2는 [`memory/reference-supabase-push-protection.md`](../shin_bro/memory) 와 동기화.

---

## 11. 관찰 메트릭

각 Phase 적용 후 첫 24시간·7일 모니터링.

### 11.1 Vercel
- **Build duration** (Deployments → Build Logs): 마이그 전후 비교
- **Function invocations** (Analytics): SSR 호출 수 추이
- **Function duration p50/p95/p99**: DB 추가 latency 측정 (목표: p95 < 500ms)
- **4xx/5xx rate**: 마이그 직후 spike 없는지

### 11.2 Supabase
- Dashboard → Reports → API
- **Query duration** p95: 단일 row 조회 < 50ms 목표
- **Error rate**: < 0.1% 유지
- **Connection pool**: 빌드 시 N+1로 폭주 안 하는지

### 11.3 Search Console
- **Pages** → indexed page count: baseline 대비 감소율
- **Pages** → "Why pages aren't indexed":
  - "Crawled - currently not indexed" 추이
  - "Duplicate, Google chose different canonical" 0 유지
- **Sitemaps** → 처리 결과 "Success" 유지
- 우선순위 콘텐츠 5-10개에 URL 검사 도구로 색인 요청

### 11.4 사용자 측
- Vercel Analytics: 페이지 로드 LCP/INP/CLS
- Sentry (있다면): 클라이언트 에러율
- 멤버 Discord: "이상 보고" 채널 모니터링

---

## 12. 의사결정 의존 (RFC Open Questions)

본 runbook은 결정 자체를 하지 않는다. 다음 RFC Q가 결정되어야 진입 가능한 Phase가 있다.

| RFC Q | 본 runbook 영향 | 결정 필요 시점 |
|---|---|---|
| **Q6** 배포 흐름 (Vercel CLI vs GitHub Actions) | Phase A (§2.2.2)에서 env 동기화 방식 분기 | 본 runbook 적용 *전* |
| **Q4** 마크다운 에디터 (Tiptap / Lexical / CodeMirror) | Phase E §6.2 어드민 폼 구현 | 1B Phase 1 안정 후 |
| **Q9** 번역 정책 (작성자 / 에이전트초안 / 어드민) | Phase E §6.3 번역 게이트 | 1B Phase 1 완료 직후 |
| **Q7·Q8** 외부 기고 정책·게이트 | Phase E §6.3 모더레이터 + 외부 author role | 1B Phase 2 안정 후 |
| **Q5** 메신저 검색 (PG ILIKE / FTS / Meilisearch) | 본 runbook 범위 외 (Track 3) | Track 3 진입 전 |
| **Q3** 콘텐츠 참조 UX (`[[slug]]` / `/cite` / unfurl) | 본 runbook 범위 외 (Track 3) | Track 3 진입 전 |
| **Q2** 메신저 외부 공개 | 본 runbook 범위 외 (Track 3) | Track 3 진입 전 |
| **Q1** Discord 관계 | 본 runbook 범위 외 (Track 3) | Track 3 진입 전 |

결정 진행 상황은 [`docs/MIGRATION-RFC.md §7`](./MIGRATION-RFC.md)에서 갱신.

---

## 13. 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-04-29 | 신설. Track 1A~1C 전 phase의 운영 실행·검증·롤백·횡단 관심사 매뉴얼화 | 본 commit |

---

## 14. 관련 문서

- [`docs/MIGRATION-RFC.md`](./MIGRATION-RFC.md) — 설계·결정·트랙 정의·외부 기고 매트릭스
- [`docs/MIGRATION-TEST-SETUP.md`](./MIGRATION-TEST-SETUP.md) — 로컬 Docker 검증 환경
- [`docs/SEO-INDEXING.md`](./SEO-INDEXING.md) — 색인·사이트맵 운영 (§8 DB 마이그 영향)
- [`shin_bro/ADR-002.md`](../shin_bro/) — Column Upload API Phase 1~3 설계 (gitignored 개인 폴더)
- [`CLAUDE.md`](../CLAUDE.md) — 프로젝트 전체 지침 (배포 흐름·금지사항·빌드 규칙)
- `web/supabase/migrations/{001_init,002_rls,003_content}.sql` — 스키마 정의
- `web/scripts/{seed-content,verify-content-migration}.ts` — seed·검증 구현
- `web/src/lib/{columns,research,novels}.ts` — dual-source 분기 코드
- `web/src/app/sitemap.ts`, `web/src/app/robots.ts`, `web/src/lib/jsonld.ts` — SEO 출력
