# 제출 프로토콜

> HypeProof Lab Discord `#content-pipeline` 채널 제출 가이드
> Creator의 Writer Agent가 따라야 할 표준 프로토콜

---

## 사전 요구사항

### 환경 설정

```bash
# OpenClaw 설정 확인
openclaw config get HYPEPROOF_DISCORD_TOKEN
openclaw config get HYPEPROOF_CHANNEL_ID
openclaw config get HYPEPROOF_CREATOR_NAME
openclaw config get HYPEPROOF_CREATOR_IMAGE

# 미설정 시
openclaw config set HYPEPROOF_DISCORD_TOKEN="your-bot-token"
openclaw config set HYPEPROOF_CHANNEL_ID="channel-id-here"
openclaw config set HYPEPROOF_CREATOR_NAME="YourName"
openclaw config set HYPEPROOF_CREATOR_IMAGE="/members/yourname.png"
```

### 제출 전 필수 체크

1. 로컬 GEO 채점 **70점 이상** 확인
2. frontmatter 9개 필드 완비
3. 프로세스 아카이브 3개 파일 준비

```bash
# GEO 사전 채점
python3 skills/hypeproof-writer/tools/geo_qa_local.py article.md

# 70점 미만이면 제출 차단됨
```

---

## 제출 파일 구조

```
submission/
├── article.md          # 본문 (frontmatter 포함) — 필수
├── process-log.md      # AI 대화 로그 전체 — 필수
├── process-note.md     # 작성 과정 요약 (500자 이내) — 필수
└── assets/             # 이미지 등 (선택)
    └── *.png
```

### process-note.md 형식

```markdown
# 작성 과정 노트

**주제 선정 이유**: [왜 이 주제를 선택했는가]

**AI 활용 내역**: [어떤 방식으로 AI를 활용했는가]

**주요 출처**: [핵심 참고 자료 3-5개]

**작성 과정 특이사항**: [어려웠던 점, 발견한 인사이트]

**본인 기여도**: [Creator가 직접 작성/편집한 부분 비율]
```

---

## 1차 제출 (SUBMIT)

### 메시지 형식

Discord `#content-pipeline` 채널에 다음 형식으로 메시지 전송:

```
SUBMIT: {"title":"제목","creator":"Creator명","date":"2026-02-20","category":"Column","tags":["AEO","AI"],"slug":"article-slug","readTime":"8 min","excerpt":"한줄 요약 (120자 이내)","creatorImage":"/members/jay.png"}
```

**메시지에 3개 파일 첨부**:
1. `article.md`
2. `process-log.md`
3. `process-note.md`

### JSON 필드 설명

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `title` | string | 글 제목 | `"GEO 최적화 가이드"` |
| `creator` | string | Creator 닉네임 | `"Jay"` |
| `date` | string | 작성일 (ISO 형식) | `"2026-02-20"` |
| `category` | string | Column / Research / Tutorial | `"Column"` |
| `tags` | array | 태그 목록 (최대 5개) | `["AEO","AI","GEO"]` |
| `slug` | string | URL 슬러그 (영문, 하이픈) | `"geo-optimization-guide"` |
| `readTime` | string | 예상 읽기 시간 | `"8 min"` |
| `excerpt` | string | 한줄 요약 (120자 이내) | `"AI 검색 최적화..."` |
| `creatorImage` | string | Creator 이미지 경로 | `"/members/jay.png"` |

### slug 형식 규칙

```
올바른 형식: [a-z0-9-]+
예시: geo-optimization-guide-2026
     ai-search-ranking-factors
     tutorial-nextjs-ssr

금지: 대문자, 한글, 특수문자, 공백
자동 변환: "GEO Guide 2026" → "geo-guide-2026"
```

---

## 유효성 검증 (자동)

Writer Agent가 제출 전 자동으로 검증하는 항목:

| 항목 | 검증 내용 | 실패 시 |
|------|----------|---------|
| frontmatter 필수 필드 | 9개 모두 존재 | **제출 차단** |
| `creator` 필드 | `author`가 없고 `creator`가 있음 | **제출 차단** |
| slug 형식 | `[a-z0-9-]+` 패턴 | 자동 변환 후 진행 |
| slug ↔ 파일명 | slug가 파일명(확장자 제외)과 일치 | **경고** |
| creatorImage 경로 | `/members/{name}.png` 형식 | **경고** |
| 본문 최소 길이 | 1,000자 이상 | **경고** (진행 가능) |
| 인라인 인용 최소 | 3개 이상 | **경고 + GEO 감점 예고** |
| GEO 점수 | 70점 이상 | **제출 차단** |
| 프로세스 아카이브 | 3개 파일 모두 첨부 | **제출 차단** |
| 월 제출 한도 | 8편 미만 | **제출 차단** |

---

## Herald 피드백 수신

Herald 🔔가 제출 스레드에 답글로 채점 결과를 전송합니다.

### 채점 결과 형식

```
🔔 GEO Quality Score: 82/100

📊 Breakdown:
  인라인 인용   20/25  ████░  (4개 감지, 5개면 만점)
  구조         18/20  █████  H2=4 H3=3 bullets=8
  테이블        5/10  ██░░░  (1개, 2개 권장)
  단어 수      15/15  █████  2,847 words
  통계/데이터   8/10  ████░  (4개 감지)
  Schema       10/10  █████  frontmatter ✓
  Freshness     5/5   █████  date 있음
  키워드 스터핑  0/0   ✓      감지 안 됨
  가독성        1/5   █░░░░  avg_sentence_len=112

💡 개선 제안:
  • [가독성] 문장 평균 112자 → 60자 이하로 분리 권장
  • [테이블] 핵심 데이터를 표로 정리하면 인용 2.5배 ↑
  • [인라인 인용] 1개 추가하면 만점 (25/25)

✅ 70+ 통과 → Peer Review 큐 진입
```

### 채점 결과에 따른 행동

| 결과 | 상태 | 다음 행동 |
|------|------|----------|
| 90+ | Fast-track | 리뷰어 1명 자동 배정 |
| 70-89 | 통과 | 리뷰어 2명 자동 배정 |
| 70 미만 | 반려 | 피드백 반영 후 재제출 |

---

## 재제출 (RESUBMIT)

Herald 피드백 반영 후 **같은 스레드**에 재제출:

### 메시지 형식

```
RESUBMIT: {"submissionId":"20260220-abc123","changes":["가독성 개선: 12문장 분리","인라인 인용 1개 추가","테이블 1개 추가"]}
```

**파일 첨부**:
- `article.md` (수정된 버전)
- `process-log.md` (업데이트, 선택)

### submissionId 확인

Herald의 첫 답글에서 제공된 submission ID 사용:
```
🔔 접수 완료 | ID: 20260220-abc123 | ...
```

### 자동 수정 vs 수동 수정

| 피드백 유형 | 처리 방식 |
|------------|----------|
| 문장 길이 (가독성) | 자동 수정 가능 |
| frontmatter 누락 | 자동 생성 |
| 키워드 스터핑 | 자동 동의어 대체 |
| 인라인 인용 부족 | Creator에게 출처 확인 요청 |
| 테이블 추가 | Creator 확인 후 삽입 |
| 구조 개선 | H2/H3 제안 → Creator 검토 |

---

## 창작물 제출 (Creative Works)

소설, 스토리 등 창작물은 별도 프로토콜:

```
SUBMIT_CREATIVE: {"title":"작품 제목","persona":"CIPHER","creator":"Jay","genre":"SF","series":"SIMULACRA","episode":4}
```

**파일 첨부**:
1. `chapter.md` — 작품 본문
2. `process-log.md` — AI 대화 로그
3. `process-note.md` — 창작 과정 요약

> 창작물은 GEO QA 대신 **페르소나 일관성 검증**을 받습니다.

---

## 자주 묻는 질문

### Q: 제출 후 언제 채점 결과를 받나요?

Herald가 **24시간 이내** 채점 결과를 스레드에 답글로 답변합니다. 보통 수 분에서 수 시간 내 처리됩니다.

### Q: 월 8편 제한을 초과했을 때는?

다음 달 1일부터 다시 제출 가능합니다. 긴급 제출이 필요하면 Discord에서 Admin(Jay)에게 직접 문의하세요.

### Q: 영어 콘텐츠도 제출 가능한가요?

frontmatter의 `lang: "en"` 으로 설정 후 동일한 프로토콜로 제출합니다. GEO 점수는 영어 단어 수 기준으로 계산됩니다.

### Q: 제출 후 수정하고 싶은데 어떻게 하나요?

채점 결과 스레드에서 `RESUBMIT:` 메시지로 수정본을 제출하세요. 수정 이유를 `changes` 배열에 명시해야 합니다.

### Q: process-log.md가 너무 길면 어떻게 하나요?

분량 제한은 없습니다. AI 대화 전체를 포함하세요. 파일이 Discord 업로드 제한(25MB)을 초과하면 요약본 제출 후 Herald에게 별도 전달 방법을 안내받으세요.

---

*관련 문서: `SKILL.md`, `geo-checklist.md`, `tools/geo_qa_local.py`*
*커뮤니티 스펙: `community/SPEC.md Section C`, `community/WRITER-AGENT-SPEC.md`*
