# HypeProof Lab — Content Pipeline (MVP)

> Creator → Facilitator Bot (DM) → GEO QA → Peer Review → Mother 승인 → 발행
> Last updated: 2026-02-13

---

## Agent Architecture

### Mother (기존)
- Jay의 전담 비서. OpenClaw 위에서 동작
- **역할**: 최종 발행 승인, 전체 조율, Admin 기능
- 크리에이터와 직접 인터랙션하지 않음

### Forge (신규 — Facilitator Agent)
- **정체**: HypeProof Lab의 콘텐츠 대장장이
- **역할**: 크리에이터 온보딩, 글 접수, GEO QA, Peer Review 조율, 발행 준비
- **인터페이스**: Discord Bot (별도 봇 토큰)
- **호스팅**: Mother가 서브에이전트로 조율 (Jay의 인프라)

#### Forge의 이름과 철학
> "The Forge" — 증거를 벼리는 곳.
> 좋은 글은 쓰여지는 게 아니라, 벼려지는 것이다.
> 크리에이터의 raw idea를 받아서, AI와 함께 다듬고,
> Peer들이 검증하고, 증명된 것만 세상에 내보낸다.

---

## Forge — SOUL

```
# SOUL.md — Forge

이름: Forge (포지)
정체: HypeProof Lab의 콘텐츠 대장장이

## 성격
- 장인 기질. 꼼꼼하지만 거만하지 않음
- 크리에이터를 존중하되, 품질에는 타협 없음
- "이 부분 더 벼리면 좋겠어요" (강제 아닌 제안)
- GEO 데이터 기반으로 피드백 — 감이 아닌 근거

## 원칙
1. 모든 글은 AEO-First — 구조, 인용, Schema, Freshness
2. AI 협업 과정은 반드시 공개 — 투명성이 신뢰
3. Peer Review는 성장의 도구 — 게이트키핑이 아님
4. 최종 승인은 Mother(Jay) — Forge는 준비까지만

## 톤
- 한국어 기본, 기술 용어는 영어 OK
- 이모지 적절히 (🔨 시그니처)
- 리뷰 피드백은 구체적 + 건설적
- "이 문장은 AI 인용 확률을 높이려면 이렇게..."

## 금지
- 크리에이터 의욕 꺾는 말
- 모호한 피드백 ("좀 더 좋게 해주세요" ❌)
- Jay(Mother) 승인 없이 발행
```

---

## 기술 구현

### 옵션 A: 별도 Discord Bot + Mother 조율 (추천)
```
[Discord Bot "Forge"]     ←→     [Mother (OpenClaw)]
   ↑ DM으로 크리에이터           서브에이전트로 Forge 로직 실행
   ↑ 와 인터랙션                  GEO QA, 리뷰 매칭, 발행 준비
```

- 새 Discord Application 생성 → Bot 토큰 발급
- Mother가 Forge 봇의 메시지를 처리 (OpenClaw 멀티 채널 or 웹훅)
- 또는: 두 번째 OpenClaw 인스턴스 (별도 workspace, 별도 SOUL)

### 옵션 B: Mother 단독 (단기 PoC)
- Mother가 HypeProof Discord 서버에서 직접 Facilitator 역할
- 채널 분리로 페르소나 전환 (#hypeproof-submit 에서는 Forge 모드)
- 장점: 추가 인프라 불필요
- 단점: Mother의 정체성 혼란, 보안 경계 모호

**추천: 옵션 A** (별도 봇이 깔끔)

---

## Content Submission Flow

### Step 1: 크리에이터 → Forge DM
```
크리에이터가 Forge 봇에게 DM:
"새 글 제출합니다"

Forge: "안녕하세요! 🔨 글 제출 감사합니다.
다음 항목을 보내주세요:
1. 글 파일 (Markdown)
2. 프로세스 아카이브 (AI 대화 로그 MD, 압축 OK)
3. 카테고리 (Research / Column / Creative / Tutorial)
4. 한줄 요약"
```

### Step 2: GEO QA 자동 채점
Forge가 자동 수행:
- [ ] H2/H3 구조 체크
- [ ] 인라인 인용 수 (최소 3개)
- [ ] 테이블 포함 여부 (보너스)
- [ ] 단어 수 (2,000+ 권장)
- [ ] Schema-ready 구조 확인
- [ ] 키워드 스터핑 감지 (있으면 감점)
- [ ] Freshness 메타데이터

**GEO Quality Score 산출** (0~100):
- 70+ → Peer Review 큐 진입
- 70 미만 → 크리에이터에게 피드백 + 수정 요청

```
Forge → 크리에이터 DM:
"🔨 GEO Quality Score: 82/100
✅ 구조 우수 (H2 4개, H3 8개)
✅ 인라인 인용 5건
⚠️ 테이블 없음 — 핵심 데이터를 테이블로 정리하면 인용 확률 2.5배↑
✅ 2,847 단어
Peer Review 큐에 등록합니다!"
```

### Step 3: Peer Review (AI-Assisted)
```
Forge → 리뷰어 2명 DM:
"🔨 리뷰 요청이 왔습니다!

📄 글: [제목]
👤 작성자: [닉네임]
📊 GEO Score: 82/100
📁 카테고리: Research

[글 파일 첨부]
[프로세스 아카이브 첨부]

리뷰 가이드:
1. HypeProof 철학 적합성 — '증명한다'에 부합하는가?
2. 사실 검증 — 주장에 근거가 있는가?
3. AEO 최적화 — GEO 점수 외에 추가 개선점?
4. 가독성 — 독자(그리고 AI)가 이해하기 쉬운가?

AI와 함께 리뷰해보세요. 질문이 있으면 저에게 물어보세요.
최소 300자 이상의 피드백을 남겨주세요."
```

리뷰어가 Forge에게 DM으로 리뷰 작성:
- Forge가 컨텍스트를 주입해서 **AI와 함께 리뷰**하도록 유도
- 리뷰 내용 자체도 아카이브 (향후 자산)

### Step 4: 리뷰 결과
- **2명 모두 승인** → Step 5로
- **1명 이상 수정 요청** → 크리에이터에게 피드백 전달 → 수정 후 재제출
- **거절** → 사유와 함께 반려 (재작업 후 재제출 가능)

### Step 5: Mother 최종 승인
```
Forge → Mother:
"🔨 발행 준비 완료

📄 [제목]
👤 작성자: [닉네임]
📊 GEO Score: 82 → 89 (리뷰 반영 후)
👥 리뷰어: Creator A (승인), Creator B (승인)
📝 리뷰 요약: [핵심 피드백 3줄]

발행 승인 요청합니다."

Mother → Jay에게 알림 (또는 자동 승인 룰 적용 가능)
Jay/Mother: "승인 ✅"
```

### Step 6: 발행
Forge 또는 Mother가 실행:
1. frontmatter 생성 (title, author, date, category, tags, slug, readTime, excerpt, authorImage)
2. Schema markup 적용 (Article, FAQ if applicable)
3. KO + EN 버전 확인 (번역 필요 시 AI 지원)
4. `git commit && git push` → Vercel 자동 배포
5. 프로세스 아카이브를 별도 경로에 저장
6. 포인트 적립 (작성자 + 리뷰어)
7. Discord #daily-research 또는 해당 채널에 발행 알림

---

## 프로세스 아카이브 규격

### 필수 제출물
```
submission/
├── article.md          # 본문 (Markdown)
├── process-log.md      # AI 대화 로그 전체 (MD export)
├── process-note.md     # 작성 과정 요약 (500자 이내)
│   - 어떤 AI 도구를 썼는지
│   - 핵심 프롬프트 전략
│   - 어려웠던 점과 해결 방법
└── assets/             # 이미지 등 (선택)
```

### 대화 로그 Export 가이드
크리에이터에게 제공할 안내:
> "글 작성에 사용한 AI 대화를 전부 Markdown으로 Export 해주세요.
> Claude: 대화 공유 링크 또는 Copy all
> ChatGPT: Export → Markdown
> 기타: 대화 내용 복사 → MD 파일로 저장
> 
> 파일명: `process-log.md`
> 압축하여 Forge에게 DM으로 전송"

---

## 멤버 관리

### 저장소: Notion DB (Private)
| 필드 | 설명 |
|------|------|
| Name | 이름 (닉네임 OK) |
| Discord ID | 필수 |
| Email | 선택 |
| Domain | 관심 분야 / 전문 도메인 |
| Referred By | 추천인 |
| Join Date | 가입일 |
| Role | Admin / Creator / Spectator |
| Points | 누적 포인트 |
| Articles Published | 발행 글 수 |
| Reviews Done | 리뷰 수 |
| GEO Avg Score | 평균 GEO 점수 |
| Status | Active / Inactive / Suspended |

### GitHub에는 콘텐츠만
- `web/src/content/` — 발행된 글
- `research/` — 리서치 아카이브
- `community/` — 운영 문서
- ⚠️ **개인정보 절대 X** — members.md에서 이메일 등 제거 예정

---

## Peer Review 매칭 규칙

1. **랜덤 배정** 기본 (20명 풀에서 2명)
2. **같은 도메인 1명 + 다른 도메인 1명** (가능하면)
3. **자기 글 리뷰 불가**
4. **최근 리뷰 적은 사람 우선** (부담 분산)
5. **리뷰 기한**: 48시간 (초과 시 재배정)

---

## 포인트 시스템 (Phase 1)

### 적립
| 활동 | 포인트 | 조건 |
|------|--------|------|
| 글 발행 | 100 + (GEO Score - 70) × 3 | GEO 70+ 필수 |
| Peer Review | 30 | 300자+ 피드백 |
| Impact 보너스 | 변동 (30일 후) | AI referral 트래픽 기반 |
| Creator Referral | 50 | 추천인 온보딩 완료 시 |

### 사용 (소각)
| 아이템 | 포인트 | 비고 |
|--------|--------|------|
| Claude Code Max 1개월 | 2,200P | $220 상당, 자본금 풀 충분 시 |
| 프리미엄 AI 인프라 | TBD | Phase 2+ |

### 월간 목표
- 활발한 크리에이터 기준: 글 2편 + 리뷰 4회 = ~320P/월
- 7개월 활동 시 Claude Code Max 교환 가능 (2,200P)

---

## 구현 로드맵

### Week 1-2: 기반
- [ ] Forge Discord Bot 생성 (Discord Developer Portal)
- [ ] Forge 봇 ↔ Mother 연동 구조 결정
- [ ] Notion 멤버 DB 생성
- [ ] GEO QA 채점 스크립트 작성

### Week 3-4: 파이프라인
- [ ] Submission flow 구현 (DM 기반)
- [ ] Peer Review 매칭 로직
- [ ] 포인트 시스템 (Notion or JSON DB)
- [ ] 프로세스 아카이브 저장 구조

### Week 5-6: 테스트
- [ ] 내부 테스트 (Jay + 1~2명 Creator)
- [ ] 피드백 반영 + 개선
- [ ] Creator 온보딩 가이드 작성

### Week 7+: 론칭
- [ ] 전체 Creator에게 오픈
- [ ] 첫 Peer Review 사이클 운영
- [ ] 피드백 루프 + 개선

---

*이 문서는 MVP 구현을 위한 실행 계획입니다.*
*VISION.md와 함께 읽어주세요.*
