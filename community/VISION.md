# HypeProof Lab — Community Vision

> "AI solves problems. Humans define them."
> Last updated: 2026-02-13

---

## What We Are

**HypeProof Lab = AI Creator Guild**

AI를 잘 쓰는 사람들이 모여서, 각자의 도메인에서 AI 군단과 함께 창작하고,
그 과정과 결과물이 세상에 노출되는 크리에이터 길드.

### 핵심 가치
- **과정의 투명성** — 글만이 아니라, AI와 협업한 과정 전체를 공개
- **증명한다** — 하이프가 아닌 실제 결과물로 증명
- **함께 레벨업** — 비슷한 취향의 인간이 모여있을 때 더 강해진다

### 왜 HypeProof에 모이는가?
1. **AI Creator 인프라** — Herald Agent 🔔 + GEO QA 파이프라인
2. **AEO 최적화 집단지성** — 개인이 실험하기엔 데이터 부족, 길드가 함께 실험
3. **HypeProof 도메인 권위** — 개인 블로그보다 AI 검색 노출 유리
4. **동료 크리에이터** — 피드백, 자극, 과정 공유

---

## Who We Are

### 역할 구조

| 역할 | 설명 | 권한 |
|------|------|------|
| **Admin** | 운영진 (Jay) | 전체 관리, 최종 발행 승인, Agent 호스팅 |
| **Creator** | 핵심 크리에이터 (Referral 가입, 최대 20명) | 글 작성, Peer Review, AI Agent 접근, 포인트 적립, AI Persona 등록 |
| **Spectator** | 자유 가입 | 콘텐츠 열람, 디스코드 참여 |

### 가입 절차
- **Creator**: 기존 Creator의 Referral → 포트폴리오/샘플 1건 제출 → Admin 승인
- **Spectator**: Discord 자유 가입 (오픈)

### 현재 멤버 (2026-02)
- Jay (이재원) — Lead / Tech / Admin
- Kiwon (남기원) — Marketing / Strategy
- TJ (강태진) — Contents / Media Production
- Ryan (김지웅) — Research / Data Analysis (Physics Ph.D, CERN)
- JY (신진용) — Research / AI Engineering
- BH (태봉호) — Particle Physics / Data Analysis (CERN)
- Sebastian — Engineering / Management

---

## Two Pipelines

### 📊 Content Pipeline (칼럼/리서치)
AEO-First 전략으로 최적화된 글을 발행한다.

```
Creator → Herald 🔔 DM 제출 → GEO QA 자동채점 → Peer Review (2명) → Mother 최종 승인 → 발행
```

### ✍️ Creative Works Pipeline (AI 소설/스토리)
AI Author Persona 시스템으로 창작물을 발행한다.

- 각 Creator는 하나 이상의 **AI Author Persona**를 등록할 수 있다
- 예: Jay의 **CIPHER** — AI 소설가 페르소나
- 페르소나마다 독립된 SOUL 문서 (보이스, 스타일, 세계관)
- 리뷰 기준: 페르소나 일관성, 스토리텔링 품질, 프로세스 투명성

---

## Content Philosophy

### AEO-First 전략
GEO 리서치 데이터 기반 (geo/research/geo-what-data-shows-2026.md):

- **구조화된 콘텐츠**: H2/H3 계층 + 테이블 → 인용 확률 40%↑, 테이블 2.5×
- **인라인 인용**: 신뢰 가능한 출처 → 가장 큰 레버 (30-40% 향상)
- **Long-form**: 2,000+ 단어 → 3× 더 인용
- **Schema markup**: Article, FAQ → +36% 인용 확률
- **Freshness**: 30일 이내 업데이트 → AI가 더 자주 인용 (76.4%)
- **키워드 스터핑 금지**: 오히려 성능 저하

### AI 협업 과정 공개 — 킬러 피쳐
모든 발행물에 **프로세스 아카이브** 필수 첨부:
- AI와의 전체 대화 로그 (MD export, 압축 업로드)
- 교육 콘텐츠이자 신뢰 장치이자 차별화 포인트

---

## Herald Agent (헤럴드) 🔔

HypeProof Lab의 콘텐츠 전령관.

> 진실을 알린다. 품질을 큐레이팅한다. 창작을 촉진한다.

- Discord Bot (별도 봇 토큰)
- Mother(OpenClaw)가 서브에이전트로 조율
- 콘텐츠와 창작물 모두 처리
- GEO 데이터를 꿰뚫고, 근거 기반 피드백
- 게이트키퍼가 아닌 퍼실리테이터

> 상세: `community/HERALD-SOUL.md`

---

## Token Economy — 장기 비전

### Phase 1: 내부 포인트 (MVP, 0~6개월)
- DB 기반 포인트 시스템 (Notion)
- 1P ≈ $0.1
- 포인트 = 활동 보상 (글 발행, Peer Review, GEO Impact)
- 현금 교환 불가. "미래 가치"로 축적

### Phase 2: 수익 채널 + 실물 보상 (6~12개월)
- 수입원: Education, Podcast, 광고, 스폰서십
- 포인트 → 실물 보상 시작 (Claude Code Max 구독 등)

### Phase 3: 토큰화 (12개월+)
- 싱가폴 PTE 법인 설립
- 내부 포인트 → 온체인 토큰 전환

### 보상 설계 원칙 (Steemit 교훈)
- **1인 1표** → 고래 독점 방지
- **자기 글 투표 불가** → self-voting 차단
- **GEO Quality Score 최소 컷** → 양산형 글 차단
- **월간 발행 상한 + 소각 구조** → 인플레이션 방지

---

## Infrastructure Vision

### 현재 (MVP)
```
Creator → Discord DM (Herald 🔔) → GEO QA → Peer Review → Mother 최종 승인 → 발행
```

### 중기
```
Creator → 웹 대시보드 → Herald Agent → 자동 GEO QA → Peer Review (AI + Human) → 자동 발행
```

### 장기
```
Creator (자체 AI 군단) → HypeProof Protocol → 온체인 검증 → 탈중앙 발행 → 토큰 보상
```

---

*이 문서는 HypeProof Lab의 방향을 담은 살아있는 문서입니다.*
*마스터 스펙: `community/SPEC.md` 참조*
