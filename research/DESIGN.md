# Daily Research System — Design Document v1

**Author:** Mother  
**Date:** 2026-02-09  
**Status:** Draft — Jay 컨펌 대기

---

## 1. 목적

매일 아침 AI/OpenClaw 관련 핵심 뉴스와 커뮤니티 동향을 수집하여, 스토리텔링 형식의 칼럼으로 작성하고 배포한다.

---

## 2. 리서치 소스

### 2.1 Primary Sources (필수)

| 소스 | 접근 방법 | 수집 대상 |
|------|----------|----------|
| **OpenClaw Discord** | `message` tool (`action=read`) | #general, #freshbits, #showcase 최근 24h 메시지 |
| **OpenClaw GitHub** | `gh` CLI 또는 web_fetch | Releases, 주요 PR, Issues |

### 2.2 Secondary Sources (보조)

| 소스 | 접근 방법 | 수집 대상 |
|------|----------|----------|
| **AI 뉴스 사이트** | web_fetch | The Verge AI, Anthropic Blog, OpenAI Blog |
| **X (Twitter)** | 브라우저 (profile: chrome) | @AnthropicAI, @OpenAI, @OpenClaw 멘션 |

### 2.3 접근 우선순위

```
1. OpenClaw Discord (message tool) — 가장 신뢰할 수 있는 커뮤니티 소스
2. OpenClaw GitHub — 공식 업데이트
3. AI 뉴스 사이트 — 업계 전반 동향
4. X/Twitter — 실시간 반응 (선택적)
```

---

## 3. 토픽 선정 로직

### 3.1 토픽 카테고리

| 카테고리 | 우선순위 | 예시 |
|----------|----------|------|
| **Breaking** | 🔴 최상 | 새 모델 출시, 보안 이슈, 대형 파트너십 |
| **OpenClaw Updates** | 🟠 높음 | Freshbits, 새 기능, 버그 픽스 |
| **Community Buzz** | 🟡 중간 | 핫한 토론, 유용한 팁, 프로젝트 쇼케이스 |
| **Industry News** | 🟢 낮음 | 경쟁사 동향, 업계 트렌드 |

### 3.2 선정 기준 — 공감(리액션) 우선!

```python
def should_include(topic):
    """토픽 포함 여부 판단 — 리액션 기반"""
    
    # 1순위: 리액션 많은 것
    if topic.reactions >= 10:
        return True, priority=1
    
    # 2순위: Breaking News
    if topic.category == "Breaking":
        return True, priority=2
    
    # 3순위: OpenClaw 공식 업데이트
    if topic.category == "OpenClaw Updates":
        return True, priority=3
    
    # 4순위: 활발한 토론 (replies 3+)
    if topic.replies >= 3:
        return True, priority=4
    
    return False
```

### 3.3 채널별 깊이

| 채널 | 깊이 | 설명 |
|------|------|------|
| **OpenClaw Discord** | 🔴 자세히 | 핵심 소스, 대화 맥락까지 분석 |
| **AI 뉴스** | 🟡 요약 | 헤드라인 + 핵심 1-2문장 |

### 3.3 토픽 개수

- **최소**: 2개 (너무 적으면 "오늘은 조용한 날" 언급)
- **최대**: 5개 (넘으면 가장 임팩트 있는 것만)
- **이상적**: 3개

---

## 4. 콘텐츠 구조

### 4.1 단일 파트 (토픽 1-2개, ~1800자)

```markdown
# OpenClaw Daily Research — YYYY-MM-DD

## [이모지] [제목] — [임팩트 부제]

[훅 1-2문장]

[배경/맥락 2-3문장]

---

### 🔥 [핵심 포인트]

[스토리텔링 3-5문장]
[비판적 코멘트]

---

### 🤔 그래서?

[시사점/액션아이템]

---

🔗 **Sources**
• [제목]: <URL>
```

### 4.2 멀티파트 (토픽 3개+)

```markdown
## [이모지] [1/N] [제목] — [이 파트 포커스]

[각 파트 ~1500자]
[파트 간 연결 불필요 — 독립적으로 읽힐 수 있게]
```

### 4.3 금지 사항

```
❌ 불릿포인트 15% 초과
❌ "~에 대해 알아보겠습니다"
❌ "매우 흥미로운 발전입니다"
❌ "살펴보도록 하겠습니다"
❌ 링크 없는 정보 인용
❌ Discord 테이블 (렌더링 깨짐)
```

---

## 5. 워크플로우

### 5.1 수집 단계

```
[09:00 KST Cron 트리거]
    │
    ▼
[1] OpenClaw Discord 읽기
    - message(action=read, channel=discord, target=<채널ID>, limit=50)
    - #general: 1456350065223270435
    - #freshbits: (채널ID 확인 필요)
    - #showcase: (채널ID 확인 필요)
    │
    ▼
[2] GitHub 업데이트 확인
    - gh release list --repo openclaw/openclaw --limit 5
    - 또는 web_fetch(https://github.com/openclaw/openclaw/releases)
    │
    ▼
[3] AI 뉴스 스캔 (선택적)
    - web_fetch(https://www.theverge.com/ai-artificial-intelligence)
    - web_fetch(https://www.anthropic.com/news)
    │
    ▼
[4] 토픽 선정
    - 우선순위에 따라 3-5개 선정
    - 각 토픽에 소스 URL 태깅
```

### 5.2 작성 단계

```
[5] 스토리 구성
    - 훅 → 배경 → 핵심 → 시사점
    - 불릿포인트 최소화
    - 숫자에 맥락/비유 추가
    │
    ▼
[6] 파일 저장 (필수!)
    - ~/CodeWorkspace/side/hypeproof/research/daily/YYYY-MM-DD.md
    │
    ▼
[7] QA 체크
    - python3 scripts/qa_check.py daily/YYYY-MM-DD.md
    - 실패시 수정 후 재시도 (최대 3회)
```

### 5.3 배포 단계

```
[8] Discord 게시
    - HypeProof #daily-research 스레드: 1468157626209665107
    - 2000자 초과시 멀티파트 분할
    │
    ▼
[9] Sonatus Slack 게시
    - 채널: C0AD97SGQLD
    - 동일 콘텐츠 게시
    │
    ▼
[10] 완료 알림
    - Jay DM으로 완료 노티
```

---

## 6. 채널 ID 정리

### 수집 소스
| 채널 | ID | 용도 |
|------|-----|------|
| OpenClaw #general | 1456350065223270435 | 커뮤니티 대화 수집 |
| OpenClaw #freshbits | (확인 필요) | 업데이트 수집 |
| OpenClaw #showcase | (확인 필요) | 프로젝트 수집 |

### 배포 채널
| 채널 | ID | 용도 |
|------|-----|------|
| HypeProof #daily-research | 1468135779271180502 | Discord 게시 |
| HypeProof 스레드 | 1468157626209665107 | Discord 스레드 |
| **Sonatus Slack** | C0AD97SGQLD | Slack 게시 |
| Jay DM | user:1186944844401225808 | 완료 알림 |

---

## 7. QA 체크리스트

### 자동 체크 (scripts/qa_check.py)

- [ ] 불릿포인트 비율 ≤ 15%
- [ ] 금지 표현 0개
- [ ] 링크 최소 1개 이상
- [ ] 파일명 형식 YYYY-MM-DD.md

### 수동 체크 (작성자)

- [ ] 훅 문장이 끌어당기는가?
- [ ] 숫자에 맥락/비유가 있는가?
- [ ] 비판적 시각이 포함되었는가?
- [ ] 2분 안에 읽히는가?

---

## 8. 에러 처리

| 상황 | 대응 |
|------|------|
| Discord 읽기 실패 | GitHub + 뉴스 사이트로 폴백, "커뮤니티 소스 접근 제한" 명시 |
| 토픽 부족 (< 2개) | "오늘은 특별한 소식 없음" — 억지로 채우지 않음 |
| QA 3회 실패 | Jay에게 수동 리뷰 요청 DM |
| 게시 실패 | 파일은 저장됨, 수동 게시 요청 |

---

## 9. 스케줄

| 시간 | 작업 |
|------|------|
| 09:00 KST | Cron 트리거 → 리서치 시작 (**매일, 주말 포함**) |
| ~09:10 | 수집 완료 |
| ~09:15 | 작성 + QA 완료 |
| ~09:20 | Discord + Slack 게시 + Jay 알림 |

---

## 10. 결정사항 (Jay 컨펌 2026-02-09)

| 항목 | 결정 |
|------|------|
| **채널 구조** | 채널별 분리 — OpenClaw는 자세하게, 공감(리액션) 많은 것 우선 |
| **X/Twitter** | ❌ 제외 |
| **배포 채널** | HypeProof Discord + **Sonatus Slack** |
| **주말 운영** | ✅ 매일 (주말 포함) |
| **폴백 콘텐츠** | 없으면 "오늘은 특별한 소식 없음" — 억지로 채우지 않음 |

---

## Changelog

- **v1 (2026-02-09)**: 초안 작성

---

*컨펌 후 구현 진행*
