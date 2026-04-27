---
name: nextjs-sitemap-robots-guide
description: Next.js 13+ App Router 프로젝트의 sitemap.ts · robots.ts 작동 원리와 타 프로젝트 이식용 실전 가이드. withdenden(dendenCare) 2026-04 기준 — AI 학습봇/인용봇 분리, Googlebot-* 세분화, dev 환경 전면 차단 포함.
scope: reusable-template
base-project: dendenCare
base-files: denden/app/sitemap.ts, denden/app/robots.ts
verified: 2026-04-21
---

# Next.js `sitemap.ts` / `robots.ts` 이식 가이드

dendenCare(`denden/app/sitemap.ts` · `denden/app/robots.ts`)의 실제 구현을 해체하고, 다른 Next.js 13+ App Router 프로젝트에 **파일 두 개만 복사**해서 바로 적용할 수 있도록 정리한 문서.

---

## 0. 한눈에 보기

```
app/
├─ sitemap.ts   → /sitemap.xml   (크롤러에 URL 목록 제공)
└─ robots.ts    → /robots.txt    (크롤러에 진입 규칙 제공)
```

- **파일만 만들면 라우트 자동 등록** — 별도 `route.ts` 불필요
- **빌드 시점 평가** — 정적 출력(`next build`)은 그때 만든 XML/TXT가 배포까지 그대로
- **동적 필요 시 `async` 함수 + `revalidate`** — ISR 가능
- **검색엔진에 자동 제출 안 됨** — Google Search Console / 네이버 서치어드바이저에 **수동 제출 필수**

---

## 1. 작동 원리 (왜 이 두 파일이면 끝인가)

### 1.1 Next.js 파일 규칙
`app/sitemap.ts`가 **기본 export 함수**를 내보내면 Next.js가 자동으로:
1. 라우트 `/sitemap.xml` 생성
2. 함수 반환값 → `<urlset>` XML로 직렬화
3. `Content-Type: application/xml` 헤더 부여

`robots.ts`도 동일 — 반환값이 `robots.txt` 포맷으로 변환됨.

### 1.2 타입 안전성
`MetadataRoute.Sitemap` · `MetadataRoute.Robots` 타입이 강제하므로 오타/누락이 **빌드 타임**에 잡힘.

### 1.3 시그널 우선순위
검색엔진이 사이트맵에서 **실제로** 참고하는 순서:
```
lastModified  >  changeFrequency  >  priority
```
- `lastModified`: Google이 **가장 신뢰**. AI 검색(2026) 신선도 시그널.
- `changeFrequency`: **힌트**일 뿐 강제 아님.
- `priority`: Google은 거의 무시 (모든 사이트가 1.0 박아놔서 신뢰도 ↓). 네이버/Bing은 일부 참고.

---

## 2. `sitemap.ts` 템플릿 (dendenCare 구현 축약)

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL || 'https://yoursite.com'
  const lastModified = new Date()

  // 정적 라우트 선언 — 메인=1.0 기준으로 상대적 서열화
  const staticRoutes = [
    { path: '',                priority: 1.0,  changeFrequency: 'weekly'  as const },
    { path: '/about',          priority: 0.9,  changeFrequency: 'monthly' as const },
    { path: '/services',       priority: 0.85, changeFrequency: 'monthly' as const },
    { path: '/apply',          priority: 0.8,  changeFrequency: 'monthly' as const },
    { path: '/contact',        priority: 0.6,  changeFrequency: 'yearly'  as const },
    { path: '/privacy-policy', priority: 0.3,  changeFrequency: 'yearly'  as const },
  ]

  return staticRoutes.map(route => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
```

### 2.1 이식 체크리스트
- [ ] `staticRoutes` 배열을 해당 프로젝트 라우트로 교체
- [ ] `SITE_URL` 환경변수 프로덕션 값 설정
- [ ] 비공개/관리자 경로는 **포함하지 말 것** (`robots.ts` Disallow와 모순되면 안 됨)
- [ ] 쿼리스트링 포함 URL 제외 (canonical만)

### 2.2 `priority` 가이드 값

| 값 | 페이지 종류 |
|---|---|
| `1.0` | 홈(메인) |
| `0.9` | 대표 서비스 소개, 핵심 랜딩 |
| `0.8` | 주요 전환 페이지 (신청/예약), 서비스 상세 |
| `0.7` | 개별 상세, 서브 폼 |
| `0.5` | 보조/부가 페이지 |
| `0.3` | 법적 페이지 (개인정보처리방침 등) |

> 전부 1.0은 무의미. **상대적 서열**이 핵심.

### 2.3 `changeFrequency` 가이드

| 값 | 적합한 페이지 |
|---|---|
| `always` / `hourly` | 실시간 피드, 뉴스 |
| `daily` | 블로그 메인, 상품 목록 |
| `weekly` | 홈, 카테고리, 자주 업데이트되는 랜딩 |
| `monthly` | About, 서비스 소개, 폼 페이지 |
| `yearly` | 약관, 개인정보처리방침 |
| `never` | 아카이브 |

---

## 3. `robots.ts` 템플릿 (dendenCare 구현 — AI 봇 정책 포함)

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NODE_ENV === 'production'
  const siteUrl = process.env.SITE_URL || 'https://yoursite.com'

  // ── 개발/스테이징: 전면 차단 ──
  if (!isProd) {
    return {
      rules: { userAgent: '*', disallow: '/' },
      sitemap: undefined,
    }
  }

  // ── 비공개 경로 (어디서나 차단) ──
  const blockedPaths = [
    '/api/*',
    '/admin/*',
    '/dashboard/*',
  ]

  return {
    rules: [
      // 1) 일반 크롤러 기본 규칙
      {
        userAgent: '*',
        allow: [
          '/',
          '/favicon.ico',
          '/favicons/*',
          '/images/*',
          '/og/*',
          '/_next/static/*',
          '/_next/image/*',
        ],
        disallow: [
          ...blockedPaths,
          '/_next/webpack-*',
          '*.json',
          '/private/*',
        ],
        crawlDelay: 1,
      },

      // 2) 주요 엔진 세분화
      { userAgent: 'Googlebot',        crawlDelay: 0 },
      { userAgent: 'Googlebot-Image',  allow: ['/images/*', '/og/*'], crawlDelay: 0 },
      { userAgent: 'Googlebot-News',   disallow: ['/'] },         // 뉴스 아님
      { userAgent: 'Yeti',             crawlDelay: 1 },           // 네이버
      { userAgent: 'Bingbot',          crawlDelay: 1 },
      { userAgent: 'DuckDuckBot',      crawlDelay: 2 },

      // 3) AI 학습봇 — 학습 차단 (검색 인용에는 영향 없음)
      { userAgent: 'GPTBot',             disallow: '/' },         // OpenAI 학습
      { userAgent: 'ClaudeBot',          disallow: '/' },         // Anthropic 학습
      { userAgent: 'anthropic-ai',       disallow: '/' },         // Anthropic bulk
      { userAgent: 'Google-Extended',    disallow: '/' },         // Gemini 학습
      { userAgent: 'CCBot',              disallow: '/' },         // Common Crawl
      { userAgent: 'Bytespider',         disallow: '/' },         // ByteDance
      { userAgent: 'Meta-ExternalAgent', disallow: '/' },         // Meta AI 학습

      // 4) AI 인용봇 — 실시간 검색 답변에 인용되도록 허용
      { userAgent: 'ChatGPT-User',       allow: '/', disallow: blockedPaths },
      { userAgent: 'OAI-SearchBot',      allow: '/', disallow: blockedPaths },
      { userAgent: 'Claude-SearchBot',   allow: '/', disallow: blockedPaths },
      { userAgent: 'Claude-User',        allow: '/', disallow: blockedPaths },
      { userAgent: 'PerplexityBot',      allow: '/', disallow: blockedPaths },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
```

### 3.1 핵심 설계 의도 (dendenCare에서 검증된 것)

| 결정 | 이유 |
|---|---|
| **dev 환경 전면 차단** | 스테이징/미리보기 URL이 색인되면 중복 컨텐츠 + 내부 경로 노출 |
| **AI 학습봇 Disallow** | 콘텐츠 무단 학습 방지 (저작권 보호) |
| **AI 인용봇 Allow** | 2026 표준 — ChatGPT/Claude/Perplexity 실시간 답변에 인용될 경로 확보 |
| **Googlebot-News Disallow** | 뉴스 사이트가 아닌데 뉴스 크롤러가 오면 불필요 대역폭 |
| **Googlebot-Image 별도 허용** | 이미지 검색 유입 극대화 |
| **`crawlDelay` 차등** | 주요 엔진은 0/1, 부차적 엔진은 2로 서버 부담 완화 |

### 3.2 AI 봇 정책 선택 (3가지 중 택1)

| 목적 | 정책 |
|---|---|
| 모든 AI 활용 희망 | 학습봇도 Allow (콘텐츠가 AI에 녹아들어도 OK) |
| 무단 학습 거부 + 검색 인용은 원함 ⭐ **표준** | 학습봇 Disallow + 인용봇 Allow (위 템플릿) |
| 전면 차단 | 둘 다 Disallow |

---

## 4. 환경변수

```bash
# .env.local (개발)
SITE_URL=http://localhost:3000

# 프로덕션 (Vercel/Netlify/기타)
SITE_URL=https://yoursite.com
```

> `SITE_URL` 미설정 시 코드의 기본값(`https://yoursite.com`)이 하드코딩됨. 배포 전 반드시 설정.

---

## 5. 동적 라우트 확장

정적 사이트 범위를 넘을 때 `staticRoutes`에 더해 동적 URL을 합친다.

### 5.1 파일 시스템 (MDX 블로그 등)
```typescript
import { readdirSync } from 'fs'
import { join } from 'path'

const blogDir = join(process.cwd(), 'content/blog')
const blogRoutes = readdirSync(blogDir)
  .filter(f => f.endsWith('.mdx'))
  .map(filename => ({
    url: `${siteUrl}/blog/${filename.replace('.mdx', '')}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

return [...staticSitemap, ...blogRoutes]
```

### 5.2 DB/API (async 전환)
```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 },  // ISR: 1시간마다 재생성
  }).then(r => r.json())

  const dynamic = posts.map((p: { slug: string; updatedAt: string }) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticSitemap, ...dynamic]
}
```

> **주의**: 빌드 시 외부 호출 실패 → 빌드 실패. try/catch로 fallback 배열 준비 권장.

### 5.3 다국어 (`alternates`)
```typescript
{
  url: `${siteUrl}/`,
  lastModified: now,
  alternates: {
    languages: {
      ko: `${siteUrl}/ko`,
      en: `${siteUrl}/en`,
    },
  },
}
```

---

## 6. 대규모 사이트: `generateSitemaps`

URL **50,000개 초과** 또는 파일 **50MB 초과** 시 필수. Next.js 14.2+에서 분할 지원.

```typescript
const PAGE_SIZE = 10000

export async function generateSitemaps() {
  const count = await db.post.count({ where: { published: true } })
  const total = Math.ceil(count / PAGE_SIZE)
  return Array.from({ length: total }, (_, i) => ({ id: i }))
}

export default async function sitemap(
  { id }: { id: number }
): Promise<MetadataRoute.Sitemap> {
  const posts = await db.post.findMany({
    where: { published: true },
    skip: id * PAGE_SIZE,
    take: PAGE_SIZE,
    select: { slug: true, updatedAt: true },
  })

  return posts.map(p => ({
    url: `${siteUrl}/posts/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))
}
```

**결과 URL**: `/sitemap/0.xml`, `/sitemap/1.xml`, ... + `/sitemap.xml`(index)

---

## 7. 검증

### 7.1 로컬
```bash
npm run build && npm start
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt
```

### 7.2 배포 후
```bash
curl https://yoursite.com/sitemap.xml
curl https://yoursite.com/robots.txt | grep -i sitemap   # 자동 연결 확인
```

### 7.3 외부 검증기 / 수동 제출

| 도구 | URL |
|---|---|
| XML 검증기 | https://www.xml-sitemaps.com/validate-xml-sitemap.html |
| Google Search Console | https://search.google.com/search-console |
| 네이버 서치어드바이저 | https://searchadvisor.naver.com |
| Bing Webmaster Tools | https://www.bing.com/webmasters |

> **Search Console에 수동 제출 안 하면** robots.txt에 명시만 하고 있어도 발견까지 며칠 소요. 반드시 제출 단계 거칠 것.

---

## 8. 흔한 실수

| ❌ | ✅ |
|---|---|
| `{ url: '/about' }` | `{ url: 'https://yoursite.com/about' }` (절대 URL) |
| 모든 페이지 `priority: 1.0` | 상대적 서열로 차등 |
| `lastModified` 생략 | 최소한 `new Date()`라도 |
| Disallow 경로를 sitemap에 포함 | sitemap ↔ robots 일관성 확인 |
| `/?utm_source=…` 포함 | canonical URL만 |
| HTTP/HTTPS 혼용 | HTTPS 통일 |
| 빌드 실패 무시 | 배포 전 `curl /sitemap.xml` 200 확인 |

---

## 9. 배포 체크리스트

**배포 전**
- [ ] `app/sitemap.ts`, `app/robots.ts` 존재
- [ ] `SITE_URL` 프로덕션 값 설정
- [ ] 로컬 빌드 → `/sitemap.xml`, `/robots.txt` 정상 응답
- [ ] XML 검증기 통과
- [ ] sitemap의 모든 URL이 robots.txt Allow 범위 내

**배포 직후**
- [ ] `curl https://도메인/sitemap.xml` 200
- [ ] `curl https://도메인/robots.txt`에 `Sitemap: …` 포함
- [ ] Google Search Console 사이트맵 제출
- [ ] 네이버 서치어드바이저 사이트맵 제출 (한국 서비스)

**1~2주 후**
- [ ] Search Console "발견된 URL 수" ≈ 기대치
- [ ] 색인 오류(4xx/5xx, robots 차단) 없음
- [ ] `lastModified` 갱신 유지

---

## 10. FAQ

### Q. sitemap 없어도 크롤링 되나요?
링크만으로도 가능. 하지만 sitemap은 발견 속도 ↑, 신선도/중요도 힌트 ↑, Search Console 추적 가능 ↑.

### Q. sitemap은 언제 갱신되나요?
`next build` 때마다 재생성. 재배포 없이 최신 유지하려면 `revalidate` 붙여 ISR.

### Q. `priority`가 정말 효과 있나요?
Google은 거의 무시. 네이버/Bing은 일부 참고. **0**이 되지 않게만 차등 설정.

### Q. AI 학습봇 차단해도 AI 검색 인용은 되나요?
됨. 학습봇(`GPTBot` 등)과 인용봇(`ChatGPT-User`, `OAI-SearchBot` 등)은 별개 User-Agent.

### Q. robots.txt와 sitemap이 충돌하면?
sitemap이 Disallow 경로를 포함 → 크롤러가 혼란 → 색인 누락. **항상 robots의 Allow 범위 내에서만 sitemap 작성.**

---

## 11. 참고 링크

- [Next.js sitemap 공식](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js robots 공식](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [sitemaps.org 프로토콜](https://www.sitemaps.org/protocol.html)
- [Google 사이트맵 가이드](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [네이버 서치어드바이저 가이드](https://searchadvisor.naver.com/guide/seo-basic-sitemap)

---

## 부록: 이식 치트시트

```bash
# 1) 파일 복사 (기존 프로젝트에서)
cp source/app/sitemap.ts target/app/sitemap.ts
cp source/app/robots.ts  target/app/robots.ts

# 2) staticRoutes + blockedPaths 수정

# 3) 환경변수
echo "SITE_URL=https://newsite.com" >> .env.local

# 4) 검증
npm run build && npm start
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt

# 5) 배포 후 콘솔 제출
#    https://search.google.com/search-console
#    https://searchadvisor.naver.com
```

*Base: `denden/app/sitemap.ts`, `denden/app/robots.ts` · Verified 2026-04-21*
