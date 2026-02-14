# Code Review Report — 2026-02-14

> 검토 기준: Notion SDK 금지, "Author"→"Creator" 용어, 보안(PII), TypeScript 타입 안전성, 에러 핸들링, 테스트 커버리지

---

## 1. `web/src/lib/points.ts` ✅ PASS (경미한 이슈)

**Notion SDK**: ✅ fetch API만 사용. `@notionhq/client` import 없음.

**이슈:**
- ⚠️ **package.json에 `@notionhq/client` 의존성 남아있음** (`"@notionhq/client": "^5.9.0"`)
  - 실제 코드에서 사용하지 않지만 의존성 트리에 포함됨 → 제거 권장
- ⚠️ `POINTS_TABLE` 상수가 SPEC.md의 포인트 체계와 불일치
  - 코드: `CONTENT_GEO_70: 50, CONTENT_GEO_85: 80, CONTENT_GEO_95: 120`
  - SPEC: `100 + (GEO Score - 70) × 3` (연속 함수)
  - **권장**: SPEC 기준으로 통일하거나 상수를 SPEC과 매칭
- ✅ 타입 안전성 양호 (`PointTransaction` 인터페이스 명확)
- ✅ 에러 핸들링: `notionQuery`, `notionCreatePage`에서 HTTP 상태 체크
- ✅ 페이지네이션 처리 (`has_more` + `next_cursor`)

**"Author" 용어**: ⚠️ 해당 없음 (이 파일에 author/creator 언급 없음). 단, `POINTS_TABLE`에 의미적으로 Creator 기반이므로 OK.

---

## 2. `web/src/app/api/points/route.ts` ✅ PASS

- ✅ 인증 체크 (`auth()`)
- ✅ Admin only POST (role 체크)
- ✅ 필수 필드 검증
- ⚠️ `(session.user as any).role` — 타입 단언 사용. `next-auth.d.ts`에 role 확장되어 있으면 OK, 아니면 타입 보강 필요.
- ✅ GET에서 member 파라미터 검증

---

## 3. `web/src/app/api/points/leaderboard/route.ts` ✅ PASS

- ✅ 인증 체크
- ✅ 간결한 구현
- ⚠️ 모든 인증된 사용자가 전체 리더보드를 볼 수 있음. SPEC DATA-3에 따르면 집계 데이터는 OK이므로 문제 없음.

---

## 4. `web/src/lib/members.ts` ⚠️ 이슈 있음

**Notion SDK**: ✅ fetch API 사용.

**이슈:**
- 🔴 **MemberInfo 인터페이스에 `email: string` 필드 존재** — Notion에서 이메일을 가져와 메모리에 캐시하고 있음. `getMemberByEmail()` 함수가 이메일 키로 멤버를 조회. SPEC DATA-1에 따르면 PII 노출 주의 필요. API 응답에서 email을 필터링하는지 확인 필요.
- ⚠️ `ensureFresh()`가 비동기 갱신을 fire-and-forget으로 실행 — 첫 호출 시 stale 데이터 반환 가능. `refreshCache()`의 Promise를 await하지 않음.
- ⚠️ `fetchMembersFromNotion()`에서 `filter: { property: 'Status', select: { equals: 'Active' } }` — 단일 페이지 쿼리만 수행 (100개 제한). Creator cap이 20명이므로 현재는 문제 없으나, `has_more` 처리 없음.
- ✅ Fallback 멤버 목록에 이메일 없음 (보안 OK)

---

## 5. `web/src/app/auth/signin/page.tsx` ✅ PASS

- ✅ "AI Creator Guild" 표현 사용
- ✅ "Author" 언급 없음
- ✅ Google + GitHub 로그인만 (적절)
- ✅ 보안: 개인정보 하드코딩 없음

---

## 6. `web/src/app/welcome/page.tsx` ⚠️ 경미한 이슈

- ✅ "Creator" 용어 일관 사용
- ✅ 다국어 지원 (ko/en)
- 🔴 **이메일 하드코딩**: `href="mailto:jayleekr0125@gmail.com"` — 코드에 개인 이메일 노출
  - **권장**: 환경변수 또는 config에서 가져오거나, Discord 링크로 대체
- ✅ AI Persona 소개 섹션 포함

---

## 7. `web/src/app/ai-personas/page.tsx` ✅ PASS

- ✅ "Creator" 용어 사용 (`by {persona.creator}`)
- ✅ 다국어 지원
- ✅ 서버 컴포넌트로 적절한 데이터 페칭
- ✅ 빈 상태 처리

---

## 8. `web/src/app/ai-personas/register/page.tsx` ⚠️ 경미한 이슈

- ✅ "Creator" 용어 사용
- 🔴 **이메일 하드코딩**: `href={`mailto:${(s as any).email}`}` → `email: 'jayleekr0125@gmail.com'`
  - welcome 페이지와 동일 이슈
- ⚠️ `(s as any)` 타입 단언 다수 — step별 타입을 유니온 타입으로 정의하면 개선 가능
- ✅ YAML 템플릿에 "Creator" 용어 사용

---

## 9. `scripts/geo_qa_score.py` ✅ PASS (양호)

- ✅ SPEC Section G의 채점 기준과 일치
- ✅ 카테고리별 점수 breakdown 제공
- ✅ 개선 제안 생성
- ✅ frontmatter 파싱 + YAML 지원
- ✅ 한국어 단어 수 계산 (CJK 보정)
- ⚠️ `score_schema()`에서 `meta.get("author")` 체크 — "creator" 필드로 변경 필요
  ```python
  # 현재: if meta.get("author"): pts += 3
  # 권장: if meta.get("author") or meta.get("creator"): pts += 3
  ```
- ⚠️ `score_keyword_stuffing()`에서 한국어 형태소(조사 등) 고빈도 false positive 가능성 — `\w{2,}` 패턴이 한국어 조사를 개별 단어로 카운트하지 않으므로 현재는 OK.

---

## 10. `scripts/content_pipeline.py` ⚠️ 이슈 있음

**"Author" 용어:**
- 🔴 `REQUIRED_FRONTMATTER`에 `"author"` 포함 — `"creator"`로 변경 필요
- 🔴 `"authorImage"` — `"creatorImage"`로 변경 필요
- 🔴 `args.author` CLI 인자 — `args.creator`로 변경 필요
- 🔴 `sub["author"]` 키 — `sub["creator"]`로 변경 필요
- 🔴 `fm.get("author")` — `fm.get("creator")`로 변경 필요
- 🔴 `_print_submission()`에서 `sub['author']` 참조

**기타:**
- ⚠️ `ACTIVE_CREATORS = ["Jay", "Mia", "Hoon", "Sora", "Juno"]` — 하드코딩. SPEC의 실제 멤버 목록과 불일치 (Kiwon, TJ, Ryan 등). Notion DB에서 가져오거나 config 파일로 분리 권장.
- ⚠️ `run_geo_qa()`가 `--json` 플래그 없이 `geo_qa_score.py` 호출 — stdout 파싱 시 JSON이 아닌 텍스트 리포트를 받게 됨. `--json` 추가 필요:
  ```python
  # 현재: [sys.executable, str(geo_script), filepath]
  # 권장: [sys.executable, str(geo_script), filepath, "--json"]
  ```
- ⚠️ `validate_frontmatter()`의 `authorImage` 패턴 체크: `/members/\w+\.png$` — 한글 이름 불가. `[\w가-힣]+` 등으로 확장 필요.
- ✅ 에러 핸들링: GEO QA 실패 시 fallback 점수 계산
- ✅ 리뷰어 매칭 규칙 (자기 글 제외, 연속 배정 방지)

---

## 11. `scripts/test_geo_qa.py` ✅ PASS

- ✅ 단위 테스트 커버리지 양호
- ✅ 실제 파일 integration 테스트 포함
- ✅ 경계값 테스트 (0개 인용, 5+개 인용, 키워드 스터핑)
- ⚠️ `test_stuffing_detected` — 임계값(3%)에 의존적. 한국어 콘텐츠에서 false positive 테스트 추가 권장.

---

## 12. `scripts/test_content_pipeline.py` ⚠️ 이슈 있음

- 🔴 `VALID_FM`에 `"author": "Jay"` — `"creator": "Jay"`로 변경 필요
- 🔴 `test_required_fields_list`에서 `"author"`, `"authorImage"` 검증 — `"creator"`, `"creatorImage"`로 변경 필요
- ✅ 리뷰어 매칭 테스트 양호 (자기 글 제외, 연속 배정 방지, fallback)
- ✅ 2/2 승인 로직 테스트

---

## 13. `web/tests/e2e/` (Playwright) ⚠️ 부분 이슈

**테스트 태그:**
- ✅ `@api` 태그 사용 (api-points.spec.ts)
- ✅ `@desktop` 태그 사용 (content-render.spec.ts, seo.spec.ts)
- ✅ `@mobile` 태그 사용 (navigation.spec.ts)
- ⚠️ `mobile-responsive.spec.ts` — 태그 없음. `@mobile` 추가 권장
- ⚠️ `@all` 태그 미사용 — 모든 환경에서 실행할 테스트에 추가 권장

**커버리지 갭:**
- ❌ 포인트 리더보드 E2E 테스트 없음 (인증 필요)
- ❌ AI Personas 페이지 E2E 테스트 없음
- ❌ Welcome/Onboarding 페이지 E2E 테스트 없음
- ❌ 로그인 플로우 E2E 테스트 없음

---

## 14. "Author" → "Creator" 전체 검색 결과

### 🔴 변경 필요 (코드 내 Author 용어)

| 파일 | 위치 | 현재 | 권장 |
|------|------|------|------|
| `scripts/content_pipeline.py` | L29 | `REQUIRED_FRONTMATTER = [..., "author", "authorImage"]` | `"creator"`, `"creatorImage"` |
| `scripts/content_pipeline.py` | L168 | `args.author` | `args.creator` |
| `scripts/content_pipeline.py` | L184 | `"author": author` | `"creator": creator` |
| `scripts/test_content_pipeline.py` | L22 | `"author": "Jay"` | `"creator": "Jay"` |
| `scripts/test_content_pipeline.py` | L106 | `"author"`, `"authorImage"` | `"creator"`, `"creatorImage"` |
| `scripts/geo_qa_score.py` | L123 | `meta.get("author")` | `meta.get("creator") or meta.get("author")` |
| `web/src/lib/points.ts` | — | ✅ 해당 없음 | — |

### ⚠️ URL 경로 내 "authors" (변경 검토 필요)

| 파일/경로 | 상태 | 비고 |
|-----------|------|------|
| `web/src/app/novels/authors/` | ⚠️ | URL 경로. SEO 영향 고려하여 redirect 설정 후 변경 또는 유지 |
| `novels/authors/cipher.yaml` | ⚠️ | 파일 경로. 내부적이므로 변경 영향 적음 |

### ✅ 이미 "Creator" 사용 중

- `web/src/app/auth/signin/page.tsx` — "AI Creator Guild"
- `web/src/app/welcome/page.tsx` — "Creator" throughout
- `web/src/app/ai-personas/` — "Creator" throughout
- `community/SPEC.md` — "Creator" throughout
- `community/HERALD-SOUL.md` — "Creator" throughout

---

## 15. `@notionhq/client` SDK 검사

| 항목 | 상태 |
|------|------|
| `web/package.json` 의존성 | 🔴 `"@notionhq/client": "^5.9.0"` 존재 |
| 실제 import | ✅ 없음 (코드에서 미사용) |
| `web/src/lib/points.ts` | ✅ fetch API 사용 |
| `web/src/lib/members.ts` | ✅ fetch API 사용 |

**권장**: `package.json`에서 `@notionhq/client` 제거 + `npm uninstall @notionhq/client`

---

## 16. 보안 검토

| 항목 | 상태 | 파일 |
|------|------|------|
| 이메일 하드코딩 | 🔴 | `welcome/page.tsx`, `ai-personas/register/page.tsx` — `jayleekr0125@gmail.com` |
| API 키 코드 내 | ✅ | 환경변수 사용 (`process.env.NOTION_API_KEY`) |
| PII in members.ts | ⚠️ | 이메일을 메모리 캐시 — API 응답에서 필터링 확인 필요 |
| GitHub에 개인정보 | ✅ | Fallback 목록에 닉네임만 |

---

## 요약

| 카테고리 | 심각 | 경미 | 통과 |
|---------|------|------|------|
| Notion SDK 금지 | 1 (package.json) | 0 | 2 (points.ts, members.ts) |
| "Author"→"Creator" | 6 (scripts) | 2 (URL 경로) | 다수 |
| 보안 (PII) | 2 (이메일 하드코딩) | 1 (members.ts 캐시) | 다수 |
| TypeScript 타입 | 0 | 2 (as any 단언) | 다수 |
| 에러 핸들링 | 0 | 1 (ensureFresh) | 다수 |
| 테스트 커버리지 | 0 | 4 (E2E 갭) | 다수 |

### 우선순위 액션 아이템

1. 🔴 `scripts/content_pipeline.py` — "author" → "creator" 전체 변경
2. 🔴 `scripts/test_content_pipeline.py` — 테스트도 "creator"로 업데이트
3. 🔴 `web/package.json` — `@notionhq/client` 제거
4. 🔴 `welcome/page.tsx`, `register/page.tsx` — 이메일 하드코딩 제거
5. ⚠️ `scripts/geo_qa_score.py` — `meta.get("author")` → creator 호환
6. ⚠️ `scripts/content_pipeline.py` — `run_geo_qa()`에 `--json` 플래그 추가
7. ⚠️ `web/src/lib/members.ts` — `ensureFresh()` 비동기 처리 개선
8. ⚠️ E2E 테스트 추가: AI Personas, Welcome, Leaderboard

---

*코드 직접 수정은 하지 않았음. 이 리포트 기반으로 수정 작업 진행 필요.*
*Reviewed by: Mother Agent | Date: 2026-02-14*
