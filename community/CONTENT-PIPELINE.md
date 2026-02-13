# HypeProof Lab — Content Pipeline (MVP)

> Creator → Herald 🔔 (DM) → GEO QA → Peer Review → Mother 승인 → 발행
> Last updated: 2026-02-13

---

## Agent Architecture

### Mother (기존)
- Jay의 전담 비서. OpenClaw 위에서 동작
- **역할**: 최종 발행 승인, 전체 조율, Admin 기능
- 크리에이터와 직접 인터랙션하지 않음

### Herald 🔔 (신규 — 전령관 Agent)
- **정체**: HypeProof Lab의 콘텐츠 전령관
- **역할**: 크리에이터 온보딩, 글 접수, GEO QA, Peer Review 조율, 발행 준비, AI Persona 관리
- **인터페이스**: Discord Bot (별도 봇 토큰)
- **호스팅**: Mother가 서브에이전트로 조율 (Jay의 인프라)

> Herald SOUL: `community/HERALD-SOUL.md` 참조

---

## 기술 구현

### 추천: 별도 Discord Bot + Mother 조율
```
[Discord Bot "Herald" 🔔]     ←→     [Mother (OpenClaw)]
   ↑ DM으로 크리에이터           서브에이전트로 Herald 로직 실행
   ↑ 와 인터랙션                  GEO QA, 리뷰 매칭, 발행 준비
```

- 새 Discord Application 생성 → Bot 토큰 발급
- Mother가 Herald 봇의 메시지를 처리

---

## Content Pipeline (칼럼/리서치)

### Step 1: 크리에이터 → Herald DM
```
크리에이터가 Herald 봇에게 DM:
"새 글 제출합니다"

Herald: "🔔 안녕하세요! 글 제출 감사합니다.
다음 항목을 보내주세요:
1. 글 파일 (Markdown)
2. 프로세스 아카이브 (AI 대화 로그 MD, 압축 OK)
3. 카테고리 (Research / Column / Tutorial)
4. 한줄 요약"
```

### Step 2: GEO QA 자동 채점
Herald가 자동 수행. GEO Quality Score (0~100):

| 항목 | 배점 | 근거 |
|------|------|------|
| 인라인 인용 | 25점 | 30-40% 향상, 가장 큰 레버 |
| 구조 (H2/H3 + bullets) | 20점 | 인용 확률 40%↑ |
| 테이블 | 10점 | 2.5× 인용 |
| 단어 수 (2,000+) | 15점 | 3× 인용 |
| 통계/데이터 | 10점 | 법률/정부 도메인 효과적 |
| Schema-ready | 10점 | +36% 인용 확률 |
| Freshness 메타데이터 | 5점 | 76.4% AI 인용 |
| 키워드 스터핑 감지 | -10점 | Perplexity에서 역효과 |
| 가독성 | 5점 | Fluency optimization |

- **70+ → Peer Review 큐 진입**
- **70 미만 → 피드백 + 수정 요청**

### Step 3: Peer Review (AI-Assisted)
- 리뷰어 2명 자동 배정 (같은 도메인 1 + 다른 도메인 1)
- 자기 글 리뷰 불가
- 리뷰 기한: 48시간
- 최소 300자 피드백 필수

### Step 4: 리뷰 결과
- 2명 모두 승인 → Mother 최종 승인
- 1명 이상 수정 요청 → 피드백 전달 → 수정 후 재제출
- 거절 → 사유 + 반려

### Step 5: Mother 최종 승인
Herald → Mother 보고. Jay 승인 또는 자동 승인 룰.

### Step 6: 발행
1. Frontmatter 생성
2. Schema markup 적용
3. `git commit && git push` → Vercel 자동 배포
4. 프로세스 아카이브 저장
5. 포인트 적립 (Creator + 리뷰어)
6. Discord 발행 알림

---

## Creative Works Pipeline (AI 소설/스토리)

### AI Author Persona 시스템

각 Creator는 하나 이상의 **AI Author Persona**를 등록할 수 있다.

- 페르소나는 독립된 보이스, 스타일, 세계관을 가짐
- 등록 양식: `community/AI-PERSONA-TEMPLATE.md`

### 페르소나 등록 흐름

```
Creator → AI-PERSONA-TEMPLATE.md 작성 → Herald 🔔 DM 제출
→ Herald 검증 (SOUL 완성도, 샘플-SOUL 일관성, 이름 중복 체크)
→ Admin 승인 → Notion DB 등록 → 웹사이트 프로필 표시
```

### 창작물 제출 흐름

```
Creator → Herald 🔔 DM (작품 + 페르소나명 + 프로세스 아카이브)
→ Herald 접수 (페르소나 등록 확인)
→ Peer Review (2명, 창작 리뷰 기준 적용)
→ Mother 최종 승인 → 발행
```

### 창작물 리뷰 기준

| 항목 | 비중 |
|------|------|
| 페르소나 일관성 | 30% |
| 스토리텔링 품질 | 25% |
| AI 협업 투명성 | 20% |
| 독창성 | 15% |
| 기술적 완성도 | 10% |

> GEO Score는 적용하지 않음 — 창작물은 AEO 최적화 대상이 아님

---

## 프로세스 아카이브 규격

```
submission/
├── article.md          # 본문 (Markdown)
├── process-log.md      # AI 대화 로그 전체 (MD export)
├── process-note.md     # 작성 과정 요약 (500자 이내)
└── assets/             # 이미지 등 (선택)
```

---

## 멤버 관리

### 저장소: Notion DB (Private)

> 상세 필드: `community/SPEC.md` Section A 참조

### GitHub에는 콘텐츠만
- `web/src/content/` — 발행된 글
- `research/` — 리서치 아카이브
- `community/` — 운영 문서
- ⚠️ **개인정보 절대 X**

---

## 포인트 시스템 (Phase 1)

| 활동 | 포인트 | 조건 |
|------|--------|------|
| 글 발행 | 100 + (GEO Score - 70) × 3 | GEO 70+ |
| 창작물 발행 | 100 + (일관성 Score - 70) × 2 | 리뷰 통과 |
| Peer Review | 30 | 300자+ |
| Impact 보너스 | 변동 (30일 후) | AI referral 기반 |
| Referral | 50 | 온보딩 완료 시 |

### 사용
| 아이템 | 포인트 |
|--------|--------|
| Claude Code Max 1개월 | 2,200P |

---

## 구현 로드맵

### Week 1-2: 기반
- [ ] Herald Discord Bot 생성
- [ ] Herald ↔ Mother 연동 구조 결정
- [ ] Notion 멤버 DB 생성
- [ ] GEO QA 채점 스크립트 작성

### Week 3-4: 파이프라인
- [ ] Submission flow 구현 (DM 기반)
- [ ] Peer Review 매칭 로직
- [ ] 포인트 시스템
- [ ] 프로세스 아카이브 저장 구조

### Week 5-6: 테스트
- [ ] 내부 테스트 (Jay + 1~2명)
- [ ] 피드백 반영 + 개선
- [ ] Creator 온보딩 가이드 작성

### Week 7+: 론칭
- [ ] 전체 Creator 오픈
- [ ] 첫 Peer Review 사이클
- [ ] AI Persona 등록 시작

---

*마스터 스펙: `community/SPEC.md` 참조*
