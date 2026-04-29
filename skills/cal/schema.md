# /cal Skill — 데이터 스키마 Reference

소스 파일: `web/src/lib/timeline/types.ts`
저장 위치: `data/project-timeline.json`

## TimelineData

```ts
interface TimelineData {
  version: 1;
  updatedAt: string;                // ISO timestamp (store.write에서 자동 갱신)
  title?: string;
  subtitle?: string;
  priorityBanner?: PriorityBanner;
  lanes: TimelineLanesMeta;
  events: TimelineEvent[];
  reusableAssets: ReusableAsset[];
  gcal?: { calendarId?: string; lastSyncAt?: string };
}
```

## FuzzyDate

날짜의 정확도를 4가지 종류로 표현. 캘린더에서 미정 일정도 적절하게 노출.

```ts
type FuzzyDate =
  | { kind: 'date'; iso: 'YYYY-MM-DD'; partOfDay?: 'AM' | 'PM' }
  | { kind: 'month'; year: number; month: 1..12 }
  | { kind: 'quarter'; year: number; quarter: 1 | 2 | 3 | 4 }
  | { kind: 'ongoing' };
```

| 예시 발화 | FuzzyDate |
|---|---|
| "2026-04-29" | `{ kind: 'date', iso: '2026-04-29' }` |
| "4/30 오전" | `{ kind: 'date', iso: '2026-04-30', partOfDay: 'AM' }` |
| "2026년 6월" | `{ kind: 'month', year: 2026, month: 6 }` |
| "Q2 후속" | `{ kind: 'quarter', year: 2026, quarter: 2 }` |
| 상시 (Reusable Asset) | `{ kind: 'ongoing' }` |

## Lane

```ts
type Lane = 'direct' | 'channel' | 'reusable';
```

- `direct` — HypeProof Direct (자사 직접 채널, 보라색)
- `channel` — Filamentree Channel (파트너 채널, 녹색)
- `reusable` — Reusable Asset Layer (날짜 없는 자산, 회색)

`reusable` lane은 보통 `events`가 아니라 `reusableAssets[]`에 들어감. events에 reusable이 들어가는 경우는 `kind: 'ongoing'`만 허용.

## EventStatus

```ts
type EventStatus =
  | 'planned'        // 예정 (디폴트)
  | 'in-progress'    // 진행 중
  | 'done'           // 완료
  | 'deferred'       // 연기됨 (날짜 미정)
  | 'wrap-up'        // 정리 단계 (5/5 산출물 같이)
  | 'cancelled';     // 취소됨 (이력 보존)
```

`cancelled`로 마킹할 때 함께 채울 필드:
- `cancelledAt`: ISO 타임스탬프
- `cancelReason`: 사용자가 준 사유 또는 추정 (예: "Google Calendar에서 삭제됨")

## TimelineEvent

```ts
interface TimelineEvent {
  id: string;                       // "ev-{slug}" (예: "ev-boa-dental")
  lane: Lane;
  title: string;                    // "보아치과"
  subtitle?: string;                // "전문직 교육"
  date: FuzzyDate;
  status: EventStatus;
  cancelledAt?: string;
  cancelReason?: string;
  contacts?: string[];              // ["Jay", "오성은 팀장"]
  notes?: string[];                 // ["SANS 언급 금지"]
  owner?: string;                   // "TJ"
  links?: { label: string; url: string }[];
  tags?: string[];
  externalIds?: { gcal?: string; supabase?: string };
  needsClassification?: boolean;    // gcal-origin 신규 이벤트 마커
}
```

### id 생성 규약
- prefix: `ev-`
- slug: title 한글 → 영문 음차 또는 핵심 영문 (kebab-case, 짧게)
- 예시:
  - "보아치과" → `ev-boa-dental`
  - "바이오팜" → `ev-biofarm`
  - "치과 파일럿 실행" → `ev-dental-pilot`
  - "동아일보 / 국립암센터" → `ev-donga-cancer`
  - "세일즈 자산화" → `ev-sales-asset`
  - "4/30 오전 제출" → `ev-0430-submit`
- gcal-origin 신규 이벤트는 `gcal-{googleEventId}` 형식으로 import (자동)

## ReusableAsset

```ts
interface ReusableAsset {
  id: string;                       // "asset-{slug}"
  title: string;                    // "제품 명세서"
  subtitle?: string;                // "무엇을 제공하는가"
  status: 'idea' | 'draft' | 'ready';
  ownedBy?: string;                 // "Jay"
}
```

## PriorityBanner

```ts
interface PriorityBanner {
  headline: string;                 // "현재 우선순위 변경"
  body?: string;                    // 본문 (선택)
  severity: 'info' | 'warning' | 'pivot';
}
```

severity별 색:
- `info` — 파랑 (#58a6ff)
- `warning` — 노랑 (#fbbf24)
- `pivot` — 주황 (#e8734a) — 우선순위 전환

## TimelineLanesMeta

```ts
interface TimelineLanesMeta {
  direct: { label: 'HypeProof Direct'; color: '#a78bfa' };
  channel: { label: 'Filamentree Channel'; color: '#34d399' };
  reusable: { label: 'Reusable Asset Layer'; color: '#94a3b8' };
}
```

값은 보통 변경 안 함. 라벨/색만 바꾸려면 사용자 명시 요청 시.

## 외부 시스템 매핑

### Google Calendar (`externalIds.gcal`)
- gcal event id 저장 → push update/delete의 키
- 처음 push 후 자동 채움

### Supabase (`externalIds.supabase`)
- 추후 Supabase 이전 시 row id 저장 위치
- 현재는 미사용
