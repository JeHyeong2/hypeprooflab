# Writer Agent Spec — hypeproof-writer 스킬

> Creator가 자신의 OpenClaw 인스턴스에서 운영하는 작가 에이전트 스킬 스펙
> Version: 1.0 | Created: 2026-02-14

---

## 1. 개요

`hypeproof-writer`는 OpenClaw 스킬로, Creator의 에이전트가 HypeProof 콘텐츠 파이프라인에 자동으로 제출하고 Herald의 피드백을 수신/반영할 수 있게 한다.

### 핵심 기능
- 콘텐츠 작성 보조 (GEO 최적화 가이드)
- frontmatter 자동 생성 + 검증
- Discord `#content-pipeline`에 자동 제출
- Herald 피드백 수신 → 자동/반자동 수정 → 재제출
- 로컬 GEO QA 사전 채점 (제출 전 셀프체크)

---

## 2. 스킬 구조

```
skills/hypeproof-writer/
├── SKILL.md              # 스킬 설명 + 사용법
├── templates/
│   ├── column.md         # 칼럼 템플릿
│   ├── research.md       # 리서치 템플릿
│   └── tutorial.md       # 튜토리얼 템플릿
├── geo-checklist.md      # GEO 최적화 체크리스트
├── submission-protocol.md # 제출 프로토콜 상세
└── tools/
    └── geo_qa_local.py   # 로컬 GEO 채점 (선택)
```

---

## 3. 제출 프로토콜

### 3.1 메시지 형식

Writer Agent가 Discord `#content-pipeline`에 보내는 메시지:

```
SUBMIT: {"title":"제목","creator":"Creator명","date":"2026-02-14","category":"Column","tags":["AEO","AI"],"slug":"article-slug","readTime":"8 min","excerpt":"한줄 요약","creatorImage":"/members/jay.png"}
```

+ 첨부 파일:
1. `article.md` — 본문 (frontmatter 포함)
2. `process-log.md` — AI 대화 로그
3. `process-note.md` — 작성 과정 요약 (500자 이내)

### 3.2 Frontmatter 필수 필드

```yaml
---
title: "글 제목"
creator: "Creator 이름"
date: 2026-02-14
category: "Column"          # Column | Research | Tutorial
tags:
  - AEO
  - AI
slug: "article-slug"
readTime: "8 min"
excerpt: "한줄 요약 (SEO용)"
creatorImage: "/members/jay.png"
lang: "ko"                  # ko | en
---
```

> ⚠️ `author` 필드가 아닌 `creator` 필드를 사용한다. 기존 코드에서 `author`가 남아있는 경우 마이그레이션 필요.

### 3.3 유효성 검증 (로컬)

제출 전 Writer Agent가 자체 검증:

| 항목 | 검증 내용 | 실패 시 |
|------|----------|---------|
| frontmatter 필수 필드 | 9개 필드 모두 존재 | 제출 차단 |
| slug 형식 | `[a-z0-9-]+` | 자동 변환 |
| creatorImage 경로 | `/members/{name}.png` 형식 | 경고 |
| 본문 최소 길이 | 1,000자 이상 | 경고 |
| 인라인 인용 최소 | 3개 이상 | 경고 (GEO 감점 예고) |

---

## 4. GEO QA 연동

### 4.1 로컬 사전 채점

Writer Agent는 제출 전 로컬에서 GEO 점수를 사전 확인할 수 있다:

```python
# tools/geo_qa_local.py — geo_qa_score.py의 경량 버전
python3 geo_qa_local.py article.md
# → GEO Quality Score: 78/100
# → 💡 인라인 인용 2개 추가 시 +10점 예상
```

### 4.2 Herald 채점 결과 수신

Herald가 스레드에 답글로 보내는 형식:

```
🔔 GEO Quality Score: 82/100

📊 Breakdown:
  인라인 인용   20/25  ████░  (4개 감지, 5개면 만점)
  구조         18/20  █████  H2=4 H3=3 bullets=8
  테이블        5/10  ██░░░  (1개, 2개 권장)
  단어 수      15/15  █████  2,847 words
  통계/데이터   8/10  ████░  (4개 감지)
  Schema       10/10  █████  frontmatter ✓ date ✓ creator ✓
  Freshness     5/5   █████  date 메타데이터 있음
  키워드 스터핑  0/0   ✓      감지 안 됨
  가독성        1/5   █░░░░  avg_sentence_len=112

💡 개선 제안:
  • [가독성] 문장 평균 길이 112자 → 60자 이하로 분리 권장
  • [테이블] 핵심 데이터를 테이블로 정리하면 인용 확률 2.5배 ↑
  • [인라인 인용] 1개 추가하면 만점 (25/25)

✅ 70+ 통과 → Peer Review 큐 진입
```

---

## 5. Herald 피드백 수신 + 자동 수정

### 5.1 피드백 파싱

Writer Agent는 Herald의 스레드 답글을 파싱하여 구조화된 피드백을 추출:

```typescript
interface HeraldFeedback {
  geoScore: number;
  breakdown: { category: string; score: number; max: number; detail: string }[];
  suggestions: string[];
  status: 'passed' | 'rejected' | 'revision_requested';
}
```

### 5.2 자동 수정 전략

| 피드백 유형 | 자동 수정 가능? | 방법 |
|------------|----------------|------|
| 문장 길이 (가독성) | ✅ | 긴 문장 분리 |
| frontmatter 누락 | ✅ | 자동 생성 |
| 인라인 인용 부족 | ⚠️ 반자동 | Creator에게 출처 확인 후 삽입 |
| 테이블 추가 | ⚠️ 반자동 | 데이터 식별 → Creator 확인 |
| 키워드 스터핑 | ✅ | 동의어 대체 |
| 구조 개선 | ⚠️ 반자동 | H2/H3 제안 → Creator 확인 |

### 5.3 재제출 플로우

```
Herald 피드백 수신 → 파싱 → 자동 수정 적용
  → Creator에게 수정 내역 보고
  → Creator 확인/추가 수정
  → 재제출 (같은 스레드에 `RESUBMIT:` prefix)
```

재제출 메시지 형식:
```
RESUBMIT: {"submissionId":"20260214-abc123","changes":["가독성 개선: 12문장 분리","인라인 인용 1개 추가"]}
```

---

## 6. 창작물 제출

창작물 (소설/스토리)은 별도 프로토콜:

```
SUBMIT_CREATIVE: {"title":"작품 제목","persona":"CIPHER","creator":"Jay","genre":"SF","series":"SIMULACRA","episode":4}
```

+ 첨부:
1. `chapter.md` — 작품 본문
2. `process-log.md` — AI 대화 로그
3. `process-note.md` — 창작 과정 요약

> 창작물은 GEO QA 대신 페르소나 일관성 검증을 받는다.

---

## 7. 에이전트 SOUL 가이드라인

Writer Agent의 SOUL.md에 포함할 내용:

```markdown
## HypeProof Writer 역할
- AEO-First 콘텐츠 작성 보조
- GEO 최적화 체크리스트 항상 참조
- 제출 전 로컬 GEO 채점으로 70+ 확인
- Herald 피드백을 존중하고 신속히 반영

## 제출 규칙
- frontmatter 필수 필드 9개 반드시 포함
- `creator` 필드 사용 (`author` 금지)
- 프로세스 아카이브 (log + note) 반드시 포함
- 월 8편 상한 준수

## Herald과의 관계
- Herald은 전령관이자 품질 챔피언
- 피드백은 건설적 — 거부가 아닌 개선 기회
- 스레드 기반 소통 — 같은 스레드에서 대화 지속
```

---

## 8. 설치 가이드

```bash
# 1. 스킬 설치
openclaw skill install hypeproof-writer

# 2. Discord Bot 토큰 설정
openclaw config set HYPEPROOF_DISCORD_TOKEN="your-bot-token"

# 3. 채널 바인딩 확인
# openclaw.json에서 #content-pipeline 채널 ID 설정

# 4. 테스트 제출
openclaw run "hypeproof-writer를 사용해서 테스트 글을 #content-pipeline에 제출해줘"
```

---

*이 스펙은 SPEC.md Section H, HERALD-DESIGN.md, CONTENT-PIPELINE.md와 연계됩니다.*
