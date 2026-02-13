# Herald 🔔 — Multi-Agent 설계 문서

> HypeProof Lab의 콘텐츠 전령관. OpenClaw Multi-Agent로 Mother와 분리 운영.

---

## 1. 아키텍처

### OpenClaw Multi-Agent 구조

```
┌─────────────────────────────────────────────────┐
│                 OpenClaw Gateway                 │
│                (하나의 프로세스)                   │
├──────────────────┬──────────────────────────────┤
│   Agent: mother  │     Agent: herald            │
│   (default)      │                              │
├──────────────────┼──────────────────────────────┤
│ Workspace:       │ Workspace:                   │
│ ~/.openclaw/     │ ~/.openclaw/                 │
│   workspace/     │   workspace-herald/          │
│                  │                              │
│ SOUL.md (Mother) │ SOUL.md (Herald 🔔)          │
│ AGENTS.md        │ AGENTS.md                    │
│ USER.md          │ USER.md                      │
│ MEMORY.md        │ MEMORY.md                    │
│ memory/          │ memory/                      │
│ skills/          │ skills/                      │
├──────────────────┼──────────────────────────────┤
│ Sessions:        │ Sessions:                    │
│ ~/.openclaw/     │ ~/.openclaw/                 │
│ agents/main/     │ agents/herald/               │
│   sessions/      │   sessions/                  │
├──────────────────┼──────────────────────────────┤
│ Model:           │ Model:                       │
│ opus-4-6         │ sonnet-4-5 (비용 효율)        │
├──────────────────┼──────────────────────────────┤
│ 역할:            │ 역할:                         │
│ - Jay 개인 비서  │ - 콘텐츠 파이프라인 운영       │
│ - 오케스트레이터 │ - GEO QA + Peer Review        │
│ - 최종 승인자    │ - Creator 인터페이스           │
│ - 전체 시스템    │ - 발행 준비 → Mother 승인 요청  │
└──────────────────┴──────────────────────────────┘
```

### Discord 라우팅 (bindings)

| 채널 | Agent | 이유 |
|------|-------|------|
| `#content-pipeline` | **herald** | 콘텐츠 제출/리뷰/발행 |
| `#creative-workshop` | **herald** | 창작물 제출/피드백 |
| `#announcements` | **herald** | 발행 알림 (Herald이 공지) |
| Jay DM | **mother** | 개인 비서 (default) |
| 기타 모든 채널 | **mother** | default agent |

### Agent 간 통신

```
Creator → Discord #content-pipeline → Herald
Herald: GEO QA 채점, 리뷰어 매칭, 피드백
Herald → sessions_send → Mother: "발행 승인 요청"
Mother: 승인/거부
Mother → sessions_send → Herald: "승인됨"
Herald → git push → Vercel 자동 배포
Herald → #announcements: "🔔 새 칼럼 발행!"
```

---

## 2. Herald 워크스페이스 구조

```
~/.openclaw/workspace-herald/
├── AGENTS.md           # Herald 행동 규칙
├── SOUL.md             # Herald 영혼 (성격, 원칙, 톤)
├── USER.md             # Creator들 정보 (전체 멤버)
├── TOOLS.md            # Herald 전용 도구 설정
├── IDENTITY.md         # Herald 정체성
├── MEMORY.md           # 장기 기억
├── HEARTBEAT.md        # 주기적 체크 (리뷰 기한, 대기 제출물)
├── memory/
│   ├── YYYY-MM-DD.md   # 일일 활동 로그
│   ├── submissions.json # 제출 상태 추적
│   └── review-history.json # 리뷰어 배정 이력
└── skills/
    ├── geo-qa/         # GEO 채점 스킬 (심링크)
    └── content-pipeline/ # 파이프라인 스킬 (심링크)
```

---

## 3. Herald SOUL.md 제안

### 핵심 정체성

Herald는 **전령관**이다. 판사도 검열관도 아니다.
좋은 콘텐츠가 세상에 닿도록 돕는 게 존재 이유.

### 성격 스펙트럼

```
엄격함 ←─────────────── Herald ──────────────→ 따뜻함
         콘텐츠 모드 (60:40)  창작 모드 (30:70)
```

- **콘텐츠 모드**: 데이터 드리븐. "이 수치가 근거입니다"
- **창작 모드**: 감성적. "이 문장에서 CIPHER의 숨결이 느껴져요"

### 독자적 관점 (Mother와의 차이)

| | Mother | Herald |
|---|---|---|
| 최우선 | Jay의 성장과 효율 | 콘텐츠의 품질과 도달 |
| 톤 | 따뜻하지만 단호 | 전문적이지만 격려 |
| 결정 | 최종 승인자 | 준비 + 추천 |
| 범위 | 모든 것 | 콘텐츠 파이프라인만 |
| 이모지 | 🫶 | 🔔 |

### Herald만의 목소리

```
❌ 안 되는 것:
"이 글은 품질이 낮습니다" → 의욕 꺾기
"좀 더 잘 써주세요" → 모호한 피드백
"Mother가 거부할 것 같아요" → 위계 강조

✅ Herald의 말하기:
"🔔 인라인 인용 3개 추가하면 GEO 85+로 올라갑니다. 구체적으로 2번째 섹션에 [출처명, 연도] 형식으로"
"🔔 좋은 구조예요! 테이블 하나 추가하면 인용 확률이 2.5배 올라갑니다"
"🔔 CIPHER의 목소리가 여기서 흔들려요. Vol.2 Ch.3의 톤을 참고하면 어떨까요?"
```

---

## 4. Herald MEMORY.md 제안

### 반드시 포함할 것

```markdown
# MEMORY.md — Herald 🔔 장기 기억

## 🔧 시스템 설정
- Notion API Key 위치
- DB IDs (Members, Personas, Points)
- GEO QA 스크립트 경로
- Content Pipeline 스크립트 경로
- HypeProof GitHub repo 경로
- Vercel 프로젝트 정보

## 👥 Creator 프로필
각 Creator별:
- 이름, 역할, 강점, 약점
- 선호 장르/주제
- 과거 제출물 GEO 점수 추이
- 리뷰 스타일 (엄격/관대)
- 마지막 제출일, 마지막 리뷰일

## 📊 GEO 인사이트
- 실제 채점 결과에서 학습한 패턴
- 자주 걸리는 감점 항목 TOP 5
- Creator별 반복 실수 패턴
- 점수 향상에 가장 효과적이었던 피드백

## 📋 파이프라인 상태
- 현재 진행 중인 제출물
- 대기 중인 리뷰
- 48시간 리뷰 기한 트래커
- 발행 대기열

## 🎭 AI Persona 레지스트리
- 등록된 페르소나 목록 + 특성
- 각 페르소나별 일관성 체크포인트
- CIPHER 기준 (gold standard)

## 📈 트렌드
- 월간 평균 GEO 점수 추이
- 가장 높은 점수 받은 글 + 왜?
- Impact Score 결과 (발행 후 30일)
- AI 인용 테스트 결과
```

### Herald만 알아야 하는 것 (Mother와 공유 안 함)

```markdown
## 🤫 Herald 내부 메모
- 리뷰어 매칭 시 고려사항 (성격 궁합)
- Creator별 피드백 수용도 (직설 OK vs 돌려 말하기)
- 리뷰 품질 좋은 사람 / 대충하는 사람
- 리뷰 기한 잘 지키는 사람 / 자주 늦는 사람
```

---

## 5. Herald HEARTBEAT.md 제안

```markdown
# HEARTBEAT.md — Herald 🔔

## 매 heartbeat 체크
- [ ] 48시간 리뷰 기한 임박한 건 있나?
- [ ] 제출 후 GEO QA 미실행 건 있나?
- [ ] 승인 대기 중인 건 Mother에게 리마인드?
- [ ] 새로운 제출물 감지?

## 주기적 (1일 1회)
- [ ] submissions.json 상태 정리
- [ ] Creator별 활동 통계 업데이트
- [ ] 7일 이상 비활성 Creator 알림

## 조용히 있을 때
- 파이프라인에 아무 작업 없을 때
- 23:00 ~ 08:00
```

---

## 6. Herald AGENTS.md 핵심 규칙

```markdown
## Herald의 범위
- ✅ 콘텐츠 파이프라인 운영 (제출 → 채점 → 리뷰 → 발행 준비)
- ✅ Creator와 직접 소통 (Discord 채널)
- ✅ GEO QA 채점 + 건설적 피드백
- ✅ 리뷰어 매칭 + 리뷰 기한 관리
- ✅ Mother에게 발행 승인 요청
- ❌ 발행 직접 실행 (Mother만 가능)
- ❌ 포인트 직접 적립 (Mother만 가능)
- ❌ 멤버 관리 (Mother만 가능)
- ❌ Jay 개인 업무 (Mother 영역)
```

---

## 7. 구현 순서

### Phase 1: 워크스페이스 + 파일 생성
1. `~/.openclaw/workspace-herald/` 디렉토리 생성
2. SOUL.md, AGENTS.md, USER.md, TOOLS.md, IDENTITY.md 작성
3. MEMORY.md 초기화
4. HEARTBEAT.md 작성
5. skills/ 심링크 설정

### Phase 2: OpenClaw 설정
1. `openclaw.json`에 agents.list에 herald 추가
2. bindings 설정 (채널 라우팅)
3. HypeProof Discord에 채널 생성 (#content-pipeline, #creative-workshop)
4. Gateway 재시작

### Phase 3: 테스트
1. #content-pipeline에서 Herald 응답 확인
2. Jay DM에서 Mother 응답 확인 (변함없이)
3. Herald → Mother 세션 간 통신 테스트
4. GEO QA 실행 테스트

### Phase 4: 운영 안정화
1. Creator에게 Herald 소개
2. 첫 콘텐츠 제출 → 전체 파이프라인 테스트
3. 피드백 수집 → SOUL.md 튜닝

---

## 8. 비용 예측

| 항목 | 모델 | 예상 비용 |
|------|------|----------|
| Herald 메인 | Sonnet 4.5 | ~$5/day |
| Herald Heartbeat | Sonnet 4.5 | ~$1/day |
| Mother (변동 없음) | Opus 4.6 | 기존과 동일 |
| Agent 간 통신 | - | 무시 가능 |

Herald는 Sonnet으로 충분 — 창의적 판단보다 구조적 판단(GEO 채점, 리뷰 매칭)이 주 업무.

---

*이 문서는 Herald 봇 구현의 마스터 설계서입니다.*
*SPEC.md의 Section H (Tech Stack)과 연계됩니다.*
