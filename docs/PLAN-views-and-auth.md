# HypeProof Lab — 조회수 + 소셜 로그인 설계 문서

> 작성일: 2026-02-12  
> 상태: Draft  
> 작성: Claude (설계 문서)

---

## 1. 현재 상태 분석

| 항목 | 현황 |
|------|------|
| 프레임워크 | Next.js 16.1.6, React 19 |
| 배포 | Vercel (SSG) |
| DB | **없음** |
| 인증 | **없음** |
| 백엔드 | `src/app/api/content/route.ts` (콘텐츠 조회용 API 1개) |
| 콘텐츠 | Markdown → `gray-matter` 파싱, `generateStaticParams`로 SSG |
| 칼럼 수 | ~4개 (ko/en 각각), 웹소설 ~30+ 챕터 |
| 주요 의존성 | framer-motion, spline, tailwindcss v4 |

**핵심**: 순수 정적 사이트. 서버 상태 없음. 모든 기능을 새로 추가해야 함.

---

## 2. 기술 선택 비교표

### 2-1. 조회수 저장소

| 옵션 | 무료 티어 | 장점 | 단점 | 추천 |
|------|-----------|------|------|------|
| **Upstash Redis** | 10K cmd/day | Vercel 네이티브 통합, REST API, 서버리스 최적화, @upstash/redis SDK | 10K/day 넘으면 유료 | ⭐ **1순위** |
| Vercel KV | (Upstash 기반) | Vercel 대시보드 통합 | 사실상 Upstash와 동일, 가격 약간 높음 | 2순위 |
| Supabase (Postgres) | 500MB, 무제한 API | RLS, 풀 SQL, 유저 테이블과 통합 가능 | 조회수만 쓰기엔 오버스펙, cold start | Phase 2 통합용 |
| Firebase Realtime DB | 1GB, 10GB/mo transfer | 실시간 | Google lock-in, 번들 큼 | ❌ |
| Planetscale | 무료 티어 폐지됨 | — | — | ❌ |

### 2-2. 인증

| 옵션 | 장점 | 단점 | 추천 |
|------|------|------|------|
| **Auth.js v5** (NextAuth) | Next.js 네이티브, Google/GitHub/Kakao 어댑터, 활발한 생태계 | v5 마이그레이션 진행 중 | ⭐ **1순위** |
| Supabase Auth | DB + Auth 통합, Kakao 지원 | 별도 서비스 의존 | 2순위 |
| Clerk | 아름다운 UI, 빠른 구현 | 무료 10K MAU, 커스터마이징 제한 | 3순위 |
| Firebase Auth | Google 네이티브 | 번들 큼, Next.js와 궁합 보통 | ❌ |

### 2-3. 유저 데이터 DB (좋아요, 북마크 등)

| 옵션 | 추천 이유 |
|------|-----------|
| **Supabase** (Postgres) | Auth.js 어댑터 있음, RLS로 보안, 무료 500MB 충분, SQL 유연성 |
| Prisma + Neon | Prisma ORM 선호 시 |

---

## 3. 추천 아키텍처

```
┌─────────────────────────────────────────────────┐
│                    Client (Browser)              │
│                                                  │
│  칼럼 상세 페이지 로드 → POST /api/views (조회수)│
│  로그인 클릭 → Auth.js (Google/GitHub/Kakao)     │
│  좋아요/북마크 → POST /api/interactions          │
└──────────┬──────────────────────┬────────────────┘
           │                      │
    ┌──────▼──────┐       ┌──────▼──────┐
    │  Upstash    │       │  Supabase   │
    │  Redis      │       │  (Postgres) │
    │             │       │             │
    │ views:{slug}│       │ users       │
    │ → INCR      │       │ accounts    │
    │ → GET       │       │ sessions    │
    │             │       │ likes       │
    │             │       │ bookmarks   │
    └─────────────┘       └─────────────┘
```

### 데이터 흐름

**조회수 (비로그인도 가능)**
1. 페이지 로드 → 클라이언트에서 `POST /api/views` 호출
2. API Route에서 IP hash + slug로 중복 체크 (Upstash SET with TTL 24h)
3. 중복 아니면 `INCR views:{slug}`
4. 응답으로 현재 조회수 반환
5. 칼럼 리스트는 ISR (revalidate: 60s)로 조회수 포함 렌더링

**소셜 로그인**
1. Auth.js → Supabase Adapter → users/accounts/sessions 테이블 자동 관리
2. JWT 세션 (DB 세션 불필요, 서버리스 최적화)
3. 미들웨어에서 세션 체크 → 보호된 API에 전달

---

## 4. DB 스키마

### Upstash Redis (Key-Value)

```
views:{slug}              → number (총 조회수)
views:unique:{ip_hash}:{slug} → "1" (TTL: 86400s, 중복 방지)
views:daily:{YYYY-MM-DD}:{slug} → number (일별 통계, 선택)
```

### Supabase Postgres

```sql
-- Auth.js가 자동 생성하는 테이블 (Supabase Adapter)
-- users, accounts, sessions, verification_tokens

-- 확장 테이블
CREATE TABLE likes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  content_slug TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'column', -- 'column' | 'novel'
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_slug, content_type)
);

CREATE TABLE bookmarks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  content_slug TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'column',
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_slug, content_type)
);

-- 댓글 (Phase 3)
CREATE TABLE comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  content_slug TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'column',
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
```

---

## 5. 구현 단계

### Phase 1: 조회수 (1~2일)
> 의존성 없음. 바로 시작 가능.

1. `pnpm add @upstash/redis`
2. Upstash 콘솔에서 Redis DB 생성 → env 변수 설정
3. `src/app/api/views/route.ts` — POST (increment) + GET (read)
4. `src/components/ViewCounter.tsx` — 클라이언트 컴포넌트
5. 칼럼 상세 페이지에 ViewCounter 삽입
6. 칼럼 리스트에 조회수 표시 (서버 컴포넌트에서 bulk fetch)
7. 봇 필터링: User-Agent 체크 + rate limit (Upstash Ratelimit)

### Phase 2: 소셜 로그인 (2~3일)
> Phase 1 완료 후.

1. `pnpm add next-auth@beta @auth/supabase-adapter @supabase/supabase-js`
2. Supabase 프로젝트 생성 → DB 스키마 마이그레이션
3. Google Cloud Console → OAuth 클라이언트 ID
4. GitHub → OAuth App
5. (선택) Kakao Developers → REST API 키
6. `src/app/api/auth/[...nextauth]/route.ts`
7. `src/lib/auth.ts` — Auth.js 설정
8. `src/components/AuthButton.tsx` — 로그인/로그아웃 UI
9. Navigation에 AuthButton 통합
10. `src/app/api/auth/[...nextauth]/route.ts` 완성

### Phase 3: 좋아요 + 북마크 (1~2일)
> Phase 2 완료 후.

1. `src/app/api/likes/route.ts` — POST (toggle) + GET (count + 내 상태)
2. `src/app/api/bookmarks/route.ts` — POST (toggle) + GET (리스트)
3. `src/components/LikeButton.tsx`
4. `src/components/BookmarkButton.tsx`
5. 칼럼 상세 페이지에 통합

### Phase 4: 댓글 (2~3일, 선택)
> 나중에 필요할 때.

1. comments 테이블 + API
2. 댓글 UI 컴포넌트
3. 신고/삭제 기능

---

## 6. 파일 구조 (추가될 파일)

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts          # Auth.js 핸들러
│       ├── views/
│       │   └── route.ts              # 조회수 API
│       ├── likes/
│       │   └── route.ts              # 좋아요 API
│       └── bookmarks/
│           └── route.ts              # 북마크 API
├── lib/
│   ├── auth.ts                       # Auth.js 설정
│   ├── redis.ts                      # Upstash Redis 클라이언트
│   └── supabase.ts                   # Supabase 클라이언트
├── components/
│   ├── auth/
│   │   ├── AuthButton.tsx            # 로그인/로그아웃
│   │   └── AuthProvider.tsx          # SessionProvider 래퍼
│   ├── ViewCounter.tsx               # 조회수 표시 + 카운트
│   ├── LikeButton.tsx                # 좋아요 토글
│   └── BookmarkButton.tsx            # 북마크 토글
└── middleware.ts                      # (선택) 인증 미들웨어

# 환경 변수 (.env.local)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_KAKAO_ID=          # 선택
AUTH_KAKAO_SECRET=      # 선택
```

---

## 7. 예상 비용 (월 기준)

| 서비스 | 무료 티어 | 예상 사용량 | 월 비용 |
|--------|-----------|-------------|---------|
| Upstash Redis | 10K cmd/day | 초기 ~1K cmd/day | **$0** |
| Supabase (DB + Auth) | 500MB, 50K MAU | 초기 ~100 users | **$0** |
| Vercel | Hobby (무료) | 현재 유지 | **$0** |
| Google OAuth | 무료 | — | **$0** |
| GitHub OAuth | 무료 | — | **$0** |
| Kakao OAuth | 무료 | — | **$0** |
| **합계** | | | **$0/mo** |

> 트래픽 증가 시: Upstash $0.2/100K cmd, Supabase Pro $25/mo (필요 시점: MAU 50K+)

---

## 8. 봇/중복 필터링 전략

1. **IP 해싱**: `SHA256(IP + salt)` → Upstash에 24시간 TTL로 저장. 같은 IP+slug 조합은 하루 1회만 카운트
2. **User-Agent 필터**: 알려진 봇 UA 패턴 (`bot`, `crawler`, `spider` 등) 차단
3. **Rate Limit**: `@upstash/ratelimit` — IP당 분당 30회 제한
4. **DNT 헤더 존중**: Do Not Track 설정 시 카운트 제외 (선택)
5. **Referrer 체크**: 직접 API 호출 차단 (Origin 헤더 검증)

---

## 9. 결정 필요 사항

- [ ] Kakao 로그인 포함 여부 (한국 사용자 비율에 따라)
- [ ] 댓글 기능 필요 시점
- [ ] 웹소설에도 조회수/좋아요 적용할지
- [ ] 조회수를 OG 이미지에도 표시할지
