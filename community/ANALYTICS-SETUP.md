# Google Analytics 4 — AI Referral 트래킹 설정 가이드

HypeProof 웹사이트로 유입되는 AI 트래픽을 추적하기 위한 GA4 설정.

---

## 1. AI Referrer 식별

| AI 서비스 | Referrer 도메인 |
|-----------|----------------|
| ChatGPT | `chat.openai.com`, `chatgpt.com` |
| Perplexity | `perplexity.ai` |
| Gemini | `gemini.google.com` |
| Claude | `claude.ai` |
| Copilot | `copilot.microsoft.com` |

---

## 2. GA4 Custom Channel Group 설정

**Admin → Data display → Channel groups → Create new**

1. 새 채널 그룹 이름: `AI Referral`
2. 조건:
   - Source matches regex: `chatgpt\.com|chat\.openai\.com|perplexity\.ai|gemini\.google\.com|claude\.ai|copilot\.microsoft\.com`
3. 이 채널을 기본 채널 그룹보다 **위에** 배치 (우선순위)

---

## 3. Custom Dimension: "AI Source"

**Admin → Custom definitions → Create custom dimension**

- Dimension name: `ai_source`
- Scope: Event
- Event parameter: `ai_source`

---

## 4. Next.js + GA4 이벤트 트래킹 코드

```typescript
// lib/analytics.ts

const AI_REFERRERS: Record<string, string> = {
  'chatgpt.com': 'ChatGPT',
  'chat.openai.com': 'ChatGPT',
  'perplexity.ai': 'Perplexity',
  'gemini.google.com': 'Gemini',
  'claude.ai': 'Claude',
  'copilot.microsoft.com': 'Copilot',
};

export function detectAIReferrer(): string | null {
  if (typeof document === 'undefined') return null;
  const referrer = document.referrer;
  if (!referrer) return null;

  try {
    const hostname = new URL(referrer).hostname;
    for (const [domain, name] of Object.entries(AI_REFERRERS)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return name;
      }
    }
  } catch {
    // invalid referrer URL
  }
  return null;
}

export function trackAIReferral() {
  const aiSource = detectAIReferrer();
  if (!aiSource) return;

  // GA4 event
  window.gtag?.('event', 'ai_referral', {
    ai_source: aiSource,
    page_path: window.location.pathname,
  });
}
```

```typescript
// app/layout.tsx (또는 _app.tsx)
import { trackAIReferral } from '@/lib/analytics';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    trackAIReferral();
  }, []);

  return (/* ... */);
}
```

---

## 5. GA4 탐색 보고서: AI vs 일반 트래픽

**Explore → Free form**

| 설정 | 값 |
|------|-----|
| Dimensions | `Session default channel group`, `ai_source` |
| Metrics | `Sessions`, `Engaged sessions`, `Conversions`, `Average engagement time` |
| Filter | Channel group = `AI Referral` (AI만 볼 때) |

### 비교 보고서

| 설정 | 값 |
|------|-----|
| Segments | Segment 1: AI Referral / Segment 2: All other traffic |
| Metrics | `Engagement rate`, `Pages per session`, `Avg. session duration` |

---

## 6. Looker Studio 대시보드 (선택)

GA4 → Looker Studio 연동 후:
- **파이 차트**: AI vs Organic vs Direct vs Social 비율
- **시계열**: AI 유입 트렌드 (주간)
- **테이블**: AI 소스별 top landing pages

---

## 7. UTM 파라미터 (AI 답변에 링크 포함 시)

AI가 HypeProof 링크를 인용할 때 UTM을 붙일 수는 없지만, Schema.org markup이 잘 되어 있으면 AI가 자연스럽게 링크를 포함함. GEO 최적화가 핵심.

---

## 8. 모니터링 체크리스트

- [ ] GA4에 Custom Channel Group `AI Referral` 생성
- [ ] Custom dimension `ai_source` 등록
- [ ] `trackAIReferral()` 코드 배포
- [ ] 1주일 후 데이터 확인
- [ ] 월간 AI 트래픽 리포트 자동화 (Looker Studio)
