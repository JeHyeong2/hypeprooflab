# HypeProof Lab — System Architecture

> 전체 시스템 아키텍처 개요 + 다이어그램
> Version: 1.0 | Created: 2026-02-14

---

## 1. System Overview

탈중앙 구조: 각 Creator가 자신의 OpenClaw 인스턴스에서 작가 에이전트를 운영하고, Discord를 통해 Herald에게 콘텐츠를 제출한다.

```mermaid
graph TB
    subgraph "Creator A (자기 PC/서버)"
        CA_OC[OpenClaw Instance]
        CA_WA[Writer Agent<br/>hypeproof-writer 스킬]
        CA_OC --> CA_WA
    end

    subgraph "Creator B (자기 PC/서버)"
        CB_OC[OpenClaw Instance]
        CB_WA[Writer Agent<br/>hypeproof-writer 스킬]
        CB_OC --> CB_WA
    end

    subgraph "Discord"
        CP[#content-pipeline]
        CW[#creative-workshop]
        AN[#announcements]
    end

    subgraph "HypeProof Server"
        Herald[Herald 🔔<br/>Sonnet 4.5]
        Mother[Mother 🫶<br/>Opus 4.6]
        GEO[GEO QA Script]
        Herald --> GEO
        Herald <-->|sessions_send| Mother
    end

    subgraph "Infrastructure"
        GitHub[GitHub Repo]
        Vercel[Vercel CDN]
        Notion[Notion DB<br/>Members · Points · Personas]
        GA[Google Analytics]
    end

    CA_WA -->|Discord Bot| CP
    CB_WA -->|Discord Bot| CP

    CP --> Herald
    CW --> Herald
    Herald --> AN

    Mother -->|git push| GitHub
    GitHub -->|auto-deploy| Vercel
    Herald -->|read/write| Notion
    Vercel --> GA
```

---

## 2. Content Submission Flow

```mermaid
sequenceDiagram
    participant WA as Writer Agent
    participant DC as Discord #content-pipeline
    participant H as Herald 🔔
    participant GEO as GEO QA Script
    participant R1 as Reviewer 1
    participant R2 as Reviewer 2
    participant M as Mother 🫶
    participant GH as GitHub
    participant V as Vercel

    WA->>DC: 📎 제출 (article.md + process-log + frontmatter)
    DC->>H: 메시지 수신
    H->>H: frontmatter 파싱 + 유효성 검증
    H->>GEO: 본문 전달
    GEO-->>H: GEO Score (0~100)

    alt GEO < 70
        H->>DC: ❌ 피드백 + 개선 제안 (스레드)
        DC->>WA: 피드백 수신
        WA->>WA: 자동 수정
        WA->>DC: 📎 재제출
    end

    H->>R1: 리뷰 요청 (스레드)
    H->>R2: 리뷰 요청 (스레드)
    R1-->>H: ✅ 승인 (300자+ 피드백)
    R2-->>H: ✅ 승인 (300자+ 피드백)

    H->>M: [발행 승인 요청] ID | 제목 | GEO | 리뷰 2/2
    M-->>H: 승인

    H->>GH: git push (frontmatter + article)
    GH->>V: auto-deploy
    H->>DC: 🔔 발행 완료 알림
    H->>H: 포인트 적립 (Creator + Reviewers)
```

---

## 3. Agent Communication

```mermaid
graph LR
    subgraph "Creator의 OpenClaw"
        WA[Writer Agent]
        WA_SOUL[SOUL.md<br/>작가 페르소나]
        WA_SKILL[hypeproof-writer<br/>스킬]
        WA --- WA_SOUL
        WA --- WA_SKILL
    end

    subgraph "Discord"
        CH[#content-pipeline<br/>스레드 기반]
    end

    subgraph "HypeProof OpenClaw"
        Herald[Herald Agent 🔔]
        H_SOUL[SOUL.md<br/>전령관]
        Herald --- H_SOUL
        Mother[Mother Agent 🫶]
        M_SOUL[SOUL.md<br/>오케스트레이터]
        Mother --- M_SOUL
    end

    WA -->|Discord Bot 메시지<br/>frontmatter + MD| CH
    CH -->|채널 바인딩<br/>herald agent| Herald
    Herald <-->|sessions_send<br/>정해진 형식만| Mother
    Herald -->|스레드 답글<br/>GEO 피드백| CH
    CH -->|피드백 수신| WA
```

### 통신 프로토콜

| 경로 | 방식 | 형식 |
|------|------|------|
| Writer → Herald | Discord 메시지 (파일 첨부) | `SUBMIT:` prefix + frontmatter JSON + MD 파일 |
| Herald → Writer | Discord 스레드 답글 | GEO breakdown + 개선 제안 |
| Herald → Mother | `sessions_send` | `[발행 승인 요청]` / `[에스컬레이션]` / `[상태 보고]` |
| Mother → Herald | `sessions_send` | `[승인]` / `[거부]` / `[지시]` |

---

## 4. Points Economy

```mermaid
flowchart TD
    subgraph "적립 (Earn)"
        PUB[글 발행<br/>100 + (GEO-70)×3]
        CRE[창작물 발행<br/>100 + (일관성-70)×2]
        REV[Peer Review<br/>30P / 300자+]
        IMP[Impact 보너스<br/>30일 후 변동]
        REF[Referral<br/>50P]
    end

    subgraph "Notion DB"
        LEDGER[(Points Ledger)]
    end

    subgraph "사용 (Spend)"
        CCM[Claude Code Max<br/>2,200P / 월]
        PREM[프리미엄 AI 인프라<br/>TBD]
    end

    PUB --> LEDGER
    CRE --> LEDGER
    REV --> LEDGER
    IMP --> LEDGER
    REF --> LEDGER
    LEDGER --> CCM
    LEDGER --> PREM

    subgraph "Anti-Gaming"
        AG1[1인 1표]
        AG2[자기 글 투표 불가]
        AG3[GEO 70+ 필수]
        AG4[월 8편 상한]
        AG5[리뷰 없이 발행 불가]
        AG6[연속 리뷰어 금지]
    end

    AG1 -.-> LEDGER
    AG2 -.-> LEDGER
    AG3 -.-> LEDGER
```

---

## 5. Onboarding Flow

```mermaid
flowchart TD
    START([새 Creator 후보]) --> REC[기존 Creator가 추천]
    REC --> SAMPLE[포트폴리오/샘플 1건 제출]
    SAMPLE --> HERALD_V[Herald 🔔 접수 + 기본 검증]
    HERALD_V --> ADMIN[Admin 최종 승인]
    ADMIN --> NOTION[Notion DB 멤버 등록]
    ADMIN --> DISCORD[Discord Creator 역할 부여]

    NOTION --> SETUP[Creator 환경 세팅]
    DISCORD --> SETUP

    subgraph "Creator 환경 세팅"
        INST_OC[OpenClaw 설치]
        INST_SK[hypeproof-writer 스킬 설치]
        CONF_BOT[Discord Bot 토큰 설정]
        INST_OC --> INST_SK --> CONF_BOT
    end

    SETUP --> FIRST[첫 제출 테스트]
    FIRST --> HERALD_FB[Herald 피드백 + GEO 채점]
    HERALD_FB --> ACTIVE([Active Creator 🎉])

    style START fill:#1a1a2e
    style ACTIVE fill:#16213e
```

---

## 6. Herald Decision Tree

```mermaid
flowchart TD
    MSG([메시지 수신]) --> IS_SUB{SUBMIT: prefix?}

    IS_SUB -->|Yes| PARSE[frontmatter 파싱]
    IS_SUB -->|No| IS_CMD{명령어?}

    PARSE --> VALID{유효한 frontmatter?}
    VALID -->|No| ERR_FM[❌ frontmatter 오류 안내<br/>누락 필드 목록]
    VALID -->|Yes| GEO_RUN[GEO QA 채점 실행]

    GEO_RUN --> GEO_CHK{Score ≥ 70?}
    GEO_CHK -->|No| FB[📋 구체적 피드백<br/>카테고리별 breakdown + 개선 제안]
    FB --> WAIT_RESUB([재제출 대기])

    GEO_CHK -->|Yes| FAST{Score ≥ 90?}
    FAST -->|Yes| REV1[리뷰어 1명 배정<br/>Fast-track]
    FAST -->|No| REV2[리뷰어 2명 배정]

    REV1 --> THREAD[스레드 생성 + 리뷰 요청]
    REV2 --> THREAD

    THREAD --> TIMER[48시간 타이머 시작]
    TIMER --> REV_DONE{리뷰 완료?}
    REV_DONE -->|시간 초과| REASSIGN[리뷰어 재배정]
    REASSIGN --> TIMER
    REV_DONE -->|Reject| FB_REV[피드백 전달 → 수정 요청]
    FB_REV --> WAIT_RESUB
    REV_DONE -->|2/2 Approve| MOTHER_REQ[Mother에게 승인 요청]

    MOTHER_REQ --> M_DEC{Mother 결정}
    M_DEC -->|승인| PUBLISH[git push + 포인트 적립 + 알림]
    M_DEC -->|거부| FB_M[사유 전달]

    IS_CMD -->|status| STATUS[제출물 상태 조회]
    IS_CMD -->|help| HELP[도움말 제공]
    IS_CMD -->|persona| PERSONA[페르소나 등록 플로우]
    IS_CMD -->|No| GENERAL[일반 대화 응답]

    style MSG fill:#2d1b69
    style PUBLISH fill:#1b4332
```

---

## 데이터 흐름 요약

| 데이터 | 저장소 | 접근 권한 |
|--------|--------|----------|
| 콘텐츠 (발행글, 소설) | GitHub → Vercel | Public (read), Creator (write) |
| 멤버 정보 (이메일, Discord ID) | Notion DB | Admin only |
| 포인트 원장 | Notion DB | Admin (write), Creator (read 본인만) |
| AI Persona 정의 | GitHub (YAML) + Notion (메타) | Creator (자기 것), Admin (전체) |
| 제출물 상태 | Herald Memory (submissions.json) | Herald (read/write) |
| GEO 채점 이력 | Herald Memory | Herald (read/write) |
| 리뷰 이력 | Herald Memory | Herald (read/write) |
| AI Referral 트래킹 | Google Analytics | Admin only |

---

## 보안 경계

```
┌─────────────────────────────────────────────────┐
│ Public Zone                                     │
│  Vercel (웹사이트)  ←  GitHub (콘텐츠)           │
│  Google Analytics                                │
├─────────────────────────────────────────────────┤
│ Creator Zone                                    │
│  Discord (#content-pipeline, #creative-workshop)│
│  각자의 OpenClaw + Writer Agent                  │
│  GitHub (push 권한)                              │
├─────────────────────────────────────────────────┤
│ Admin Zone                                      │
│  Notion DB (멤버, 포인트, 페르소나)              │
│  Mother Agent                                    │
│  Herald 설정                                     │
│  Google Analytics 대시보드                       │
└─────────────────────────────────────────────────┘
```

---

*이 문서는 SPEC.md와 연계됩니다. 다이어그램은 Mermaid 문법으로 GitHub/Notion에서 렌더링됩니다.*
