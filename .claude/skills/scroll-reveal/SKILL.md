---
name: scroll-reveal
description: >
  Apple-style scroll reveal animation (fade + slide up) for Next.js + Tailwind pages.
  Installs a reusable `<Reveal>` client component powered by IntersectionObserver,
  with Apple easing and prefers-reduced-motion support. Use when the user asks for
  "apple.com 같은 애니메이션", "스크롤 페이드인", "아래에서 올라오는 애니메이션",
  "scroll reveal", "fade-up on scroll".
user_invocable: true
triggers:
  - "scroll reveal"
  - "fade up"
  - "apple animation"
  - "애니메이션 적용"
  - "스크롤 애니메이션"
---

# scroll-reveal

뷰포트 진입 시 **아래에서 살짝 올라오며 페이드인**하는 Apple.com 풍 애니메이션을
한 페이지(또는 섹션)에 적용한다. IntersectionObserver 기반이라 서드파티 의존 0.

## 언제 쓰는가

- 사용자가 "apple.com처럼", "스크롤하면서 자연스럽게", "fade-up", "슬라이드 올라오게" 요청
- 랜딩·마케팅 페이지에 후처리로 부드러운 등장 효과를 얹고 싶을 때
- Framer Motion을 도입할 만큼 애니메이션이 많지 않을 때 (단일 패턴 반복)

## 필수 질문: 재생 모드 선택

이 스킬을 적용하기 전에 **반드시 사용자에게 물어야 한다**.
(AskUserQuestion 또는 평문 질문 중 컨텍스트에 맞게 선택.)

> "애니메이션을 **한 번만** 재생할까요(apple.com 기본 동작), 아니면 **스크롤할 때마다** 매번 재생할까요?"

| 모드 | 동작 | 권장 상황 |
|------|------|----------|
| **A. One-shot (기본)** | 뷰포트 첫 진입 시 1회 재생 후 관찰 중단. 다시 스크롤해도 애니메이션 없음 | apple.com 느낌, 정보 전달형 랜딩, 접근성 우선 |
| **B. Repeat (양방향)** | 진입 시마다 페이드인, 이탈 시 원상태로 복귀. 다시 스크롤 내리면 재생 | 데모·쇼케이스 페이지, 애니메이션이 핵심 경험일 때 |

**기본값**: 물어볼 상황이 아니면 (단문 요청, 작은 수정 등) **A. One-shot**.

## 스택 전제

- Next.js App Router (13+, 확인된 환경은 16.1.6)
- Tailwind CSS (preflight가 앵커 기본 스타일 담당)
- React 18+ (IntersectionObserver 기본 API 사용)

## 설치 파일

### 1. `<Reveal>` 컴포넌트

경로 예: `web/src/app/<route>/_components/Reveal.tsx`
(라우트 스코프가 권장 — 프로젝트 전역으로 쓰려면 `src/components/Reveal.tsx`.)

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode, CSSProperties } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
  /** IntersectionObserver threshold. Default 0.15. */
  threshold?: number;
  /** Negative bottom rootMargin so it fires just before full entry. */
  rootMargin?: string;
  style?: CSSProperties;
};

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  threshold = 0.15,
  rootMargin = "0px 0px -8% 0px",
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={`reveal${shown ? " is-in" : ""}${className ? " " + className : ""}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}
```

> **팁**: 라우트 스코프로 쓸 때는 클래스 이름을 `kids-edu-reveal`처럼 prefix하고,
> CSS도 같은 prefix로 써서 다른 라우트에 누출되지 않게 한다.

#### Repeat 모드 패치 (사용자가 모드 B를 선택한 경우에만)

위 컴포넌트에서 `useEffect` 내부의 IntersectionObserver 콜백과 disconnect 로직을
아래로 교체한다:

```tsx
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setShown(entry.isIntersecting);
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
```

차이점: `io.disconnect()`를 콜백 내부에서 호출하지 않고, `setShown`을 진입·이탈
양쪽에 반영. 언마운트 시에만 cleanup에서 disconnect.

주의: Repeat 모드는 스크롤이 반대 방향으로 짧게 왕복하는 페이지에서 시선 피로를
줄 수 있다. 컨테이너를 넓게 잡고 delay를 짧게 (0~80ms) 설정하는 게 낫다.

### 2. CSS

scoped CSS 파일(예: `kids-edu.css`) 또는 `globals.css`에 추가.

```css
.reveal {
  opacity: 0;
  transform: translate3d(0, 32px, 0);
  transition:
    opacity 900ms cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 900ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: opacity, transform;
}

.reveal.is-in {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal.is-in {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## 사용 패턴

### 기본: 섹션 헤더 + 카드 그리드

```tsx
import { Reveal } from "./_components/Reveal";

<section>
  <Reveal className="text-center mb-16">
    <p>Eyebrow</p>
    <h2>Section Title</h2>
  </Reveal>

  <div className="grid md:grid-cols-3 gap-6">
    {items.map((item, i) => (
      <Reveal key={item.id} delay={120 * i} className="rounded-3xl p-8 ...">
        {/* 카드 내용 */}
      </Reveal>
    ))}
  </div>
</section>
```

### 히어로: 스태거로 순차 등장

```tsx
<div className="text-center">
  <Reveal as="p" className="eyebrow">LABEL</Reveal>
  <Reveal as="h1" delay={80} className="text-6xl">Headline</Reveal>
  <Reveal as="p" delay={200} className="sub">Subcopy</Reveal>
  <Reveal delay={320} className="cta-row">
    <a href="...">Primary CTA</a>
  </Reveal>
</div>
```

### 스태거 delay 가이드

| 상황 | delay 패턴 |
|------|----------|
| 히어로 (eyebrow → h1 → sub → CTA) | 0, 80, 200, 320 |
| 가로 3열 카드 그리드 | 0, 120, 240 |
| 가로 2열 (예: 비교 카드) | 0, 120, 240 (헤더 포함) |
| 세로 스택 카드 (4~N개) | 각 카드 개별 Reveal, delay 없음 (스크롤 따라 각자 진입) |
| Closing CTA (h2 → p → 버튼) | 0, 120, 240 |

## 주의사항 (Pitfalls)

### 1. `hover:-translate-y-*` 같은 transform hover와 충돌

Reveal은 `transform: translate3d(0, Y, 0)`을 사용하므로,
`<Reveal>` 자체에 `hover:-translate-y-0.5` 같은 transform 유틸을 붙이면 두 transform이 서로 덮어써 깜빡임/충돌.

- **해결 A**: Reveal 안쪽에 실제 카드 엘리먼트를 따로 두고, hover는 inner에 건다.
- **해결 B**: 해당 카드의 transform 기반 hover는 포기하고, border/shadow/background 기반 hover로 대체한다 (권장).

```tsx
// ❌ 충돌
<Reveal className="... hover:-translate-y-0.5">...</Reveal>

// ✅ 테두리 색 hover로 대체
<Reveal className="... transition-colors hover:border-accent">...</Reveal>

// ✅ 또는 inner 요소에 hover
<Reveal>
  <Link className="block ... hover:-translate-y-0.5">...</Link>
</Reveal>
```

### 2. 스코프 CSS에서 Tailwind 컬러 유틸을 누르는 규칙 금지

라이트 테마를 라우트 스코프로 씌울 때 `.<scope> <태그> { color: ... }`를 걸면,
해당 태그에 붙인 Tailwind `text-white` 같은 유틸(specificity **0,1,0**)을
스코프 규칙(**0,1,1**)이 눌러버린다. 결과적으로 Tailwind 클래스는 있는데 색이 안 먹는 버그.

두 가지 대표 함정:

**2a. `.<scope> a { color: inherit }`**
CTA 버튼(`<a>` 태그)의 `text-white`가 먹히지 않아 흰 글씨가 사라진다.
Tailwind preflight가 이미 `a { color: inherit; text-decoration: inherit; }`을 제공하므로
스코프에서 **직접 쓰지 말 것**.

**2b. `.<scope> h1, h2, h3 { color: var(--fg) }`**
다크 카드 안(Link/div에 `text-white`)의 heading이 여전히 다크 색으로 렌더된다.
`<Link className="text-white">` 안의 `<h3>` 타이틀이 배경과 같은 색으로 묻히는 현상.
- **해결**: heading 규칙에서 `color:`만 빼라. `letter-spacing`·`line-height`·`font-weight` 같은 타이포 속성은 유지해도 무해하다.
- Heading은 부모 요소의 `color`를 상속하게 두면 다크/라이트 컨테이너 어디서든 자연스럽게 작동.

**일반 원칙**: 스코프 CSS에서 element selector에 `color`를 걸지 마라.
컨테이너(`.<scope>` 자체)에만 기본 색을 설정하고, 내부는 상속 + Tailwind 유틸로 커버.

### 3. Above-the-fold 히어로

히어로는 마운트 즉시 IntersectionObserver가 교차를 감지하므로 초기 1 프레임은 opacity 0으로 보인다.
이게 로드 애니메이션처럼 자연스러운 경우가 대부분이지만,
광고·측정 목적으로 즉시 보여야 한다면 히어로만 `<Reveal>`을 빼거나 `shown` 초기값을 true로 둔다.

### 3b. "사용자가 보기 전에 애니메이션이 끝나있다"

기본 duration 900ms는 빠른 스크롤러에게 너무 짧아서, 요소가 화면 중앙에 도달했을 때
이미 정착(opacity 1, translate 0) 상태가 된다. 사용자는 움직임 자체를 인지하지 못함.

해결책 (둘 다 적용 권장):
1. **Duration 늘리기**: 900ms → **1500–1800ms**. 부드러움보다 가시성을 우선.
2. **Slide 거리 늘리기**: 32px → **40–48px**. 같은 시간 동안 더 많이 움직여 시선 잡기 쉬움.
3. (선택) **트리거 일찍**: `rootMargin: "0px 0px -8% 0px"` → `"0px 0px 5% 0px"` 로 바꿔
   요소가 뷰포트에 들어오기 직전부터 애니메이션 시작. 사용자가 스크롤하면서 자연스럽게 등장 과정을 봄.

권장 default: duration 1500ms + 40px slide. 빠른 사이트에선 900ms로 줄일 수 있음.

### 4. 서버 컴포넌트 ↔ 클라이언트 컴포넌트

`Reveal`은 `'use client'`이지만 **page.tsx는 서버 컴포넌트로 유지 가능**.
서버 컴포넌트가 클라이언트 컴포넌트를 import해 사용하는 건 정상 패턴이라 페이지 전체를 client로 바꾸지 않는다.

## 검증 순서

1. `npm run build` — TS/빌드 에러 없는지
2. `npm run start` (또는 dev) 후 브라우저
3. 하드 리로드 → 히어로가 순차 등장하는지
4. 스크롤 → 각 섹션이 뷰포트 진입 시 올라오는지
5. DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce" 체크 → 애니메이션이 꺼지고 즉시 표시되는지
6. 모바일 사이즈에서 섹션별 1개씩 진입하는지 (가로 그리드가 세로로 바뀌면 스태거 타이밍이 이상해 보일 수 있음 — 허용 범위)

## 끝내기 조건

- **재생 모드(A/B)** 를 사용자에게 확인받았다
- 선택한 섹션 모두에 `<Reveal>` 래핑 적용
- Pitfall 1번(transform 충돌) 체크 완료 — 원래 있던 `hover:-translate-y-*` 제거 또는 inner 이동 완료
- Pitfall 2번(`a { color: inherit }`) 체크 완료 — 스코프 CSS에 해당 규칙 없음
- `prefers-reduced-motion: reduce` 동작 확인
- Repeat 모드를 선택한 경우: 실제로 스크롤 왕복 시 진입·이탈 모두 동작하는지 확인

## 참고 구현

실제 적용 예: `web/src/app/kids-edu/` (Future AI Leader's Academy 랜딩)
- `_components/Reveal.tsx`
- `kids-edu.css` (`.kids-edu-reveal` 스코프 버전)
- `page.tsx` (6개 섹션 전부 Reveal 적용, 섹션별 스태거 패턴 수록)
