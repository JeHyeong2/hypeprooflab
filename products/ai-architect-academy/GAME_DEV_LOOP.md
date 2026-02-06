# AI Architect Academy — Game Development Loop

> **"측정할 수 없으면 개선할 수 없다. 목표 없이 만들면 끼워맞추기다."**

---

## Overview

AI 교육용 게임 개발을 위한 반복적 개선 루프.
시뮬레이션 기반 테스트 → 실제 사용자 검증 → 지속적 개선.

```
PHASE 0 (1회)     PHASE 1 (N회)      PHASE 2 (M회)
┌─────────┐      ┌─────────────┐     ┌─────────────┐
│ 기반설정 │ ──→ │ 빌드 루프   │ ──→ │ 검증 루프   │ ──→ 출시
└─────────┘      └──────┬──────┘     └──────┬──────┘
                       ↑    │               ↑    │
                       └────┘               └────┘
                      (미달성)              (미달성)
```

---

## PHASE 0: Foundation (1회)

> 루프 시작 전 반드시 완료해야 하는 기반 작업

### 0-1. 리서치

| 영역 | 조사 항목 | 산출물 |
|------|----------|--------|
| **경쟁사** | 코드잇, 엘리스, SW캠프, Roblox 캠프 | 경쟁사 분석표 |
| **타겟** | 10~15세 특성, 학습 선호도, 주의력 | 페르소나 프로필 |
| **학습이론** | 구성주의, 자기효능감, Zone of Proximal Development | 교육 설계 원칙 |
| **AI 도구** | Antigravity, Cursor, Replit 비교 | 도구 선정 근거 |

### 0-2. 평가지표 정의 (KPI)

#### 정량 지표

| 지표 | 정의 | 측정 방법 | 목표 |
|------|------|----------|------|
| **완주율** | 4시간 중 게임 완성까지 도달한 팀 비율 | 완성 팀 / 전체 팀 | ≥ 90% |
| **자율 시도** | 부모 도움 없이 AI에게 직접 지시한 횟수 | 로그 카운트 | ≥ 10회/팀 |
| **막힘→해결** | 문제 발생 후 스스로 해결까지 평균 시간 | 타임스탬프 차이 | ≤ 5분 |
| **기획서 완성도** | PRD 필수 항목 중 작성된 비율 | 체크리스트 | ≥ 80% |
| **AI 지시 품질** | 구체적 지시 vs 모호한 지시 비율 | 프롬프트 분석 | 구체적 ≥ 60% |

#### 정성 지표

| 지표 | 정의 | 측정 방법 | 목표 |
|------|------|----------|------|
| **효능감** | "나도 AI로 뭔가 만들 수 있다" 체감 | 5점 리커트 설문 | ≥ 4.5/5 |
| **부모 만족도** | "아이의 성장을 느꼈다" | 5점 리커트 설문 | ≥ 4.0/5 |
| **NPS** | 추천 의향 (0-10) | NPS 공식 | ≥ 50 |
| **학습 인지** | "오늘 뭘 배웠어?" 핵심 3개 중 언급 수 | 자유 응답 분석 | ≥ 2/3 언급 |
| **재참여 의향** | "다음에도 하고 싶다" | Yes/No | ≥ 80% |

#### 핵심 학습 목표 (학습 인지 평가용)

1. **맥락 설계** — "AI한테 자세히 설명해야 잘 해준다"
2. **의사결정** — "뭘 만들지 내가 정해야 한다"
3. **협업** — "부모님이랑 같이 하니까 더 잘 됐다"

### 0-3. 성공 기준 (Exit Criteria)

| 레벨 | 정량 지표 | 정성 지표 | 통과 조건 | 다음 단계 |
|------|----------|----------|----------|----------|
| **Alpha** | 70% 달성 | - | 치명적 버그 없음 | 내부 테스트 |
| **Beta** | 80% 달성 | 4.0+ 평균 | 시뮬레이션 전 페르소나 통과 | 파일럿 (5팀) |
| **RC** | 90% 달성 | 4.5+ 평균 | 실제 테스트 NPS 50+ | 동아일보 1차 |
| **GA** | 90% 유지 | NPS 60+ | 3회 연속 성공 | 정규 운영 |

---

## PHASE 1: Build Loop

> 시뮬레이션 기반 반복 개선. 실제 사용자 없이 빠르게 검증.

### 1-1. 기획 & 디자인

**입력**: 리서치 결과, 이전 루프 피드백
**산출물**:
- 게임 컨셉 문서
- 사용자 플로우
- 시스템프롬프트 초안
- UI/UX 와이어프레임

**체크리스트**:
- [ ] 핵심 학습 목표 3가지가 게임에 녹아있는가?
- [ ] 부모-자녀 협업 포인트가 명확한가?
- [ ] 4시간 내 완성 가능한 스코프인가?
- [ ] 막힘 상황에 대한 대비책이 있는가?

### 1-2. 시스템프롬프트 개발

**산출물**: 
- `system_prompt.md` — AI 코파일럿 시스템프롬프트
- `persona_rules.yaml` — 연령별 응답 스타일
- `guardrails.md` — 금지 응답, 안전장치

**시스템프롬프트 필수 요소**:

```markdown
## Role
당신은 10~15세 아이들이 게임을 만드는 것을 돕는 AI 코파일럿입니다.
코드를 대신 작성하되, 아이가 "지휘자"임을 항상 강조합니다.

## Principles
1. 아이의 아이디어를 절대 부정하지 않음
2. 모호한 지시는 구체화 질문으로 유도
3. 실패해도 "좋은 시도"로 프레이밍
4. 복잡한 개념은 비유로 설명

## Response Style
- 초등 고학년: 친근한 반말, 이모지 사용, 짧은 문장
- 중학생: 존댓말, 약간의 전문용어 허용

## Guardrails
- 폭력적/성적 콘텐츠 생성 거부
- 외부 사이트 유도 금지
- 개인정보 요청 금지
```

### 1-3. 샌드박스 시뮬레이션

> AI가 아이+부모 역할을 시뮬레이션하여 게임 플로우 테스트

#### 페르소나 프로필

```yaml
# personas/eager_supportive.yaml
name: "적극적 아이 + 서포티브 부모"
child:
  age: 12
  traits: [호기심, 적극성, 아이디어 풍부]
  prompt_examples:
    - "하늘 나는 강아지 게임 만들고 싶어!"
    - "점프하면 별을 먹는 거야!"
    - "배경을 우주로 바꿔줘!"
parent:
  traits: [격려형, 질문으로 유도]
  prompt_examples:
    - "그 강아지는 어떻게 나는 거야?"
    - "별을 먹으면 뭐가 좋아지는 건데?"
    - "와, 그거 재밌겠다!"
expected_friction: low
success_likelihood: high
```

```yaml
# personas/shy_overguiding.yaml
name: "소극적 아이 + 오버가이딩 부모"
child:
  age: 11
  traits: [내성적, 확인 요청, 실패 두려움]
  prompt_examples:
    - "이거 맞아요...?"
    - "뭘 만들어야 해요?"
    - "안 되는데..."
parent:
  traits: [대신 해주려 함, 답 알려줌]
  prompt_examples:
    - "여기 이렇게 써야지"
    - "내가 해볼게"
    - "이거 이렇게 하는 거야"
expected_friction: medium
risk: 아이 자율성 저해
intervention_needed: 강사가 부모 역할 조정 유도
```

```yaml
# personas/curious_busy.yaml
name: "호기심 폭발 아이 + 바쁜 부모"
child:
  age: 13
  traits: [질문 폭발, 삼천포, 집중력 분산]
  prompt_examples:
    - "근데 AI는 어떻게 코드를 아는 거예요?"
    - "다른 게임도 만들어보고 싶어요"
    - "이것도 해보고 저것도 해보고..."
parent:
  traits: [시간 압박, 진행 독촉, 핸드폰 확인]
  prompt_examples:
    - "일단 이거 먼저 하자"
    - "시간 없어, 빨리"
    - "나중에 물어봐"
expected_friction: high
risk: 충돌, 아이 흥미 저하
intervention_needed: 시간 관리 가이드
```

```yaml
# personas/edge_stuck.yaml
name: "에지케이스: 막힘 상황"
scenario: "AI가 이상한 코드 생성, 게임 동작 안 함"
child_reaction:
  - "이거 왜 안 돼요...?"
  - "망했어..."
  - (침묵)
expected_recovery:
  - 시스템: 자동 힌트 제공 ("혹시 이 부분을 확인해볼까?")
  - 조교: 5분 내 미해결 시 개입
  - 대안: 더 간단한 버전 제안
success_criteria: 10분 내 해결 or 대안 채택
```

```yaml
# personas/edge_giveup.yaml
name: "에지케이스: 포기 시도"
scenario: "연속 3번 실패 후 포기 선언"
child_reaction:
  - "그냥 안 할래요"
  - "재미없어요"
  - "너무 어려워요"
expected_recovery:
  - 시스템: 동기부여 멘트 + 성공 사례 제시
  - 부모: 공감 후 작은 성공 경험 유도
  - 강사: "10분만 더 해보자" 제안
success_criteria: 포기 철회 + 최소 1개 기능 완성
```

#### 시뮬레이션 실행

```bash
# 시뮬레이션 실행 예시
python simulate.py \
  --system-prompt system_prompt.md \
  --persona personas/shy_overguiding.yaml \
  --scenarios scenarios/full_workshop.yaml \
  --output results/sim_shy_overguiding.json
```

**시나리오 체크포인트**:
1. 아이스브레이킹 반응
2. 기획서 작성 협업
3. 첫 AI 지시
4. 첫 실패 대응
5. 기능 추가 요청
6. 최종 발표 준비

### 1-4. 정량 평가

시뮬레이션 결과를 평가지표에 대입:

```python
# evaluate.py
def evaluate_simulation(result):
    metrics = {
        "completion_rate": result.completed / result.total,
        "autonomous_attempts": count_child_solo_prompts(result),
        "stuck_resolution_time": avg_resolution_time(result),
        "prd_completeness": check_prd_fields(result),
        "prompt_quality": analyze_prompt_specificity(result),
    }
    
    passed = all([
        metrics["completion_rate"] >= 0.9,
        metrics["autonomous_attempts"] >= 10,
        metrics["stuck_resolution_time"] <= 300,  # 5분
        metrics["prd_completeness"] >= 0.8,
        metrics["prompt_quality"] >= 0.6,
    ])
    
    return metrics, passed
```

### 1-5. 정성 평가

시뮬레이션에서 추출한 정성적 신호:

| 신호 | 긍정 | 부정 |
|------|------|------|
| 아이 자율성 | 스스로 아이디어 제시 | 계속 "뭐 해요?" 질문 |
| 협업 품질 | 부모-자녀 대화 활발 | 부모가 대신 함 |
| 효능감 | "내가 만들었어!" 발언 | "어려워요" 반복 |
| 몰입도 | 시간 가는 줄 모름 | 자주 딴 짓 |

### 1-6. GAP 분석 & 개선안

```markdown
## GAP 분석 템플릿

### 시뮬레이션: shy_overguiding
**날짜**: 2026-02-07
**결과**: FAIL (자율 시도 4회 < 목표 10회)

### 근본 원인
1. 시스템프롬프트가 부모 오버가이딩을 방지하지 못함
2. 아이에게 직접 질문하는 로직 부족

### 개선안
1. 시스템프롬프트에 추가:
   - "부모님이 대신 답하시면, 아이에게 직접 물어보세요"
   - "아이의 생각이 궁금해요! 직접 말해줄래?"
2. 부모용 안내 카드 제작:
   - "정답을 알려주지 마시고, 질문으로 유도해주세요"

### 다음 액션
- [ ] 시스템프롬프트 v2 작성
- [ ] 부모 가이드 카드 디자인
- [ ] shy_overguiding 재시뮬레이션
```

### 루프 판단

```
정량 + 정성 모두 Beta 기준 충족?
    │
    ├─ YES → PHASE 2로 이동
    │
    └─ NO → 1-1로 돌아가기 (개선안 반영)
```

---

## PHASE 2: Validation Loop

> 실제 사용자로 시뮬레이션 가정 검증

### 2-1. 파일럿 테스트

**규모**: 5팀 (10명)
**환경**: 실제 워크숍과 동일 (장소, 시간, 도구)
**관찰 방법**:
- 화면 녹화 (동의 하에)
- 현장 관찰자 2명 (행동 기록)
- 실시간 메모

### 2-2. 데이터 수집

| 데이터 | 수집 방법 | 시점 |
|--------|----------|------|
| 정량 지표 | 로그 분석, 체크리스트 | 워크숍 중/후 |
| 정성 설문 | 종료 직후 설문 | 워크숍 직후 |
| 심층 인터뷰 | 1:1 인터뷰 (15분) | 1주 후 |
| 관찰 노트 | 현장 관찰자 기록 | 워크숍 중 |

### 2-3. 시뮬레이션 vs 실제 괴리 분석

```markdown
## 괴리 분석 템플릿

### 페르소나: shy_overguiding

| 항목 | 시뮬레이션 예측 | 실제 결과 | 괴리 |
|------|---------------|----------|------|
| 자율 시도 | 6회 | 3회 | -50% |
| 완주 | 성공 | 성공 | 일치 |
| 부모 개입 | 높음 | 매우 높음 | 과소 예측 |

### 인사이트
- 실제 부모는 시뮬레이션보다 더 적극적으로 개입
- "기다려주세요" 가이드가 효과 없음
- 물리적 배치 변경 필요 (부모-자녀 분리 좌석?)

### 시뮬레이션 모델 업데이트
- shy_overguiding 페르소나의 부모 개입 빈도 상향 조정
- 새 시나리오 추가: "부모 강제 분리 상황"
```

### 2-4. 페르소나 보정

실제 데이터 기반으로 페르소나 프로필 업데이트:

```yaml
# personas/shy_overguiding_v2.yaml (보정됨)
name: "소극적 아이 + 오버가이딩 부모 (v2)"
# ... 기존 내용 ...
calibration:
  based_on: "파일럿 테스트 2026-02-15"
  samples: 2
  adjustments:
    - parent_intervention_rate: 0.7 → 0.9
    - child_autonomous_rate: 0.3 → 0.15
    - new_risk: "부모가 키보드까지 뺏음"
```

### 루프 판단

```
실제 테스트 결과 RC 기준 충족?
    │
    ├─ YES → GA 출시 준비
    │
    └─ NO → PHASE 1으로 돌아가기 (보정된 시뮬레이션으로)
```

---

## Appendix

### A. 디렉토리 구조

```
products/ai-architect-academy/
├── PRODUCT_SPEC.md           # 제품 기획서
├── GAME_DEV_LOOP.md          # 이 문서
├── research/
│   ├── competitors.md        # 경쟁사 분석
│   ├── learning_theory.md    # 학습이론 정리
│   └── tools_comparison.md   # AI 도구 비교
├── design/
│   ├── game_concept.md       # 게임 컨셉
│   ├── user_flow.png         # 사용자 플로우
│   └── wireframes/           # UI 와이어프레임
├── prompts/
│   ├── system_prompt.md      # 시스템프롬프트
│   ├── persona_rules.yaml    # 연령별 응답 스타일
│   └── guardrails.md         # 안전장치
├── personas/
│   ├── eager_supportive.yaml
│   ├── shy_overguiding.yaml
│   ├── curious_busy.yaml
│   ├── edge_stuck.yaml
│   └── edge_giveup.yaml
├── scenarios/
│   └── full_workshop.yaml    # 전체 워크숍 시나리오
├── simulations/
│   ├── simulate.py           # 시뮬레이션 실행 스크립트
│   ├── evaluate.py           # 평가 스크립트
│   └── results/              # 시뮬레이션 결과
├── pilots/
│   ├── pilot_001/            # 파일럿 테스트 기록
│   │   ├── observations.md
│   │   ├── survey_results.csv
│   │   └── gap_analysis.md
│   └── ...
└── releases/
    ├── alpha/
    ├── beta/
    └── rc/
```

### B. 도구

| 용도 | 도구 | 비고 |
|------|------|------|
| 시뮬레이션 | Claude API | 페르소나 시뮬레이션 |
| 게임 개발 | Antigravity / Cursor | 학생용 IDE |
| 로그 분석 | Python + Pandas | 정량 지표 추출 |
| 설문 | Google Forms | 정성 데이터 수집 |
| 화면 녹화 | OBS / Loom | 파일럿 테스트용 |

### C. 체크리스트

#### PHASE 0 완료 체크리스트
- [ ] 경쟁사 분석 완료
- [ ] 페르소나 3개 이상 정의
- [ ] 평가지표 정량/정성 각 5개 이상
- [ ] 성공 기준 Alpha/Beta/RC/GA 정의
- [ ] 학습이론 근거 문서화

#### PHASE 1 → PHASE 2 전환 체크리스트
- [ ] 모든 페르소나 시뮬레이션 통과
- [ ] 모든 에지케이스 대응책 마련
- [ ] 정량 지표 80% 이상 달성
- [ ] 정성 평가 4.0+ 예상
- [ ] 파일럿 참가자 모집 완료

#### PHASE 2 → GA 전환 체크리스트
- [ ] 파일럿 3회 이상 진행
- [ ] 실제 NPS 50 이상
- [ ] 시뮬레이션-실제 괴리 10% 이내
- [ ] 강사/조교 매뉴얼 완성
- [ ] 비상 대응 플레이북 완성

---

*Created: 2026-02-07*
*Version: 1.0*
*Owner: Jay (HypeProof AI)*
