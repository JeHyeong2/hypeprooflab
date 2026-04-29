---
name: cal
description: HypeProof Lab 일정 등록·변경·취소·삭제 + Google Calendar 양방향 동기화. /cal 또는 자연어("일정 추가", "X 일정 바꿔", "Y 취소", "캘린더 동기화") 발동.
argument-hint: <자연어로 자유롭게>
allowed-tools: Read, Edit, Bash, mcp__claude_ai_Google_Calendar__authenticate, mcp__claude_ai_Google_Calendar__complete_authentication
---

# /cal — HypeProof Lab 일정 관리 + Google Calendar Sync

## 호출 방식 (둘 다 가능)

### 자연어 (권장)
- "보아치과 일정 5/30으로 바꿔줘" → **update**
- "동아일보 6월 일정 취소해줘" → **cancel** (이력 보존)
- "5/15 오후 3시 새 미팅 추가" → **add**
- "ev-boa-dental 완전히 지워" → **delete** (이력 없음)
- "캘린더 동기화" / "외부 변경 가져와" → **manual pull**

### 슬래시 (명시 호출)
- `/cal add <자연어>`
- `/cal update <자연어>`
- `/cal cancel <대상>`
- `/cal delete <id>`
- `/cal sync`

### 발동 가드 (모호 발화는 무반응)
- 트리거: ("일정"|"timeline"|"캘린더"|"schedule") + ("추가"|"등록"|"바꿔"|"변경"|"수정"|"옮겨"|"취소"|"보류"|"삭제"|"지워"|"동기화") 키워드 동시 포함 또는 명시적 `/cal` 호출.
- 모호하면 발동하지 말고 무반응 (다른 컨텍스트와 충돌 방지).

## 4가지 액션별 흐름

### ADD (등록)
1. 자연어에서 lane / title / date / contacts / notes / owner 파싱
2. id 생성: `ev-{slug}` (slug는 title 한글→영문 음차 또는 짧은 영문)
3. **diff preview**: 신규 event 카드 형태로 사용자에게 표시
4. confirm "위 일정으로 등록할까요? (Y/N)"
5. JSON 파일 (`data/project-timeline.json`) Edit으로 갱신
6. `gcalSync.push`: `create_event(calendarId, payload)` 호출 → 반환 id를 `externalIds.gcal`에 저장
7. tsc 검증 → 결과 요약

### UPDATE (변경)
1. 대상 식별: id 직접 지정 또는 title/keyword 매칭. 모호 시 후보 나열 후 사용자 선택
2. 변경 필드만 추출 (date, title, status, notes 등)
3. **diff preview**: before/after 변경 필드만 표시
4. confirm
5. JSON 갱신 (cancelled 상태였다면 status='planned'로 복구)
6. `gcalSync.push`: `update_event(externalIds.gcal, patch)`
7. tsc 검증 → 결과 요약

### CANCEL (취소 — 이력 보존, ≠ delete)
1. 대상 식별
2. `status='cancelled'` + `cancelledAt=ISO now` + `cancelReason=<사용자 입력 또는 추정>` 마킹
3. **diff preview**: "이 일정을 취소 처리합니다 (캘린더에 strikethrough로 남음)"
4. confirm
5. JSON 갱신 + `gcalSync`: `update_event(externalIds.gcal, { status: 'cancelled' })` (이벤트는 캘린더에 남되 취소 표식)
6. tsc 검증 → 결과 요약

### DELETE (완전 삭제 — 이력 없음)
1. 대상 식별
2. **사용자에게 명시**: "취소(이력 보존)가 아니라 완전 삭제합니다. 이력 없이 사라져요."
3. **diff preview**: 삭제 대상 카드 표시
4. **두 번 confirm**: 1차 "삭제할까요?" 2차 "정말 영구 삭제? (이력 복구 불가)"
5. JSON에서 event 제거
6. `gcalSync`: `delete_event(externalIds.gcal)` → externalIds.gcal 필드 함께 제거
7. tsc 검증 → 결과 요약

## 공통 작업 흐름

```
(a) reconcile() 먼저 실행 — gcal 외부 변경 import → 로컬 갱신
(b) Read data/project-timeline.json — 최신 상태 로드
(c) 자연어 의도 파싱 → action 분류 → 대상 식별 → diff 생성
(d) diff preview를 사용자에게 보여주고 confirm 대기
    - delete는 두 번 confirm
    - cancel/delete 모호하면 "취소(이력 보존)인가요, 삭제(완전 제거)인가요?" 되묻기
(e) Edit 도구로 JSON 갱신
(f) gcalSync.push(action, payload) — 인증 미완료 시 OAuth 안내 후 push 보류
(g) cd web && npx tsc --noEmit (빠른 검증, full build는 deploy 시점)
(h) 결과 요약 (외부 변경 import 건수 + 액션 종류 + 변경 항목 + gcal sync 상태)
```

## Google Calendar 양방향 동기화

### 인프라
- MCP 서버: `claude.ai Google Calendar` (`mcp__claude_ai_Google_Calendar__*`)
- 첫 사용 시 OAuth 필요:
  1. `mcp__claude_ai_Google_Calendar__authenticate` 호출 → authorization URL 사용자에게 안내
  2. 사용자가 브라우저로 인증 → callback URL 회신
  3. `mcp__claude_ai_Google_Calendar__complete_authentication(callback_url)` 호출
  4. 인증 완료 후 이벤트 CRUD tool 활성화 — 그 다음 호출에서 사용 가능

### calendarId 결정
- 첫 sync에서 사용자에게 "Google Calendar의 어떤 캘린더에 연결? (primary 권장)" 묻기
- 결정된 ID를 `data.gcal.calendarId`에 저장 → 이후 자동 사용

### Push 매핑 (로컬 → gcal)
- summary: `[{lane label}] {title}` (예: `[Filamentree] 바이오팜`)
  - month/quarter는 prefix 추가: `(월간 미정) [Filamentree] 동아일보` / `(분기 후속) [HypeProof] 세일즈 자산화`
- description: subtitle / 담당 / 연락처 / 메모를 줄바꿈으로 합침
- start/end:
  - `date` (partOfDay 'AM') → `T09:00–T12:00 +09:00`
  - `date` (partOfDay 'PM') → `T13:00–T18:00 +09:00`
  - `date` (시간 없음) → all-day (`start.date`/`end.date`)
  - `month` → 해당 월 1일 all-day
  - `quarter` → 해당 분기 첫 달 1일 all-day
  - `ongoing` → sync 제외

### Pull 매핑 (gcal → 로컬)
- API: `events.list({ calendarId, updatedMin: lastSyncAt, showDeleted: true })`
- 결과 분류:
  - **기존 매칭 (externalIds.gcal 존재)**: 변경분만 patch (title/date 등)
  - **gcal에서 삭제됨 (status='cancelled' from gcal)**: 로컬도 status='cancelled' + cancelReason='Google Calendar에서 삭제됨' 마킹
  - **gcal에만 존재하는 신규**: import. lane='channel' (디폴트) + needsClassification=true (배지 "분류 필요")
- 충돌: gcal `updated` > 로컬 `updatedAt`이면 gcal 우선, 동시 수정 의심되면 사용자 confirm
- `data.gcal.lastSyncAt` 갱신

### Pull 트리거
1. `/cal` 액션 시작 시 자동 (외부 변경 먼저 흡수)
2. `/cal sync` 또는 자연어 "캘린더 동기화" → 명시적 manual pull only
3. Dashboard 캘린더 탭의 "🔄 동기화" 버튼은 server action으로 reconcile 호출하지만, MCP 도구는 Claude Code 컨텍스트에서만 실행 가능 → 버튼 누르면 사용자에게 "Claude Code에서 /cal sync 실행해주세요" 안내가 토스트로 뜸. 즉, 진짜 양방향 sync는 이 skill이 수행.

## 데이터 스키마 reference

자세한 타입은 [schema.md](./schema.md) 참고. 핵심:

```ts
type FuzzyDate =
  | { kind: 'date'; iso: 'YYYY-MM-DD'; partOfDay?: 'AM'|'PM' }
  | { kind: 'month'; year; month }
  | { kind: 'quarter'; year; quarter }
  | { kind: 'ongoing' };

type Lane = 'direct' | 'channel' | 'reusable';
type Status = 'planned'|'in-progress'|'done'|'deferred'|'wrap-up'|'cancelled';
```

FuzzyDate 표기 규약:
- "2026-06" → `{ kind: 'month', year: 2026, month: 6 }`
- "Q2-2026" / "Q2 후속" → `{ kind: 'quarter', year: 2026, quarter: 2 }`
- "오전" / "AM" → `partOfDay: 'AM'`
- "오후" / "PM" → `partOfDay: 'PM'`

## Storage abstraction

- 항상 `web/src/lib/timeline/store.ts`의 `defaultStore()`만 사용
- JSON 직접 sed 편집 금지 (구조 깨짐)
- 추후 Supabase 이전 시 `JsonFileStore`만 `SupabaseStore`로 갈아끼우면 됨 → 본 skill 코드 변경 불필요

## 출력 포맷 (예시)

```
## /cal {action} 결과

### 외부 변경 동기화 (reconcile)
- import: 0건 / 충돌: 0건

### 적용된 변경
- {action} ev-boa-dental
  - title: "보아치과" (변경 없음)
  - date: 2026-04-29 → 2026-05-30
  - status: planned (유지)

### Google Calendar 동기화
- ✅ update_event(externalIds.gcal=...) 성공

### 검증
- ✅ tsc --noEmit pass

### 다음 액션 (선택)
- 대시보드 새로고침해서 변경 확인: http://localhost:3000/dashboard
```

## 금지 사항

- **`sed`로 JSON 수정 금지** — 구조 깨짐, 항상 Read + Edit (또는 Write로 전체)
- **`academy-timeline.json` 건드리지 말 것** — 별도 5/5 D-Day Gantt 데이터, 본 skill 범위 밖
- **cancel을 delete로 처리 금지** — 이력 손실
- **git push 자동 금지** — memory rule, 사용자 명시 요청 시에만
- **모호한 발화에 발동 금지** — 키워드+액션 의도가 명확하지 않으면 무반응
- **gcal에 직접 이벤트 만들지 말 것** — 항상 로컬 JSON이 source of truth, gcal은 mirror

## 학습 사고 사례

- **취소 vs 삭제 혼동**: 사용자가 "지워줘"라고 해도 "이력 보존? 영구 삭제?" 한 번 묻기. 기본은 취소(cancel) 안전쪽.
- **gcal-only 신규 이벤트**: 사용자가 폰에서 직접 만든 이벤트도 자동 import되지만 lane은 모름 → "분류 필요" 배지로 import 후 사용자에게 lane 분류 요청.
- **partOfDay 추정**: "오전 11시" → AM, "오후 2시" → PM. 시간 없으면 partOfDay 미설정 → all-day 이벤트.
- **fuzzy date push**: month/quarter는 gcal에 all-day로 push되니 gcal에서는 정확한 날짜처럼 보임. summary prefix로 구분.
