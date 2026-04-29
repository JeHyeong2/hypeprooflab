# SEO·색인 운영 가이드

> HypeProof Lab 검색·색인·사이트맵 관련 모든 작업의 **단일 참조 문서**.
> 사이트맵/robots를 손대거나 색인 문제를 디버깅할 때 이 문서를 먼저 읽고 작업한다.

**Last verified**: 2026-04-27 (Google Search Central docs 기준 / Next.js 16 App Router)

---

## 0. 한눈에 보기

| 항목 | 결정 | 근거 |
|---|---|---|
| Sitemap 파일 | `web/src/app/sitemap.ts` (Next.js MetadataRoute) | App Router 표준, 빌드 타임 + ISR 1h |
| Robots 파일 | `web/src/app/robots.ts` | 동일 |
| 콘텐츠 페이지 sitemap 등록 | **모두 등록** (slug 단위) | Google: "검색결과에 표시하려는 URL 포함" |
| `priority` 사용 | ❌ **불사용** | Google 무시 |
| `changeFrequency` 사용 | ❌ **불사용** | Google 무시 (네이버 일부 참고하나 단순화 우선) |
| `lastModified` 사용 | ✅ **필수, 콘텐츠 변경 시점만** | Google: "일관되고 정확성 검증 가능할 때만 사용" |
| KO/EN 처리 | 단일 URL + `?lang=en` 쿼리. sitemap의 `alternates.languages`로 hreflang | 라우트 구조: `/columns/[slug]?lang=en` |
| 캐시 전략 | `export const revalidate = 3600` (1h ISR) | 새 글 발행 시 재배포 없이 sitemap 갱신 (Supabase 마이그 후 의미 커짐) |

---

## 1. Google 공식 규칙 (반드시 지킬 것)

출처: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko

### 1.1 URL 형식
- **절대 URL 필수** — `/path` 같은 상대 경로 금지. 항상 `https://hypeproof-ai.xyz/...`.
- **UTF-8 인코딩 + 엔티티 이스케이프** — Next.js MetadataRoute가 자동 처리. 직접 XML 만들지 말 것.
- **canonical과 sitemap URL 일치** — sitemap에 박은 URL이 페이지의 canonical과 다르면 색인에서 제외될 수 있음.

### 1.2 lastmod (가장 중요)
> "Google에서는 `<lastmod>` 값이 **일관되고 정확성을 검증할 수 있는 경우에** 이 값을 사용합니다."
> "기본 콘텐츠, 구조화된 데이터 또는 링크 관련 업데이트는 중요하지만 **저작권 날짜 업데이트는 그렇지 않습니다.**"

**의미**:
- ❌ 빌드할 때마다 모든 페이지 lastmod에 `new Date()` 박는 패턴 → **Google이 lastmod 신뢰성을 평가하다가 무시 모드로 전환**. 한 번 신뢰 잃으면 회복 어려움.
- ✅ 콘텐츠 frontmatter의 `updated` 또는 `date`를 기반으로 산출.
- ✅ 데이터 변경 시점을 추적 못 하는 라우트(예: `/glossary`, `/creators`)는 차라리 **lastmod 생략**. Google: "검증 불가능 시 무시됨" — 안 넣는 게 신뢰 점수에 좋다.

### 1.3 priority / changefreq
> "Google에서는 `<priority>` 및 `<changefreq>` 값을 무시합니다."

→ HypeProof 사이트맵에서는 **둘 다 안 씀**. 코드 단순화 + 의도 명확.
> *예외*: 네이버는 일부 참고하지만, 한국어/영어 양쪽 트래픽 모두 잡으려면 Google 우선이 합리적. 네이버 트래픽 비중이 압도적으로 커진다면 재고.

### 1.4 크기 제한 + 분할 전략
- 사이트맵 1개 = **50,000 URL / 50MB**.
- HypeProof는 117 URL이라 단일 sitemap으로 충분하지만 **2026-04-29부터 sitemap index + 4 sub-sitemap 구조로 선제 분할 적용**(미래 확장 대비). §3 참조.
- 사용자 쿼리 패턴 변화 / 콘텐츠 타입 추가 시 sub-sitemap 추가만으로 확장 가능.

### 1.5 색인되지 않을 URL 배제
- **검색 결과에 표시할 의도가 없는 URL은 sitemap에 넣지 말 것**.
- HypeProof에서 `noindex` 처리된 페이지 → sitemap에서 제외:
  - `/dashboard` (`web/src/app/dashboard/page.tsx:10`: `robots: { index: false }`)
  - `/academy-timeline` (`page.tsx:10`: 동일)

### 1.6 형식
- XML 권장 (이미지/동영상/hreflang 지원). RSS, txt도 가능하지만 다국어/이미지 메타 못 담음.
- HypeProof는 **Route Handler(`Response()`)** 패턴 사용 (이전 `MetadataRoute.Sitemap` 자동 직렬화에서 전환). 응답 헤더(`Content-Type`, `Cache-Control`, `X-Robots-Tag`) 100% 명시 보장. §3, §7 사례 8 참조.

---

## 2. robots.txt 핵심 규칙

출처: https://developers.google.com/search/docs/crawling-indexing/robots/intro

### 2.1 그룹 상속 규칙 (실수 1순위)
> "When more than one user-agent is specified, the crawler picks the **most specific group**."

**의미**: User-agent에 자체 그룹이 있으면 `User-Agent: *` 규칙은 **완전히 무시**됨.

**HypeProof 과거 버그** (2026-04-27 fix):
```ts
// ❌ 변경 전 — Googlebot 그룹은 빈 그룹이 됨
{ userAgent: 'Googlebot', crawlDelay: 0 },  // crawlDelay:0이 falsy로 누락
// 결과: User-Agent: Googlebot\n[빈 줄] → /api/, /admin/ Disallow 무효
```
```ts
// ✅ 변경 후 — Googlebot 그룹에 명시적 allow/disallow
{ userAgent: 'Googlebot', allow: '/', disallow: blockedPaths },
```

**규칙**: Googlebot, Googlebot-Image, Bingbot, Yeti(네이버) 등 **자체 그룹을 만든 모든 user-agent에는 allow/disallow를 명시**한다. `*` 그룹에 의존하지 마라.

### 2.2 AI 봇 정책 (HypeProof 표준)
| 카테고리 | 정책 | 예시 user-agent |
|---|---|---|
| **검색엔진** | Allow | Googlebot, Bingbot, Yeti, DuckDuckBot |
| **AI 학습봇** | **Disallow** (콘텐츠 무단 학습 방지) | GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider |
| **AI 인용봇** | Allow (실시간 검색 인용 허용) | ChatGPT-User, OAI-SearchBot, Claude-SearchBot, PerplexityBot |

상세 정의는 `web/src/app/robots.ts` 참조.

### 2.3 sitemap 라인
- robots.txt 어느 위치에든 `Sitemap: https://hypeproof-ai.xyz/sitemap.xml` 한 줄 필요.
- Next.js `robots.ts`의 반환 객체에서 `sitemap: '...'` 필드로 자동 추가됨.

---

## 3. HypeProof 사이트맵 구조 (현재 구현)

**2026-04-29 기준 — Sitemap Index + 4 sub-sitemap 구조**.

```
web/src/
├── lib/sitemap-helpers.ts            ← escapeXml, urlsetXml, sitemapindexXml,
│                                       SITE_URL, SITEMAP_HEADERS, type Entry/Item
└── app/
    ├── sitemap.xml/route.ts          ← Sitemap Index (sitemapindex schema)
    ├── sitemap-static.xml/route.ts   ← /, /columns, /research, /novels, /creators, /glossary, /ai-personas, /identity (8 URLs)
    ├── sitemap-columns.xml/route.ts  ← KO 칼럼 + EN-only (~34 URLs, hreflang ko/en/x-default)
    ├── sitemap-research.xml/route.ts ← KO 리서치 + EN-only (~43 URLs, 동일)
    └── sitemap-novels.xml/route.ts   ← KO 노벨 (~32 URLs, 단일 locale)
```

Search Console에는 **sitemap index URL(`https://hypeproof-ai.xyz/sitemap.xml`)만 제출**. Google이 자동으로 sub-sitemap 발견.

### 3.1 sitemap.xml (Index)

각 sub-sitemap의 `<loc>`와 `<lastmod>`(sub의 콘텐츠 중 최신 시점) 포함. 출력 예:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>https://hypeproof-ai.xyz/sitemap-static.xml</loc></sitemap>
<sitemap><loc>https://hypeproof-ai.xyz/sitemap-columns.xml</loc><lastmod>2026-04-08T00:00:00.000Z</lastmod></sitemap>
<sitemap><loc>https://hypeproof-ai.xyz/sitemap-research.xml</loc><lastmod>2026-04-04T00:00:00.000Z</lastmod></sitemap>
<sitemap><loc>https://hypeproof-ai.xyz/sitemap-novels.xml</loc><lastmod>2026-02-11T00:00:00.000Z</lastmod></sitemap>
</sitemapindex>
```

### 3.2 sub-sitemap별 lastmod 산출
| Sub-sitemap | URLs | lastModified 산출 |
|---|---|---|
| `sitemap-static.xml` | `/`, `/columns`, `/research`, `/novels`, `/creators`, `/glossary`, `/ai-personas`, `/identity` | 인덱스 페이지(`/`, `/columns` 등)는 콘텐츠 중 최신 date. `/creators`, `/glossary`, `/ai-personas`, `/identity`는 추적 불가 → **lastmod 생략** (Google 권장: 검증 불가 시 안 넣는 게 신뢰점수에 좋음) |
| `sitemap-columns.xml` | KO 칼럼 base + EN-only | 각 frontmatter의 `updated || date` |
| `sitemap-research.xml` | KO 리서치 base + EN-only | 동일 |
| `sitemap-novels.xml` | KO 노벨 (단일 locale) | 동일 |

### 3.3 콘텐츠 라우트 + hreflang

각 콘텐츠 entry:
- KO base URL을 `<loc>`로 (`/columns/<slug>`, 쿼리 없음)
- KO/EN 둘 다 있으면 `<xhtml:link rel="alternate" hreflang="...">`로 ko/en/**x-default** 3개 출력 (페이지 head의 alternates와 정합 필수)
- EN-only 슬러그는 별도 entry (`?lang=en` URL)
- `lastmod = frontmatter.updated || frontmatter.date`

출력 예:
```xml
<url>
<loc>https://hypeproof-ai.xyz/columns/2026-02-10-era-of-the-chairman</loc>
<lastmod>2026-02-10T00:00:00.000Z</lastmod>
<xhtml:link rel="alternate" hreflang="ko" href="https://hypeproof-ai.xyz/columns/2026-02-10-era-of-the-chairman?lang=ko"/>
<xhtml:link rel="alternate" hreflang="en" href="https://hypeproof-ai.xyz/columns/2026-02-10-era-of-the-chairman?lang=en"/>
<xhtml:link rel="alternate" hreflang="x-default" href="https://hypeproof-ai.xyz/columns/2026-02-10-era-of-the-chairman"/>
</url>
```

### 3.4 응답 헤더 (모든 sitemap 공통)

`web/src/lib/sitemap-helpers.ts`의 `SITEMAP_HEADERS` 상수 사용:
- `Content-Type: application/xml; charset=utf-8`
- `Cache-Control: public, max-age=0, s-maxage=3600, must-revalidate`
- `X-Robots-Tag: noindex` (sitemap 자체는 색인 대상 아님)

belt-and-suspenders로 `next.config.ts`의 `headers()` 콜백에서도 `/sitemap.xml`, `/sitemap-:type.xml` path에 동일 헤더 명시.

### 3.5 ⚡ 새 콘텐츠 타입 추가 절차 (예: interviews, podcasts)

새 콘텐츠 타입(`/interviews/[slug]`, `/podcasts/[slug]` 등)을 추가할 때 sitemap index에 동적으로 끼워 넣는 절차:

**Step 1 — 콘텐츠 라이브러리 함수 만들기**
`web/src/lib/<type>.ts`에 다음 패턴 (columns.ts 참조):
- `getAll<Type>(locale)` — 해당 locale의 콘텐츠 전체 반환
- `getAvailableLocalesFor<Type>Slug(slug)` — slug별 지원 locale 반환 (KO/EN 페어링 시 필수)

**Step 2 — sub-sitemap route 추가**
`web/src/app/sitemap-<type>.xml/route.ts` 신규 생성. `sitemap-columns.xml/route.ts`를 그대로 복사 후 `getAllColumns` → `getAll<Type>`로 치환:

```typescript
import { getAll<Type>, getAvailableLocalesFor<Type>Slug } from '@/lib/<type>'
import {
  SITE_URL, SITEMAP_HEADERS, urlsetXml, lastmodFromContent, type Entry,
} from '@/lib/sitemap-helpers'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  const koItems = getAll<Type>('ko')
  const enItems = getAll<Type>('en')
  // ... ko base + EN-only entries 패턴 그대로 ...
  return new Response(urlsetXml([...koEntries, ...enOnlyEntries]), {
    status: 200, headers: SITEMAP_HEADERS,
  })
}
```

단일 locale(novels처럼)이면 `sitemap-novels.xml/route.ts` 패턴 사용.

**Step 3 — sitemap index에 등록 (필수)**
`web/src/app/sitemap.xml/route.ts`의 `refs` 배열에 신규 sub-sitemap 추가:

```typescript
const refs: SitemapRef[] = [
  { loc: `${SITE_URL}/sitemap-static.xml` },
  { loc: `${SITE_URL}/sitemap-columns.xml`, lastmod: maxDate([...koColumns, ...enColumns]) },
  { loc: `${SITE_URL}/sitemap-research.xml`, lastmod: maxDate([...koResearch, ...enResearch]) },
  { loc: `${SITE_URL}/sitemap-novels.xml`, lastmod: maxDate(koNovels) },
  // 👇 이 줄 추가
  { loc: `${SITE_URL}/sitemap-<type>.xml`, lastmod: maxDate([...koItems, ...enItems]) },
]
```

**Step 4 — sitemap-static.xml에 인덱스 페이지 등록 (필요 시)**
새 콘텐츠 타입이 인덱스 페이지(예: `/interviews`)를 가지면 `sitemap-static.xml/route.ts`의 `entries` 배열에 추가.

**Step 5 — robots.ts noindex 점검**
새 콘텐츠 타입에 `noindex`로 처리할 라우트(예: `/<type>/draft`)가 있다면 §1.5 따라 sitemap에서 제외.

**Step 6 — 배포 후 검증**
§4 검증 체크리스트 전체 실행. 새 sub-sitemap 라이브 응답 확인:
```bash
curl -sI 'https://hypeproof-ai.xyz/sitemap-<type>.xml' | grep -iE 'content-type|x-robots'
curl -s 'https://hypeproof-ai.xyz/sitemap-<type>.xml' | grep -c '<url>'
```

**Step 7 — Search Console**
sitemap index URL은 이미 등록돼 있으므로 별도 제출 불필요. Google이 다음 fetch 사이클(보통 24~48h)에 새 sub-sitemap 자동 발견.

### 3.6 변경 이력 (sitemap 관련)
| 날짜 | 변경 |
|---|---|
| 2026-04-27 | 단일 sitemap.xml에 콘텐츠 페이지 동적 추가 (Metadata Route) |
| 2026-04-29 | canonical 중복 제거 (layout.tsx 직접 JSX 삭제) |
| 2026-04-29 | hreflang `x-default` 추가 (페이지-사이트맵 정합) |
| 2026-04-29 | `MetadataRoute.Sitemap` → **Route Handler** 전환. `Response()` 객체에 `Content-Type: application/xml; charset=utf-8` 명시 (Search Console "Incorrect http header content-type: text/html" 진단 fix) |
| 2026-04-29 | **Sitemap Index + 4 sub-sitemap 분할 구조**로 선제 전환 (forward-compat). 새 콘텐츠 타입 추가 시 §3.5 절차 |

---

## 4. 배포 후 검증 체크리스트

배포 직후 반드시 확인:

```bash
# 1) sitemap index가 sitemapindex schema인지 + 4 sub-sitemap 참조하는지
curl -s https://hypeproof-ai.xyz/sitemap.xml | grep -c '<sitemap>'   # → 4
curl -s https://hypeproof-ai.xyz/sitemap.xml | grep -oE '<loc>[^<]+' | sed 's/<loc>//'

# 2) 각 sub-sitemap의 URL 수
curl -s https://hypeproof-ai.xyz/sitemap-static.xml   | grep -c '<url>'   # 8 (정적 라우트)
curl -s https://hypeproof-ai.xyz/sitemap-columns.xml  | grep -c '<url>'   # 34+ KO 칼럼 + EN-only
curl -s https://hypeproof-ai.xyz/sitemap-research.xml | grep -c '<url>'   # 43+ KO 리서치 + EN-only
curl -s https://hypeproof-ai.xyz/sitemap-novels.xml   | grep -c '<url>'   # 32+ KO 노벨

# 3) 모든 sitemap 응답이 Content-Type: application/xml + X-Robots-Tag: noindex
for path in sitemap.xml sitemap-static.xml sitemap-columns.xml sitemap-research.xml sitemap-novels.xml; do
  echo "=== $path ==="
  curl -sI "https://hypeproof-ai.xyz/$path" | grep -iE '^(content-type|cache-control|x-robots-tag):'
done
# 기대: 모두 application/xml; charset=utf-8 / public, max-age=0, s-maxage=3600 / noindex

# 4) Googlebot 그룹에 Allow 명시 확인 — 빈 줄이 아니라 Allow: / 가 떠야 함
curl -s https://hypeproof-ai.xyz/robots.txt | grep -A2 '^User-Agent: Googlebot$'

# 5) sub-sitemap의 lastmod이 빌드 시간이 아닌지 — 콘텐츠별로 다른 날짜여야 함
curl -s https://hypeproof-ai.xyz/sitemap-columns.xml | grep -oE '<lastmod>[^<]+' | sort -u | head -10

# 6) hreflang ko/en/x-default 모두 출력 (3종 동수 권장)
curl -s https://hypeproof-ai.xyz/sitemap-columns.xml | grep -oE 'hreflang="[^"]+"' | sort | uniq -c

# 7) canonical 중복 점검 (페이지마다 1개만)
curl -s 'https://hypeproof-ai.xyz/columns/<sample-slug>' | grep -c 'rel="canonical"'   # → 1

# 8) XML schema 검증 (xmllint)
for path in sitemap.xml sitemap-static.xml sitemap-columns.xml sitemap-research.xml sitemap-novels.xml; do
  curl -s "https://hypeproof-ai.xyz/$path" | xmllint --noout - 2>&1 && echo "✅ $path"
done

# 9) 외부 XSD 검증 (선택)
#    https://www.xml-sitemaps.com/validate-xml-sitemap.html 에 sitemap index URL 입력
```

---

## 5. Search Console 운영

### 5.1 사이트맵 제출
- URL: https://search.google.com/search-console
- 사이트맵 → 새 사이트맵 추가 → **`sitemap.xml`** (sitemap index URL — sub-sitemap은 자동 발견되므로 별도 제출 X)
- 처리 결과: "성공" / "검색됨 URL 수" 확인 — 처리되면 sub-sitemap별 행이 자동으로 추가 표시됨

### 5.1.1 사이트맵 페이지 화면 vs URL 검사 도구 — 비동기 차이 주의
Search Console의 사이트맵 처리는 **비동기 백엔드 큐**라 화면 상태가 stale일 수 있다:
- **사이트맵 페이지 화면** ("가져올 수 없음" 등): 백엔드 큐 처리 결과, 수 시간~며칠 지연
- **URL 검사 도구 → 라이브 URL 테스트**: *지금 이 순간* fetch 시도 결과, 즉시 반영

⚠️ 사이트맵 화면이 빨갛더라도 **라이브 테스트가 초록이면 fetch는 가능 → 시간 문제**. 라이브 테스트도 빨개야 진짜 fetch 실패. 디버깅 시 라이브 테스트가 결정적 진단 도구.

### 5.2 URL 검사 도구
- 특정 URL의 색인 상태 확인 + 즉시 색인 요청 (제한적)
- 우선순위 페이지 5~10개에 사용

### 5.3 색인 적용 시간
- 사이트맵 제출 후 **첫 크롤링: 수 시간 ~ 며칠**
- 색인까지: 1~14일
- "Discovered - currently not indexed" 상태가 길게 가면 콘텐츠 품질·중복·thin content 의심

### 5.4 흔한 Search Console 메시지

| 상태 | 의미 | 조치 |
|---|---|---|
| "사이트맵을 가져올 수 없음" | 사이트맵 URL 404/timeout/403 | curl로 직접 확인. Vercel 배포 상태 점검 |
| "처리됨, 발견된 URL N개" | 정상 처리 | OK. N이 등록 의도대로인지만 확인 |
| "사이트맵에 오류 있음" | XSD 위반, URL 인코딩, 50K 초과 등 | 외부 검증기로 원인 특정 |
| "Discovered - currently not indexed" | Google이 알지만 아직 색인 안 함 | 콘텐츠 품질·내부 링크 강화. 신규 사이트는 정상 |
| "Crawled - currently not indexed" | 크롤은 됐으나 색인 가치 부족 판단 | 중복·얇은 콘텐츠 점검 |
| "Page with redirect" | 리다이렉트 체인 | sitemap에 최종 URL만 등록되도록 수정 |

---

## 6. 네이버 서치어드바이저

- URL: https://searchadvisor.naver.com
- 한국어 콘텐츠 비중 높으므로 **반드시 별도 제출**.
- robots.txt에서 Yeti / Yetibot / Naverbot 그룹 모두 allow 확인 (`web/src/app/robots.ts`).
- 사이트맵 제출 위치: 메뉴 > 요청 > 사이트맵 제출 > `sitemap.xml` 입력.

---

## 7. 흔한 실수 (HypeProof 실제 사례)

이번 사례(2026-04-27 진단 + 수정) 정리:

### ❌ 사례 1: 사이트맵에 정적 라우트 7개만 등록
- 문제: 콘텐츠 페이지 186개가 sitemap에서 누락 → Google 입장에선 "이 사이트는 7개 페이지뿐"
- 검색 결과에 칼럼·리서치·노벨 페이지가 안 뜨는 핵심 원인
- 수정: 동적으로 콘텐츠 슬러그 합치기 (sitemap.ts 현재 구조)

### ❌ 사례 2: Googlebot 그룹이 빈 그룹
- 문제: `{ userAgent: 'Googlebot', crawlDelay: 0 }` → `crawlDelay:0`이 누락되며 빈 그룹 생성
- 결과: Googlebot은 `*` 그룹 무시 → `/api/`, `/admin/`, `/_next/` Disallow가 Googlebot에 적용 안 됨
- 수정: 명시적 `allow: '/', disallow: blockedPaths`

### ❌ 사례 3: 모든 페이지 lastmod에 빌드 시간
- 문제: `lastModified: new Date()` → 빌드 한 번에 모든 페이지가 "방금 수정됨"
- Google이 lastmod 신뢰 잃기 시작 → 신선도 시그널 약화
- 수정: `frontmatter.updated || frontmatter.date`로 산출. 추적 불가 라우트는 생략.

### ❌ 사례 4: priority 차등 부여에 시간 쓰기
- Google이 무시하므로 무의미. 코드 단순화가 우선.

### ❌ 사례 5: changefreq=daily로 과대 신호
- 실제 빌드 안 하면 갱신 안 되는데 daily 신호 → 신뢰도 ↓
- 그냥 빼는 게 정답.

### ❌ 사례 6: layout.tsx에 직접 박은 canonical이 모든 자식 라우트와 충돌 (2026-04-29 fix)
- 문제: `web/src/app/layout.tsx`의 `<head>` 안에 `<link rel="canonical" href="https://hypeproof-ai.xyz" />`를 직접 JSX로 출력
- 동시에 자식 라우트(`columns/[slug]/page.tsx` 등)의 `generateMetadata()`가 `alternates.canonical`로 페이지별 정확한 canonical을 출력
- 결과: 모든 콘텐츠 페이지의 head에 `rel="canonical"` 태그가 **2개** 출력됨 (홈 URL + 페이지 URL)
- Google 공식 정책 (Search Central — Canonicalization): "If a page has more than one rel='canonical' link, Google will ignore all the rel='canonical' hints." → 두 시그널 **모두 무시** → 색인 그룹핑이 알고리즘 추정으로 처리되며 콘텐츠 페이지가 도메인 루트로 통합되어 색인 제외 ("Duplicate, Google chose different canonical")
- 확인: `curl -s <url> | grep -c 'rel="canonical"'` → 2가 나오면 위반
- 수정: layout.tsx에서 직접 JSX `<link rel="canonical">` 제거. canonical은 `metadata.alternates.canonical` (Metadata API)로만 관리. 자식 라우트의 generateMetadata가 자동으로 덮어씀.
- 일반 원칙: **Next.js Metadata API와 직접 JSX `<link>`/`<meta>`를 혼용하지 말 것.** Next.js는 Metadata API끼리만 dedupe하며 직접 JSX는 그대로 출력됨.

### ❌ 사례 7: 'use client' 페이지에 metadata export가 무력화
- 문제: `welcome/page.tsx`, `kids-edu/page.tsx`, `identity/page.tsx`가 `'use client'`로 시작 → page.tsx에 `export const metadata = ...` 또는 `export const generateMetadata = ...` 사용 불가 (Next.js: "metadata can only be exported from a Server Component")
- 결과: 색인 정책(`robots: { index: false }`)을 페이지 자체에 선언할 수 없어 sitemap·robots policy가 회색지대
- 수정 패턴: 동일 라우트에 `layout.tsx` (server component)를 추가하고 거기서 `metadata`를 export. 자식 client page가 metadata를 상속받음.
  - 색인 차단: `robots: { index: false, follow: false }`
  - 색인 허용: layout 또는 page 둘 다에서 metadata 정의 안 하면 root layout의 robots 상속

### ❌ 사례 8: Metadata Route(sitemap.ts)가 transition window에 text/html 응답 (2026-04-29 fix)
- 문제: Search Console "Incorrect http header content-type: text/html; charset=utf-8 (expected: application/xml)". 직접 curl은 항상 `application/xml`이지만 Google이 fetch한 시점엔 HTML.
- 원인: Next.js `MetadataRoute.Sitemap` 파일 컨벤션은 응답 헤더를 Vercel/Next.js 내부에서 자동 결정. Vercel deploy/ISR transition window 또는 prerender 미생성 시점에 fallback으로 default `text/html` 응답 가능.
- 수정: `app/sitemap.ts` (Metadata Route) → `app/sitemap.xml/route.ts` (Route Handler)로 전환. `Response()` 객체에 `headers: { 'Content-Type': 'application/xml; charset=utf-8', ... }` 명시 → 어떤 fallback 시나리오에서도 100% 보장.
- 일반 원칙: **sitemap, RSS feed처럼 응답 헤더 정확성이 중요한 라우트는 Metadata Route 대신 Route Handler 사용**. Response 객체로 헤더 직접 박기.

### ❌ 사례 9: hreflang 페이지-사이트맵 mismatch (x-default 누락) (2026-04-29 fix)
- 문제: 페이지 head에는 `<link rel="alternate" hreflang="x-default" ...>`가 있는데 sitemap의 `<xhtml:link>`에는 ko/en만 있고 x-default 누락.
- Google docs: "The hreflang in your sitemap must match the hreflang on your pages." 위반.
- 결과: sitemap fetch 자체 실패 직접 원인은 아니지만 SEO 품질 평가에 부정적. 한 번 mismatch 캐시되면 색인 지연.
- 수정: KO/EN 둘 다 있는 슬러그에 `alternates['x-default'] = base URL`(쿼리 없는 형태) 추가. `sitemap-columns.xml/route.ts`, `sitemap-research.xml/route.ts` 모두 동일 패턴.
- 검증: `curl -s sitemap-*.xml | grep -oE 'hreflang="[^"]+"' | sort | uniq -c` → ko / en / x-default 셋 다 같은 수.

### ✅ 사례 10: 단일 sitemap → Sitemap Index 선제 분할 (2026-04-29 결정)
- 결정: 117 URLs로 50,000 한참 미만이지만 미래 확장(콘텐츠 타입 추가, URL 폭증) 대비해 sitemap index + 4 sub-sitemap 구조로 *선제 전환*.
- 근거: `MetadataRoute.Sitemap` → Route Handler 전환을 어차피 해야 했고, 분할 구조도 같이 하면 추후 단일 → 분할 마이그레이션 부담 0.
- 구조: §3 참조. 새 콘텐츠 타입 추가 시 §3.5의 7-step 절차 따라 sub-sitemap 1개 추가 + index에 1줄 등록.
- Trade-off: 코드 ~250줄 (helpers.ts + 5 route handlers). 단 helper로 중복 제거 → 각 route는 ~20줄.
- ⚠️ Search Console 영향: 사이트맵 등록 URL은 그대로 `https://hypeproof-ai.xyz/sitemap.xml`. Google이 sitemapindex schema를 자동 인식해 sub-sitemap을 발견하므로 별도 작업 0.

---

## 8. 향후 작업 시 확인 사항

| 작업 | 본 문서 어느 절을 참조 |
|---|---|
| 새 정적 라우트 추가 (예: `/blog`) | §3.2 — sitemap-static.xml/route.ts의 `entries` 배열에 추가 |
| **새 콘텐츠 타입 추가** (예: 인터뷰, 팟캐스트) | **§3.5 — 7-step 절차**: lib/<type>.ts → sitemap-<type>.xml/route.ts → sitemap.xml index에 등록 → 검증 |
| 콘텐츠 DB 마이그레이션 (markdown → Supabase) | §3.2 — `lastmod` 산출이 Supabase row의 `updated_at`로 바뀜. Storage URL은 next.config.ts `remotePatterns`에 도메인 추가 필요. `docs/MIGRATION-RUNBOOK.md §5.4` 도 참조 |
| 새 AI 봇 등장 (학습/인용) | §2.2 — robots.ts의 해당 카테고리에 추가 |
| Google Search Console 에러 대응 | §5.4 (메시지별 조치표), §5.1.1 (사이트맵 페이지 vs URL 검사 도구 차이) |
| sitemap fetch 디버깅 | §4 검증 체크리스트 + §5.1.1 비동기 캐시 + §7 사례 6/8/9 |
| 네이버 노출 최적화 | §6 + §1.3 (네이버는 priority 일부 참고하므로 재검토 가능) |

---

## 9. 변경 이력

| 날짜 | 작업 | PR/커밋 |
|---|---|---|
| 2026-04-27 | sitemap.ts 콘텐츠 페이지 동적 추가 / lastmod 정확화 / hreflang. robots.ts Googlebot 그룹 명시. SEO 문서 신설 | 초기 |
| 2026-04-29 | layout.tsx의 하드코딩 `<link rel="canonical">` 제거 (canonical 중복 해결). `/welcome`·`/kids-edu` noindex 처리 (layout.tsx로 metadata 분리). `/identity` sitemap 등록. §7 사례 6·7 추가 | PR #40 |
| 2026-04-29 | identity 페이지 "HypeProof" → "HypeProof Lab" 브랜딩 통일 (6곳) | PR #42 |
| 2026-04-29 | sitemap Route Handler 전환 + Content-Type 명시 + hreflang x-default 추가 + next.config.ts 헤더 명시. §7 사례 8·9 추가 | PR #41 |
| 2026-04-29 | Sitemap Index + 4 sub-sitemap 분할 (forward-compat). lib/sitemap-helpers.ts 공통 유틸. §3 전면 재작성 + §3.5 새 콘텐츠 타입 추가 절차 + §7 사례 10 추가 | (이 변경) |

---

## 10. 참고 링크

- [Google: 사이트맵 만들기 (KO)](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko)
- [Google: robots.txt 소개](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: hreflang 사용법](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Next.js sitemap.ts 공식](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js robots.ts 공식](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [sitemaps.org 프로토콜](https://www.sitemaps.org/protocol.html)
- [네이버 서치어드바이저 가이드](https://searchadvisor.naver.com/guide)
- 프로젝트 내부: `nextjs-sitemap-guide.md` (dendenCare 기반 일반 가이드, 본 문서가 우선)
