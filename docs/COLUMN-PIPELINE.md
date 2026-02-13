# HypeProof Lab — 칼럼 퍼블리싱 파이프라인 설계

> v1.0 | 2026-02-13 | Author: Jay + Mother  
> Status: DRAFT — 구현 전 리뷰 필요

---

## 1. 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                        DISCORD LAYER                            │
│                                                                 │
│  Author ──DM──▶ Mother(Bot)                                    │
│                    │                                            │
│                    ├──▶ #column-submissions (공개 현황)          │
│                    └──▶ #editorial (편집 논의, Jay + Mother)     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPENCLAW PIPELINE                             │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────────┐ │
│  │ Intake   │──▶│ QA       │──▶│ Review   │──▶│ Publish     │ │
│  │ Skill    │   │ Skill    │   │ Gate     │   │ Skill       │ │
│  └──────────┘   └──────────┘   └──────────┘   └─────────────┘ │
│       │              │              │                │          │
│  Parse MD       3-step QA      Jay approve     git commit      │
│  Extract FM     + GEO/AEO      or auto-pub     + push         │
│  Save draft     scoring                        → Vercel        │
│                                                                 │
│  Data: ~/CodeWorkspace/hypeproof/pipeline/                      │
│    ├── submissions/    (raw intake)                             │
│    ├── drafts/         (QA 중)                                  │
│    ├── approved/       (퍼블리시 대기)                            │
│    └── authors.json    (author 프로필 + 신뢰도)                  │
└─────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HYPEPROOF WEB                                 │
│  ~/CodeWorkspace/hypeproof/web/                                 │
│  src/content/columns/{ko,en}/<slug>.md                          │
│  git push → Vercel auto-deploy                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Author 온보딩 프로세스

### 2.1 신규 Author 등록

Author가 Mother에게 DM으로 처음 연락 시:

1. Mother가 온보딩 메시지 전송:
   ```
   👋 HypeProof Lab 칼럼 기고에 관심 가져주셔서 감사합니다!
   
   기고를 시작하려면 아래 정보를 알려주세요:
   - 필명 (영문 + 한글)
   - 전문 분야 (예: DeFi, AI/ML, 토큰이코노미)
   - 프로필 이미지 (256x256 이상, 정사각형)
   - 포트폴리오/블로그 링크 (선택)
   
   참고: HypeProof는 "Hype를 쫓지 않고 증명한다"를 원칙으로 합니다.
   과대광고, 근거 없는 주장, 단순 뉴스 정리는 거절됩니다.
   ```

2. Mother가 `authors.json`에 등록:
   ```json
   {
     "discord_id": "123456789",
     "name_en": "Alice Kim",
     "name_ko": "김앨리스",
     "expertise": ["DeFi", "Tokenomics"],
     "image": "/members/alice-kim.png",
     "trust_level": 0,
     "submissions": [],
     "joined": "2026-02-13"
   }
   ```

3. 프로필 이미지를 `web/public/members/`에 저장

### 2.2 신뢰도 레벨

| Level | 이름 | 조건 | 퍼블리시 방식 |
|-------|------|------|---------------|
| 0 | 신규 | 첫 제출 | AI QA + Jay 승인 필수 |
| 1 | 검증됨 | 2회 이상 퍼블리시, QA 평균 4.0+ | AI QA + Jay 승인 |
| 2 | 신뢰됨 | 5회 이상, QA 평균 4.5+, 무수정 퍼블리시 3회+ | AI QA 통과 시 자동 퍼블리시 |

Level 승급은 자동 계산, 강등은 Jay 수동 판단.

---

## 3. 제출 → QA → 퍼블리시 전체 흐름

### 3.1 제출 (Intake)

**Discord DM 제출 방식 3가지:**

**A) 마크다운 파일 첨부**
- `.md` 파일을 DM에 첨부
- Mother가 파일 다운로드 후 파싱

**B) 텍스트 직접 입력**
- `!submit` 명령어로 시작
- Mother가 대화형으로 frontmatter 수집 후 본문 입력 안내
- 여러 메시지로 나눠 보내기 가능 (`!done`으로 종료)

**C) Google Docs/Notion 링크**
- URL 제출 → Mother가 web_fetch로 콘텐츠 추출
- 추출 후 마크다운 변환

**Intake 처리:**
```
1. 콘텐츠 수신
2. frontmatter 존재 여부 확인
   - 없으면: 대화형으로 수집 (제목, 카테고리, 태그, 요약)
   - 있으면: 유효성 1차 체크
3. slug 자동 생성: YYYY-MM-DD-<title-kebab>
4. 파일 저장: pipeline/submissions/<slug>.md
5. #column-submissions에 알림:
   "📝 새 칼럼 제출: '<title>' by <author> — QA 진행 중"
6. QA 스킬 트리거
```

### 3.2 QA 파이프라인 (4단계)

기존 column-qa 스킬 3단계 + GEO/AEO 4단계 추가.

#### Step 1: 기술 체크 (Technical)
```
- frontmatter 필수 필드 검증 (title, author, date, category, tags, slug, readTime, excerpt, authorImage)
- category ∈ {Research, Analysis, Education, Opinion}
- slug 중복 체크 (기존 columns/ 디렉토리 스캔)
- 이미지 경로 유효성
- 마크다운 문법 오류
- 본문 최소 500자
- ko/en 버전 존재 여부 (경고, 블로킹 아님)
```

#### Step 2: 콘텐츠 품질 (Content Quality)
```
각 항목 1-5점:
- 깊이(Depth): 표면적 정리인가, 심층 분석인가?
- 정확성(Accuracy): 주장에 근거가 있는가? 팩트 체크 가능한가?
- 원본성(Originality): 다른 곳에서 읽을 수 없는 고유 인사이트가 있는가?
- 스토리텔링: 읽히는 글인가? 구조와 흐름이 있는가?
- 출처(Sources): 원본 링크, 인용, 데이터 참조가 있는가?

통과 기준: 평균 3.5 이상
```

#### Step 3: 철학 체크 (Philosophy)
```
HypeProof 원칙 준수:
- 과대광고 배제: "혁명적", "게임체인저", "무조건" 등 근거 없는 수식어 경고
- 근거 기반: 주장마다 evidence가 있는가?
- 확신도 라벨 사용 여부:
  🟢 Observed — 직접 검증
  🔵 Supported — 근거 기반 추론
  🟡 Speculative — 약한 근거
  ⚪ Unknown — 불확실 인정
- 균형: 반대 의견이나 리스크를 언급하는가?

통과 기준: 평균 3.0 이상 (advisory — 피드백은 주되 강제 블록 안 함)
```

#### Step 4: GEO/AEO 최적화 체크 (신규)
```
GEO 체크리스트:
□ 고유 인사이트 존재 (단순 요약이 아닌 원본 주장)
□ 인용 가능한 한줄 문장(quotable sentence) 최소 3개
  - 예: "에이전트가 모든 실행을 대행하는 세상에서, 인간 고유의 가치는..."
□ 구조화된 클레임: [주장] + [근거] + [확신도] 패턴
□ citations frontmatter에 출처 구조화 데이터 포함
□ Schema.org Article 메타데이터 (웹사이트 레벨에서 처리)

AEO 체크리스트:
□ FAQ 섹션 또는 Q&A 형태 문단 최소 1개
□ 명확한 정의 문장 ("X란 Y이다" 패턴)
□ 비교/대조 구조 (테이블 또는 리스트)
□ Featured Snippet 최적화: 첫 문단에 핵심 답변
□ 리스트/넘버링 구조 활용

각 항목 존재/미존재 체크. 미존재 항목은 구체적 개선 제안과 함께 피드백.
GEO 점수: 존재 항목 수 / 전체 (70% 이상 통과)
AEO 점수: 존재 항목 수 / 전체 (60% 이상 통과)
```

### 3.3 QA 결과 처리

```
QA 결과 종합:
├── ✅ ALL PASS → Review Gate로
├── ⚠️ SOFT FAIL (Step 3-4 미달) → 피드백 + 수정 권장 (진행 가능)
└── ❌ HARD FAIL (Step 1-2 미달) → 수정 필수, 재제출 요청

피드백 전달:
- Author DM으로 구체적 피드백 전송
- 수정 필요 항목별 예시 포함
- "!resubmit" 으로 수정본 제출

재제출 시:
- 이전 버전과 diff 비교
- 수정된 항목만 재검증 (전체 재QA도 가능)
- 최대 3회 재제출 (초과 시 Jay 수동 리뷰)
```

### 3.4 Review Gate

```
Author trust_level < 2:
  → Jay에게 DM 알림: "📋 칼럼 리뷰 요청: '<title>' by <author>"
  → #editorial에 QA 리포트 + 칼럼 링크 게시
  → Jay가 "!approve <slug>" 또는 "!reject <slug> <reason>"
  
Author trust_level >= 2:
  → QA 통과 시 자동 퍼블리시
  → #column-submissions에 알림: "✅ 자동 퍼블리시: '<title>' by <author>"
  → Jay에게 사후 알림 (24시간 내 철회 가능: "!retract <slug>")
```

### 3.5 퍼블리시 (Publish)

```
1. pipeline/approved/<slug>.md → web/src/content/columns/ko/<slug>.md 복사
2. en/ 버전 존재 시 동일 처리
3. Author 이미지 확인/복사
4. cd ~/CodeWorkspace/hypeproof/web
5. npm run build (빌드 검증)
6. 빌드 성공 시:
   git add .
   git commit -m "column: <title> by <author>"
   git push origin main
7. Vercel 자동 배포
8. 배포 확인 후 알림:
   - Author DM: "🎉 칼럼이 퍼블리시되었습니다! https://hypeproof-ai.xyz/columns/<slug>"
   - #column-submissions: "🚀 퍼블리시 완료: '<title>' by <author>"
9. authors.json 업데이트 (submissions 기록, trust_level 재계산)
```

---

## 4. GEO/AEO 체크리스트 (Author 가이드용)

### 4.1 GEO — AI가 인용하게 만드는 법

**필수:**
- [ ] 다른 곳에 없는 고유 분석/인사이트 포함
- [ ] "인용 가능한 문장" 최소 3개 (볼드 또는 블록쿼트)
  - 짧고, 명확하고, 독립적으로 의미가 통하는 문장
  - 예: > "토큰 가격이 아니라 프로토콜 수익이 진짜 밸류에이션 기준이다."
- [ ] 주장마다 확신도 라벨 표기
- [ ] `citations` frontmatter에 참조 출처 구조화
  ```yaml
  citations:
    - title: "논문/기사 제목"
      url: "https://..."
      author: "저자"
      year: "2026"
  ```

**권장:**
- [ ] 데이터/수치 인용 (구체적 숫자가 AI 인용률 높임)
- [ ] 반직관적 주장 + 근거 (AI가 "흥미로운 관점"으로 인용)
- [ ] 시계열 분석 또는 비교 프레임워크

### 4.2 AEO — 검색 엔진 답변에 뽑히는 법

**필수:**
- [ ] 글 시작부에 핵심 주장 요약 (2-3문장)
- [ ] "X란 무엇인가?" 형태의 정의 최소 1개
- [ ] FAQ 섹션 (## 자주 묻는 질문)
  ```markdown
  ## 자주 묻는 질문

  ### Q: DePIN은 실제로 수익을 내고 있는가?
  A: 2026년 1월 기준, Helium은 월 $2.3M 프로토콜 수익을 기록...
  ```

**권장:**
- [ ] 비교 테이블 (A vs B 구조)
- [ ] 넘버링된 리스트 ("3가지 핵심 요인", "5단계 프레임워크")
- [ ] How-to 구조 (단계별 가이드)
- [ ] TL;DR 섹션

### 4.3 웹사이트 레벨 GEO/AEO (별도 구현)

웹사이트에서 자동 처리할 항목 (칼럼 작성자가 신경 쓸 필요 없음):

```
- Schema.org Article 구조화 데이터 (JSON-LD)
- Open Graph / Twitter Card 메타태그
- canonical URL
- 칼럼별 FAQ schema (frontmatter의 FAQ 섹션 자동 파싱)
- sitemap.xml에 칼럼 자동 등록
- RSS feed
```

---

## 5. Discord 채널 구조

### 5.1 필요 채널

Guild: `1457738053895328004`

```
📁 EDITORIAL (카테고리)
├── #column-submissions    공개 — 제출/QA/퍼블리시 현황 로그
├── #editorial             비공개 — Jay + Mother 편집 논의
└── #author-announcements  공개 — 새 칼럼 발행 공지
```

### 5.2 채널별 용도

**#column-submissions** (공개, 읽기 전용)
- 자동 게시만 허용 (Mother bot)
- 이벤트: 새 제출, QA 결과, 퍼블리시 완료, 리젝트
- 형식:
  ```
  📝 새 제출 | "에이전트 시대의 인간 가치" by Alice Kim | 2026-02-13
  🔍 QA 진행 중...
  ✅ QA 통과 (4.2/5) | Jay 승인 대기
  🚀 퍼블리시 완료 | https://hypeproof-ai.xyz/columns/...
  ```

**#editorial** (비공개 — Jay + 편집진)
- QA 상세 리포트 공유
- 편집 방향 논의
- Author 신뢰도 관리

**#author-announcements** (공개)
- 새 칼럼 발행 시 자동 공지
- Author 소개

### 5.3 DM 인터랙션

Author ↔ Mother DM 명령어:
```
!submit          칼럼 제출 시작 (대화형)
!done            텍스트 입력 종료
!resubmit        수정본 재제출
!status          내 제출 현황 조회
!profile         내 프로필 조회/수정
!guide           기고 가이드 보기

Jay 전용:
!approve <slug>  칼럼 승인
!reject <slug> <reason>  칼럼 거절
!retract <slug>  퍼블리시 철회
!trust <author> <level>  신뢰도 수동 조정
```

---

## 6. 구현 로드맵

### Phase 1: 기반 인프라 (1-2일)

```
□ pipeline/ 디렉토리 구조 생성
  ~/CodeWorkspace/hypeproof/pipeline/
  ├── submissions/
  ├── drafts/
  ├── approved/
  ├── rejected/
  └── authors.json

□ Discord 채널 생성
  - #column-submissions (공개, 읽기전용)
  - #editorial (비공개)
  - #author-announcements (공개)

□ authors.json 스키마 확정 + Jay 초기 데이터 입력
```

### Phase 2: Intake 스킬 (2-3일)

```
□ 스킬 생성: skills/column-intake/SKILL.md
  - DM 메시지 파싱 (파일 첨부 / 텍스트 / URL)
  - frontmatter 대화형 수집
  - slug 자동 생성 + 중복 체크
  - submissions/ 저장
  - #column-submissions 알림

□ Author 온보딩 플로우
  - 미등록 사용자 감지 → 온보딩 메시지
  - 프로필 수집 → authors.json 등록
  - 프로필 이미지 처리
```

### Phase 3: QA 스킬 확장 (2-3일)

```
□ 기존 column-qa 스킬에 Step 4 (GEO/AEO) 추가
  - GEO 체크 로직
  - AEO 체크 로직
  - 통합 스코어링

□ 피드백 생성 로직
  - 항목별 구체적 개선 제안
  - 예시 포함한 피드백 메시지
  - Author DM 전송

□ 재제출 핸들링
  - diff 비교
  - 부분 재검증
  - 재제출 횟수 트래킹
```

### Phase 4: Review Gate + Publish (1-2일)

```
□ 스킬 생성: skills/column-publish/SKILL.md
  - trust_level 기반 라우팅
  - Jay 승인 워크플로 (!approve/!reject)
  - 파일 복사 + 빌드 검증 + git push
  - 배포 확인 + 알림

□ Author trust_level 자동 계산
  - 퍼블리시 횟수, QA 평균, 무수정 비율 기반
```

### Phase 5: 웹사이트 GEO/AEO (별도)

```
□ Schema.org Article JSON-LD 자동 생성
□ FAQ schema 자동 파싱 (마크다운 → JSON-LD)
□ sitemap.xml 칼럼 자동 등록
□ RSS feed 구현
□ citations → structured references 렌더링
```

### Phase 6: 운영 안정화 (지속)

```
□ 첫 외부 author 파일럿 (1-2명 초대)
□ 피드백 반영 + 프로세스 개선
□ Author 가이드 문서 작성 (공개)
□ 자동 퍼블리시 (trust_level 2) 활성화
```

---

## 7. 필요한 OpenClaw 스킬/크론 목록

### 스킬 (Skills)

| 스킬 | 경로 | 설명 |
|-------|------|------|
| column-intake | `skills/column-intake/` | DM 수신 → 파싱 → 저장 → QA 트리거 |
| column-qa | `skills/column-qa/` | **기존** — Step 4 GEO/AEO 추가 필요 |
| column-publish | `skills/column-publish/` | 승인 → 빌드 → git push → 알림 |
| author-manage | `skills/author-manage/` | 온보딩, 프로필, 신뢰도 관리 |

### 크론 (Crons)

| 크론 | 주기 | 설명 |
|------|------|------|
| submission-reminder | 매일 10:00 | QA 대기 중인 제출물 Jay에게 리마인더 |
| stale-check | 매주 월 09:00 | 7일 이상 미처리 제출물 알림 |
| trust-recalc | 매주 일 00:00 | 전체 author trust_level 재계산 |

### Heartbeat 체크

```
HEARTBEAT.md에 추가:
- [ ] pipeline/submissions/ 에 미처리 제출물 있는지 확인
- [ ] 승인 대기 중인 칼럼 Jay에게 리마인더
```

---

## 8. 데이터 스키마

### authors.json

```json
{
  "authors": [
    {
      "id": "jay",
      "discord_id": null,
      "name_en": "Jay",
      "name_ko": "Jay",
      "expertise": ["AI", "Crypto", "Product"],
      "image": "/members/jay.png",
      "trust_level": 2,
      "bio": "HypeProof Lab 운영자",
      "links": { "twitter": "@jaylee" },
      "submissions": [
        {
          "slug": "2026-02-10-era-of-the-chairman",
          "submitted": "2026-02-10",
          "published": "2026-02-10",
          "qa_score": 4.5,
          "revisions": 0
        }
      ],
      "joined": "2026-02-10"
    }
  ]
}
```

### Submission 메타데이터 (파일 헤더 주석)

```markdown
<!--
submission_id: sub-20260213-001
author_id: alice-kim
status: qa_pending | qa_passed | needs_revision | approved | published | rejected
submitted_at: 2026-02-13T18:00:00+09:00
qa_score: null
revision_count: 0
reviewer: null
-->
---
title: "..."
...
---
```

---

## 9. 리스크 & 완화

| 리스크 | 영향 | 완화 |
|--------|------|------|
| 스팸 제출 | 시간 낭비 | trust_level 0 = 월 2회 제출 제한 |
| QA 오탐 (좋은 글 거절) | Author 이탈 | QA는 advisory, Jay 최종 판단 |
| 자동 퍼블리시 사고 | 품질 하락 | 24시간 철회 기능, trust_level 2 기준 엄격 |
| Author 이미지 저작권 | 법적 리스크 | 온보딩 시 본인 이미지 확인 |
| 빌드 실패 | 배포 중단 | publish 전 빌드 검증 필수 |

---

## 10. 즉시 실행 가능한 다음 단계

1. **`pipeline/` 디렉토리 생성** + `authors.json` 초기화
2. **Discord 채널 3개 생성** (#column-submissions, #editorial, #author-announcements)
3. **column-intake 스킬 작성** (가장 핵심 — DM 수신/파싱)
4. **column-qa Step 4 추가** (GEO/AEO 체크)
5. **첫 파일럿**: Jay가 직접 DM으로 기존 칼럼 1개 제출해서 전체 플로우 테스트
