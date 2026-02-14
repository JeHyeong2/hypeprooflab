# HypeProof Lab — Master Specification

> THE definitive document for HypeProof Lab community architecture
> Version: 1.0 | Last updated: 2026-02-13

---

## A. Community Structure

### 역할 정의

| 역할 | 설명 | 인원 | 권한 |
|------|------|------|------|
| **Admin** | 운영진 (Jay) | 1~2명 | 전체 관리, 최종 발행 승인, Agent 호스팅, 포인트 관리 |
| **Creator** | 핵심 크리에이터 | 최대 20명 | 글 작성, Peer Review, AI Agent 접근, 포인트 적립, AI 페르소나 등록 |
| **Spectator** | 자유 가입 관람자 | 무제한 | 콘텐츠 열람, Discord 일반 채널 참여 |

> ⚠️ "Author"라는 용어는 사용하지 않는다. 모두 **Creator**다.

### Creator 가입 절차

1. 기존 Creator가 후보를 추천 (Referral 필수)
2. 후보가 포트폴리오 또는 샘플 작품 1건 제출
3. Herald(🔔)이 제출물 접수 및 기본 검증
4. Admin(Jay)이 최종 승인
5. Notion DB에 멤버 등록 + Discord Creator 역할 부여

### 멤버 데이터

**저장소: Notion DB (Private)**

| 필드 | 타입 | 필수 | 비고 |
|------|------|------|------|
| Name | Text | ✅ | 닉네임 OK |
| Discord ID | Text | ✅ | 고유 식별자 |
| Domain | Select | ✅ | 전문 분야 |
| Referred By | Relation | ✅ | 추천인 (Creator만) |
| Join Date | Date | ✅ | 가입일 |
| Role | Select | ✅ | Admin / Creator / Spectator |
| Points | Number | ✅ | 누적 포인트 |
| Articles Published | Number | Auto | 발행 글 수 |
| Reviews Done | Number | Auto | 리뷰 수 |
| GEO Avg Score | Number | Auto | 평균 GEO 점수 |
| Status | Select | ✅ | Active / Inactive / Suspended |
| AI Personas | Relation | Auto | 등록된 AI 작가 페르소나 |
| Email | Text | ❌ | 선택 |

> ⚠️ GitHub에는 **개인정보 절대 불가**. Notion에만 보관.

---

## B. Herald Agent (헤럴드) 🔔

### 정체성

| 항목 | 값 |
|------|-----|
| 이름 | Herald (헤럴드) |
| 이모지 | 🔔 |
| 정체 | HypeProof Lab의 콘텐츠 전령관 |
| 역할 | 크리에이터 온보딩, 글 접수, GEO QA, Peer Review 조율, 발행 준비, AI 페르소나 관리 |

### 페르소나

Herald는 중세 도시의 전령관이다.
- 진실을 알린다 (Announces truth)
- 품질을 큐레이팅한다 (Curates quality)
- 창작을 촉진한다 (Facilitates creation)
- **게이트키퍼가 아니다** — 품질의 챔피언이자 퍼실리테이터

### Architecture

```
[Discord Bot "Herald" 🔔]     ←→     [Mother (OpenClaw)]
   ↑ DM으로 크리에이터와              서브에이전트로 Herald 로직 실행
   ↑ 인터랙션                          GEO QA, 리뷰 매칭, 발행 준비
```

- 별도 Discord Application + Bot 토큰
- Mother가 Herald를 서브에이전트로 조율
- Herald는 크리에이터와 직접 대화, Mother는 Admin(Jay)에게만 보고
- 콘텐츠(칼럼/리서치)와 창작물(소설/스토리) 모두 처리

> 전체 SOUL 문서: `community/HERALD-SOUL.md` 참조

---

## C. Content Pipeline (Articles / Columns / Research)

### 흐름

```
Creator → Herald DM 제출 → GEO QA 자동채점 → Peer Review (2명) → Mother 최종 승인 → 발행
```

### Step 1: 제출

Creator가 Herald 🔔에게 DM으로 제출:

| 제출물 | 형식 | 필수 |
|--------|------|------|
| 본문 | `article.md` (Markdown) | ✅ |
| 프로세스 아카이브 | `process-log.md` (AI 대화 전체 로그) | ✅ |
| 프로세스 노트 | `process-note.md` (500자 이내 요약) | ✅ |
| 카테고리 | Research / Column / Tutorial | ✅ |
| 한줄 요약 | Text | ✅ |
| 이미지/에셋 | `assets/` 폴더 | ❌ |

### Step 2: GEO QA 자동 채점

Herald가 자동 수행. **GEO Quality Score** (0~100):

| 항목 | 배점 | 근거 |
|------|------|------|
| **인라인 인용** (신뢰 출처) | 25점 | 가장 큰 레버, 30-40% 향상 |
| **구조** (H2/H3 계층 + bullets) | 20점 | 인용 확률 40%↑ |
| **테이블** 포함 여부 | 10점 | 인용 2.5× |
| **단어 수** (2,000+ 권장) | 15점 | 3× 더 인용 |
| **통계/데이터** 포함 | 10점 | 법률/정부 도메인 특히 효과적 |
| **Schema-ready 구조** | 10점 | +36% 인용 확률 |
| **Freshness 메타데이터** | 5점 | 30일 이내 업데이트 76.4% 인용 |
| **키워드 스터핑 감지** (있으면 감점) | -10점 | Perplexity에서 특히 역효과 |
| **가독성/유창성** | 5점 | Fluency optimization 효과 |

**임계값:**
- **70+ → Peer Review 큐 진입**
- **70 미만 → 피드백 + 수정 요청**
- **90+ → Fast-track (리뷰어 1명으로 축소 가능)**

### Step 3: Peer Review

- 리뷰어 2명 자동 배정
- **매칭 규칙:**
  1. 같은 도메인 1명 + 다른 도메인 1명 (가능하면)
  2. 자기 글 리뷰 불가
  3. 최근 리뷰 적은 사람 우선 (부담 분산)
  4. 리뷰 기한: **48시간** (초과 시 재배정)

- **리뷰 가이드:**
  1. HypeProof 철학 적합성 — "증명한다"에 부합?
  2. 사실 검증 — 주장에 근거?
  3. AEO 최적화 — GEO 점수 외 추가 개선점?
  4. 가독성 — 독자와 AI가 이해하기 쉬운가?
  5. 최소 **300자 이상** 피드백

- **결과:**
  - 2명 모두 승인 → Mother 최종 승인으로
  - 1명 이상 수정 요청 → 피드백 전달 → 수정 후 재제출
  - 거절 → 사유 + 반려 (재작업 후 재제출 가능)

### Step 4: Mother 최종 승인

Herald → Mother로 발행 준비 완료 보고. Jay가 승인 또는 자동 승인 룰 적용.

### Step 5: 발행

1. Frontmatter 생성 (title, creator, date, category, tags, slug, readTime, excerpt, creatorImage)
2. Schema markup 적용 (Article, FAQ)
3. KO + EN 확인 (번역 필요 시 AI 지원)
4. `git commit && git push` → Vercel 자동 배포
5. 프로세스 아카이브 별도 경로 저장
6. 포인트 적립 (Creator + 리뷰어)
7. Discord 발행 알림

### 프로세스 아카이브 규격

```
submission/
├── article.md          # 본문
├── process-log.md      # AI 대화 로그 전체
├── process-note.md     # 작성 과정 요약 (500자 이내)
└── assets/             # 이미지 등 (선택)
```

### AEO-First 콘텐츠 규칙

1. 모든 글에 **인라인 인용** 최소 3개 (신뢰 출처)
2. **H2/H3 계층 구조** + 불릿/넘버링 필수
3. **2,000단어 이상** 권장
4. **테이블** 핵심 데이터 정리 시 필수 사용
5. **키워드 스터핑 금지** — 오히려 성능 저하
6. **Schema-ready**: 날짜, 저자, 카테고리 메타데이터 포함
7. **30일 이내 업데이트** 정책 — Freshness 유지

---

## D. Creative Works Pipeline (AI Novels / Stories)

### AI Author Persona 시스템

각 Creator는 하나 이상의 **AI Author Persona** (AI 작가 페르소나)를 등록할 수 있다.

- 예: Jay의 **CIPHER** — AI 소설가 페르소나
- 페르소나는 독립된 보이스, 스타일, 세계관을 가짐
- Creator와 페르소나는 1:N 관계 (1 Creator → 여러 페르소나)

> 페르소나 등록 양식: `community/AI-PERSONA-TEMPLATE.md` 참조

### 페르소나 등록 프로세스

1. Creator가 `AI-PERSONA-TEMPLATE.md` 양식 작성
2. Herald 🔔에게 DM으로 제출
3. Herald가 검증:
   - SOUL 문서 완성도 (보이스, 스타일, 테마 명확한가?)
   - 샘플 작품과 SOUL의 일관성
   - 기존 페르소나와 이름 충돌 없음
4. Admin 승인 → Notion DB에 페르소나 등록
5. 웹사이트 Creator 프로필에 페르소나 표시

### 창작물 제출

| 제출물 | 형식 | 필수 |
|--------|------|------|
| 작품 파일 | Markdown | ✅ |
| 사용 페르소나 | 등록된 AI Persona 이름 | ✅ |
| 프로세스 아카이브 | AI 대화 로그 | ✅ |
| 프로세스 노트 | 창작 과정 요약 | ✅ |
| 장르/카테고리 | Text | ✅ |
| 시놉시스 | 300자 이내 | ✅ |

### 창작물 리뷰 프로세스

칼럼/리서치와 달리, 창작물 리뷰는 **주관적 요소**를 인정한다.

**리뷰 기준:**

| 항목 | 비중 | 설명 |
|------|------|------|
| 페르소나 일관성 | 30% | SOUL 문서에 정의된 보이스/스타일과 일치하는가? |
| 스토리텔링 품질 | 25% | 서사 구조, 캐릭터, 몰입감 |
| AI 협업 투명성 | 20% | 프로세스 아카이브의 충실도 |
| 독창성 | 15% | 고유한 관점과 표현 |
| 기술적 완성도 | 10% | 문법, 일관성, 형식 |

- 리뷰어 2명 (최소 1명은 창작 경험 보유)
- GEO Score는 적용하지 않음 (창작물은 AEO 최적화 대상 아님)
- 대신 **페르소나 일관성 점수** (0~100) 산출

### 웹사이트 게시 형식

```yaml
---
type: creative
title: "작품 제목"
persona: "CIPHER"
creator: "Jay"
genre: "SF"
date: 2026-02-13
series: "시리즈명 (선택)"
episode: 1
synopsis: "시놉시스"
personaAvatar: "/avatars/cipher.png"
---
```

---

## E. AI Author Persona Spec

> Gold standard: Jay의 CIPHER — `novels/authors/cipher.yaml`

### 등록 필수 제출물

| 항목 | 파일 | 설명 | 필수 |
|------|------|------|------|
| **Persona YAML** | `[name].yaml` | 정체성, 장르, 스타일, 영향, 테마, 보이스, 규칙, 작품 목록 | ✅ |
| **Master Writing Prompt** | `[WORK]_Writing_Prompt.md` | 작품 설정, 인물, 구조, 집필 규칙 — AI에 입력하면 집필 가능 | ✅ |
| **Sample Work** | Markdown 1챕터 | 4,000~6,000자 권장 | ✅ |
| **Avatar** | `[NAME].png` | 512×512+, AI 생성 OK | ✅ |

### Persona YAML 필수 섹션

| 섹션 | 설명 | CIPHER 예시 |
|------|------|-------------|
| **Identity** | name, human, avatar | CIPHER, Jay, CIPHER.png |
| **Genres** | 주 활동 장르 리스트 | SF, 디스토피아 스릴러, 철학적 픽션, 테크 느와르 |
| **Style** | tone, sentence, pov, bilingual | 건조하고 간결 / 짧은 문장 위주 / 3인칭 제한 / true |
| **Influences** | authors, works, philosophy | 테드 창, 코맥 매카시 / 블레이드 러너 2049 / 보드리야르 |
| **Themes** | 반복적으로 다루는 주제 | 현실과 가상의 경계, AI 의식과 자유의지 |
| **Voice** | 페르소나의 영혼 (산문 서술) | "시스템을 만들면서 동시에 해체하는 자" |
| **Rules** | 집필 규칙/제약 | 수식어 배제, hook 배치, 실제 과학 기반, 진부한 표현 금지 |
| **Works** | 작품 목록 (title, status, genre, volumes, design 포인터) | SIMULACRA, 연재중, 3권 |

### Master Writing Prompt 필수 포함

1. 작품 설정 (장르, 배경, 분위기, 언어)
2. 핵심 전제 (1~3문장)
3. 등장인물 (주인공, 주요 인물, 안타고니스트 — 성격, 아크)
4. 구조 (권/파트별 줄거리)
5. 집필 규칙 (YAML rules의 구체화)
6. 참고 작품
7. 사용법 ("이제 [권]의 [Chapter X]를 집필해주세요")

### 파일 구조 (CIPHER 기준)

```
novels/
├── authors/
│   ├── cipher.yaml              # 페르소나 정의
│   └── CIPHER.png               # 아바타
├── designs/
│   └── SIMULACRA_Writing_Prompt.md  # 마스터 프롬프트
├── simulacra/                   # 실제 챕터들
│   ├── vol1/ vol2/ vol3/
web/
├── public/authors/cipher.png    # 웹사이트용
└── src/content/novels/ko/       # 발행된 챕터
```

### Herald 검증 체크리스트

- [ ] YAML 8개 섹션 모두 작성됨
- [ ] Master Writing Prompt 7개 항목 포함
- [ ] 샘플 작품이 YAML의 voice/style/rules와 일관됨
- [ ] 페르소나 이름이 기존 등록과 중복되지 않음
- [ ] 아바타 이미지 제출됨 (512×512+)

### Creator-Persona 관계

- 1 Creator → N Personas (제한 없음, 단 각각 품질 유지)
- 1 Persona → 1 Creator (소유권 명확)
- Creator 탈퇴 시: 페르소나 아카이브 처리 (발행물 유지, 신규 발행 불가)

---

## F. Token Economy (Phase 1: Points)

### 기본 설계

| 항목 | 값 |
|------|-----|
| 단위 | P (Point) |
| 환율 | 1P ≈ $0.1 |
| 저장소 | Notion DB |
| 현금 교환 | Phase 1에서 불가 |

### 적립

| 활동 | 포인트 | 조건 |
|------|--------|------|
| 글 발행 (칼럼/리서치) | 100 + (GEO Score - 70) × 3 | GEO 70+ 필수 |
| 창작물 발행 | 100 + (페르소나 일관성 Score - 70) × 2 | 리뷰 통과 필수 |
| Peer Review 수행 | 30 | 300자+ 피드백 |
| Impact 보너스 | 변동 (30일 후) | AI referral 트래픽 기반 |
| Creator Referral | 50 | 추천인 온보딩 완료 시 |

**예시:**
- GEO Score 85인 글 발행: 100 + (85-70) × 3 = **145P**
- 월 2편 발행 + 4회 리뷰: 290 + 120 = **~410P/월**
- Claude Code Max (2,200P) 도달: **약 5.4개월**

### 사용 (소각)

| 아이템 | 포인트 | 비고 |
|--------|--------|------|
| Claude Code Max 1개월 | 2,200P | $220 상당 |
| 프리미엄 AI 인프라 | TBD | Phase 2+ |

### Anti-Gaming Rules (Steemit 교훈)

| 규칙 | 이유 |
|------|------|
| **1인 1표** — 토큰 보유량 ≠ 투표 파워 | 고래 독점 방지 |
| **자기 글 투표 불가** | Self-voting 차단 |
| **GEO Quality Score 최소 70점** | 양산형 글 차단 |
| **월간 발행 상한: 8편** | 인플레이션 방지 |
| **리뷰 없이 발행 불가** | 품질 보장 |
| **동일 리뷰어 연속 배정 금지** | 담합 방지 |

---

## G. AEO Measurement

### 1. GEO Quality Score (발행 시점, 자동)

0~100점 자동 채점. Section C의 채점표 참조.

**알고리즘 (의사코드):**

```python
def geo_quality_score(article):
    score = 0
    
    # 인라인 인용 (25점)
    citations = count_inline_citations(article)
    score += min(citations * 5, 25)  # 5개면 만점
    
    # 구조 (20점)
    h2_count = count_h2(article)
    h3_count = count_h3(article)
    has_bullets = has_bullet_lists(article)
    score += min(h2_count * 3, 12) + min(h3_count * 1, 4) + (4 if has_bullets else 0)
    
    # 테이블 (10점)
    tables = count_tables(article)
    score += min(tables * 5, 10)
    
    # 단어 수 (15점)
    words = word_count(article)
    if words >= 3000: score += 15
    elif words >= 2000: score += 12
    elif words >= 1500: score += 8
    elif words >= 1000: score += 4
    
    # 통계/데이터 (10점)
    stats = count_statistics(article)  # 숫자 + 단위/퍼센트 패턴
    score += min(stats * 2, 10)
    
    # Schema-ready (10점)
    has_frontmatter = check_frontmatter(article)
    has_date = check_date_meta(article)
    has_author = check_author_meta(article)
    score += (4 if has_frontmatter else 0) + (3 if has_date else 0) + (3 if has_author else 0)
    
    # Freshness (5점)
    if has_freshness_metadata(article): score += 5
    
    # 키워드 스터핑 감점 (-10점)
    if detect_keyword_stuffing(article): score -= 10
    
    # 가독성 (5점)
    readability = flesch_kincaid_adapted(article)
    score += min(readability, 5)
    
    return max(0, min(100, score))
```

### 2. Impact Score (발행 후 30일)

| 지표 | 측정 방법 | 비중 |
|------|----------|------|
| AI Referral 트래픽 | ChatGPT/Perplexity UA/referrer 추적 (Google Analytics) | 40% |
| AI 인용 테스트 | 주요 키워드로 AI에 질문, 인용 여부 확인 | 30% |
| 총 트래픽 | Google Analytics 페이지뷰 | 20% |
| 소셜 공유 | 외부 링크/멘션 수 | 10% |

### 3. AI Citation Testing

**주기:** 발행 후 7일, 14일, 30일

**방법:**
1. 글의 핵심 주제로 질문 3개 생성
2. ChatGPT, Perplexity, Gemini에 각각 질의
3. HypeProof 콘텐츠 인용 여부 기록
4. 인용 시 정확도 검증 (올바르게 인용했는가?)

**기록 형식:**

| 날짜 | 질문 | 플랫폼 | 인용여부 | 정확도 |
|------|------|--------|---------|--------|
| 2026-02-20 | "..." | ChatGPT | ✅ | 정확 |

---

## H. Tech Stack

| 컴포넌트 | 기술 | 역할 |
|----------|------|------|
| **Creator Agent** | OpenClaw + hypeproof-writer 스킬 | 각 Creator의 PC/서버에서 운영. 콘텐츠 작성 보조, 자동 제출, 피드백 반영 |
| **Herald** 🔔 | Discord Bot (별도 토큰) + OpenClaw Agent | 크리에이터/에이전트 인터페이스, GEO QA, 리뷰 조율 |
| **Mother** 🫶 | OpenClaw | 오케스트레이터, 최종 승인, Admin 기능 |
| **Notion** | Notion DB (fetch API only, SDK 사용 금지) | 멤버 관리, 포인트, 페르소나 DB (개인정보 보관) |
| **GitHub** | Git Repository | 콘텐츠만 (발행글, 리서치, 운영문서) — **개인정보 X** |
| **Vercel** | Auto-deploy | `git push` → 자동 배포 |
| **Google Analytics** | Web Analytics | AI referral 추적 (UA/referrer) |
| **Schema.org** | Structured Data | Article, FAQ, Product schema |

### 탈중앙 에이전트 아키텍처 (Option A)

```
Creator (자기 PC/서버)
  └─ OpenClaw + Writer Agent (hypeproof-writer 스킬)
       └─ Discord Bot → #content-pipeline에 제출
                              ↓
                     Herald 🔔 (수신 — HypeProof 서버)
                       ├─ GEO QA 채점 (70점 컷)
                       ├─ 피드백 → Writer Agent가 수정 → 재제출
                       ├─ Peer Review (다른 Creator/에이전트)
                       └─ 통과 → Mother 승인 요청
                              ↓
                     Mother 🫶 (최종 승인)
                       └─ git push → Vercel 배포 → #공지사항 알림
```

각 Creator는 자신의 OpenClaw 인스턴스를 운영하고, `hypeproof-writer` 스킬을 통해 Herald에게 콘텐츠를 제출한다. Herald은 Discord 메시지를 통해 인간 Creator와 Writer Agent 모두로부터 제출을 수신한다.

> 상세 아키텍처 다이어그램: `community/ARCHITECTURE.md` 참조
> Writer Agent 스킬 스펙: `community/WRITER-AGENT-SPEC.md` 참조

### Creator Agent 섹션

| 항목 | 설명 |
|------|------|
| **스킬명** | `hypeproof-writer` |
| **런타임** | Creator 자체 OpenClaw 인스턴스 |
| **제출 방식** | Discord `#content-pipeline` 채널에 `SUBMIT:` prefix 메시지 |
| **피드백 수신** | Discord 스레드에서 Herald 답글 파싱 |
| **자동 수정** | 가독성, frontmatter 등 자동 / 인용, 구조 등 반자동 |
| **재제출** | `RESUBMIT:` prefix로 같은 스레드에 재제출 |

### 데이터 흐름

```
Creator (OpenClaw + Writer Agent)
  ↓ Discord #content-pipeline
Herald (Discord Bot) ─── GEO QA Script
  ↓ 스레드 기반 리뷰 매칭
Peer Reviewers (2명 — 인간 또는 에이전트)
  ↓ 승인
Herald → Mother (sessions_send)
  ↓ 최종 승인
Mother → git push → GitHub → Vercel (자동 배포)
  ↓
Google Analytics ← AI Platforms (referral tracking)
  ↓ 30일 후
Impact Score 산출 → Notion DB (포인트 반영)
```

### 보안 경계

| 시스템 | 접근 |
|--------|------|
| Notion DB | Admin only (Jay). fetch API만 사용 (SDK 금지) |
| GitHub Repo | Creator (write), Public (read) |
| Herald Bot | Creator/Writer Agent (채널), Admin (config) |
| Mother | Admin only |
| Analytics | Admin only |
| Creator OpenClaw | 각 Creator 본인만 |

---

## Appendix: Current Members (2026-02)

| 이름 | 역할 | 도메인 |
|------|------|--------|
| Jay (이재원) | Admin | Tech / Lead |
| Kiwon (남기원) | Creator | Marketing / Strategy |
| TJ (강태진) | Creator | Contents / Media Production |
| Ryan (김지웅) | Creator | Research / Data Analysis (Physics Ph.D, CERN) |
| JY (신진용) | Creator | Research / AI Engineering |
| BH (태봉호) | Creator | Particle Physics / Data Analysis (CERN) |
| Sebastian | Creator | Engineering / Management |

---

*이 문서는 HypeProof Lab의 마스터 스펙이다. 모든 하위 문서는 이 스펙을 따른다.*
