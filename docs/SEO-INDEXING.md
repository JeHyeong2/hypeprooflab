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

### 1.4 크기 제한
- 사이트맵 1개 = **50,000 URL / 50MB**.
- 현재 콘텐츠 약 200건 → 한참 멀음. 분할 불필요.
- 1,000건 넘어가기 시작하면 `generateSitemaps`로 분할.

### 1.5 색인되지 않을 URL 배제
- **검색 결과에 표시할 의도가 없는 URL은 sitemap에 넣지 말 것**.
- HypeProof에서 `noindex` 처리된 페이지 → sitemap에서 제외:
  - `/dashboard` (`web/src/app/dashboard/page.tsx:10`: `robots: { index: false }`)
  - `/academy-timeline` (`page.tsx:10`: 동일)

### 1.6 형식
- XML 권장 (이미지/동영상/hreflang 지원). RSS, txt도 가능하지만 다국어/이미지 메타 못 담음.
- HypeProof는 XML 사용 (`MetadataRoute.Sitemap` → XML 자동 직렬화).

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

파일: `web/src/app/sitemap.ts`

### 3.1 정적 라우트
| 라우트 | lastModified 산출 | 비고 |
|---|---|---|
| `/` | 모든 콘텐츠 중 최신 date | 홈은 콘텐츠 추가/수정 시 갱신 |
| `/columns` | KO+EN 칼럼 중 최신 date | 인덱스 페이지 |
| `/research` | KO+EN 리서치 중 최신 date | |
| `/novels` | KO 노벨 중 최신 date | |
| `/creators`, `/glossary`, `/ai-personas` | **lastModified 없음** | 데이터 변경 추적 불가 → 의도적 생략 |

### 3.2 콘텐츠 라우트
- 각 KO 슬러그를 base entry로 등록. URL은 쿼리 없는 형태(`/columns/<slug>`).
- KO/EN 둘 다 있으면 `alternates.languages`로 hreflang 자동 생성.
- EN-only 슬러그는 별도 entry (`?lang=en` 명시).
- `lastModified = frontmatter.updated || frontmatter.date`.

### 3.3 hreflang 출력 예시
```xml
<url>
  <loc>https://hypeproof-ai.xyz/columns/2026-02-10-era-of-the-chairman</loc>
  <lastmod>2026-02-10T00:00:00.000Z</lastmod>
  <xhtml:link rel="alternate" hreflang="ko" href="https://hypeproof-ai.xyz/columns/2026-02-10-era-of-the-chairman?lang=ko"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://hypeproof-ai.xyz/columns/2026-02-10-era-of-the-chairman?lang=en"/>
</url>
```

---

## 4. 배포 후 검증 체크리스트

배포 직후 반드시 확인:

```bash
# 1) 사이트맵에 콘텐츠 페이지 모두 들어갔는지 — 200개 가까이 나와야 함
curl -s https://hypeproof-ai.xyz/sitemap.xml | grep -c '<url>'

# 2) Googlebot 그룹에 Allow 명시 확인 — 빈 줄이 아니라 Allow: / 가 떠야 함
curl -s https://hypeproof-ai.xyz/robots.txt | grep -A2 '^User-Agent: Googlebot$'

# 3) sitemap의 lastmod이 빌드 시간이 아닌지 — 콘텐츠별로 다른 날짜여야 함
curl -s https://hypeproof-ai.xyz/sitemap.xml | grep -oE '<lastmod>[^<]+' | sort -u | head -10

# 4) sitemap.xml 200 응답 + content-type
curl -sI https://hypeproof-ai.xyz/sitemap.xml | head -5

# 5) XSD 검증 (외부 도구)
#    https://www.xml-sitemaps.com/validate-xml-sitemap.html 에 sitemap URL 입력
```

---

## 5. Search Console 운영

### 5.1 사이트맵 제출
- URL: https://search.google.com/search-console
- 사이트맵 → 새 사이트맵 추가 → `sitemap.xml` (도메인 뒤 경로만)
- 처리 결과: "성공" / "검색됨 URL 수" 확인

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

---

## 8. 향후 작업 시 확인 사항

| 작업 | 본 문서 어느 절을 참조 |
|---|---|
| 새 라우트 추가 | §3.1 — sitemap.ts에 추가하면서 lastModified 산출 방식 결정 |
| 새 콘텐츠 타입 추가 (예: 인터뷰) | §3.2 — `lib/<type>.ts`에 `getAll<Type>` + `getAvailableLocales...` 만들고 sitemap.ts에서 동일 패턴으로 추가 |
| 콘텐츠 DB 마이그레이션 (markdown → Supabase) | §3.2 — `lastmod` 산출이 Supabase row의 `updated_at`로 바뀜. Storage URL은 next.config.ts `remotePatterns`에 도메인 추가 필요 |
| 새 AI 봇 등장 (학습/인용) | §2.2 — robots.ts의 해당 카테고리에 추가 |
| Google Search Console 에러 대응 | §5.4 — 메시지별 조치표 |
| 네이버 노출 최적화 | §6 + §1.3 (네이버는 priority 일부 참고하므로 재검토 가능) |

---

## 9. 변경 이력

| 날짜 | 작업 | PR/커밋 |
|---|---|---|
| 2026-04-27 | sitemap.ts 콘텐츠 페이지 동적 추가 / lastmod 정확화 / hreflang. robots.ts Googlebot 그룹 명시. SEO 문서 신설 | (이 변경) |

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
