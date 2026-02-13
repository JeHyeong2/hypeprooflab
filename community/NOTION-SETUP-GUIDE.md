# Notion DB 구축 가이드

> HypeProof Lab의 커뮤니티 데이터를 Notion에서 관리하기 위한 단계별 가이드

---

## 1. Members DB

SPEC.md Section A 기준. 멤버 관리의 핵심 데이터베이스.

### 생성 방법

1. Notion에서 **New Page** → **Database - Full page** 선택
2. 제목: `Members`
3. 아래 필드를 순서대로 추가:

| 필드명 | 타입 | 필수 | 설정 |
|--------|------|------|------|
| Name | Title (기본) | ✅ | — |
| Discord ID | Text | ✅ | — |
| Domain | Select | ✅ | 옵션: `Tech`, `Marketing`, `Contents`, `Research`, `AI Engineering`, `Physics`, `Engineering`, `Management` |
| Referred By | Relation | ✅ | → Members DB 자기참조 |
| Join Date | Date | ✅ | — |
| Role | Select | ✅ | 옵션: `Admin`, `Creator`, `Spectator` |
| Points | Number | ✅ | 기본값 0 |
| Articles Published | Number | Auto | — |
| Reviews Done | Number | Auto | — |
| GEO Avg Score | Number | Auto | — |
| Status | Select | ✅ | 옵션: `Active`, `Inactive`, `Suspended` |
| AI Personas | Relation | Auto | → AI Personas DB |
| Email | Email | ❌ | 선택 입력 |

### 초기 데이터 입력

| Name | Discord ID | Domain | Role | Join Date | Points | Status |
|------|-----------|--------|------|-----------|--------|--------|
| Jay (이재원) | TBD | Tech / Lead | Admin | 2026-02-11 | 0 | Active |
| Kiwon (남기원) | TBD | Marketing / Strategy | Creator | 2026-02-11 | 0 | Active |
| TJ (강태진) | TBD | Contents / Media Production | Creator | 2026-02-11 | 0 | Active |
| Ryan (김지웅) | TBD | Research / Data Analysis | Creator | 2026-02-11 | 0 | Active |
| JY (신진용) | TBD | Research / AI Engineering | Creator | 2026-02-11 | 0 | Active |
| BH (태봉호) | TBD | Particle Physics / Data Analysis | Creator | 2026-02-11 | 0 | Active |
| Sebastian | TBD | Engineering / Management | Creator | 2026-02-11 | 0 | Active |

> **Referred By**: 창립 멤버이므로 비워둠. 이후 가입자부터 추천인 기록.

---

## 2. AI Personas DB

SPEC.md Section E 기준. AI 작가 페르소나 관리용.

### 생성 방법

1. **New Page** → **Database - Full page**
2. 제목: `AI Personas`
3. 필드 구성:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| Persona Name | Title (기본) | ✅ | 예: CIPHER |
| Creator | Relation | ✅ | → Members DB |
| Genres | Multi-select | ✅ | SF, 디스토피아, 스릴러, 철학적 픽션 등 |
| Tone | Text | ✅ | 예: "건조하고 간결" |
| POV | Select | ✅ | 옵션: `1인칭`, `3인칭 제한`, `3인칭 전지`, `2인칭` |
| Bilingual | Checkbox | ✅ | KO/EN 이중언어 여부 |
| Influences | Text | ❌ | 영향받은 작가/작품 |
| Themes | Text | ✅ | 반복 주제 |
| Voice Summary | Text | ✅ | 페르소나 영혼 한 줄 |
| Avatar URL | URL | ✅ | 아바타 이미지 경로 |
| YAML Path | Text | ✅ | 예: `novels/authors/cipher.yaml` |
| Works Count | Number | Auto | 등록된 작품 수 |
| Status | Select | ✅ | 옵션: `Active`, `Archived` |
| Registered Date | Date | ✅ | — |

### 초기 데이터

| Persona Name | Creator | Genres | Status |
|-------------|---------|--------|--------|
| CIPHER | Jay (이재원) | SF, 디스토피아 스릴러, 철학적 픽션, 테크 느와르 | Active |

> 다른 Creator들의 페르소나는 등록 시 추가.

---

## 3. Points Ledger DB

포인트 이력 추적용. 모든 적립/소각 기록.

### 생성 방법

1. **New Page** → **Database - Full page**
2. 제목: `Points Ledger`
3. 필드 구성:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| Transaction | Title (기본) | ✅ | 거래 설명 (예: "글 발행: AI 트렌드 분석") |
| Member | Relation | ✅ | → Members DB |
| Amount | Number | ✅ | +면 적립, -면 소각 |
| Type | Select | ✅ | 옵션: `Article`, `Creative`, `Review`, `Referral`, `Impact Bonus`, `Redemption` |
| Date | Date | ✅ | 거래일 |
| Reference | Text | ❌ | 관련 글 제목/링크 |
| GEO Score | Number | ❌ | 해당 글의 GEO 점수 (Article 타입일 때) |
| Balance After | Number | Auto | 거래 후 잔액 |
| Notes | Text | ❌ | 메모 |

### 포인트 산정 기준 (SPEC.md Section F)

| 활동 | 포인트 | 조건 |
|------|--------|------|
| 글 발행 (칼럼/리서치) | 100 + (GEO - 70) × 3 | GEO 70+ |
| 창작물 발행 | 100 + (일관성 - 70) × 2 | 리뷰 통과 |
| Peer Review | 30 | 300자+ 피드백 |
| Impact 보너스 | 변동 | 30일 후 측정 |
| Creator Referral | 50 | 온보딩 완료 시 |

### 사용 (소각)

| 아이템 | 포인트 |
|--------|--------|
| Claude Code Max 1개월 | 2,200P |

---

## 4. 설정 팁

### Views 추천

**Members DB:**
- **Table View** (기본): 전체 멤버 목록
- **Board View**: Role별 칸반 (Admin / Creator / Spectator)
- **Gallery View**: 아바타 + 이름 카드

**Points Ledger:**
- **Table View** (기본): 전체 이력
- **Board View**: Type별 분류
- **Calendar View**: 날짜별 거래 확인
- **Filtered View**: 멤버별 필터 (각 멤버의 이력만 보기)

### Relation 연결 순서

1. Members DB 먼저 생성
2. AI Personas DB 생성 → Members DB와 Relation 연결
3. Points Ledger DB 생성 → Members DB와 Relation 연결
4. Members DB로 돌아가서 AI Personas Relation 필드 확인

### 권한 설정

- **Workspace**: Admin(Jay)만 편집 가능
- **Share**: Creator에게 읽기 전용 공유 (필요 시)
- **Public**: 비공개 유지

---

*이 가이드는 SPEC.md v1.0 기준으로 작성됨. 스펙 변경 시 DB 구조도 업데이트 필요.*
