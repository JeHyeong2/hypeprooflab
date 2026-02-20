# hypeproof-writer

> HypeProof Lab 콘텐츠 파이프라인 작가 에이전트 스킬
> Version: 1.0 | Updated: 2026-02-20

Creator의 OpenClaw 인스턴스에서 실행되는 스킬. GEO 최적화 콘텐츠 작성을 보조하고, frontmatter 자동 생성, 로컬 QA, Discord `#content-pipeline` 제출, Herald 피드백 반영까지 전 과정을 지원한다.

---

## 빠른 시작

```bash
# 스킬 설치
openclaw skill install hypeproof-writer

# Discord Bot 토큰 설정
openclaw config set HYPEPROOF_DISCORD_TOKEN="your-bot-token"
openclaw config set HYPEPROOF_CHANNEL_ID="content-pipeline-channel-id"
openclaw config set HYPEPROOF_CREATOR_NAME="YourName"
openclaw config set HYPEPROOF_CREATOR_IMAGE="/members/yourname.png"

# 실행
openclaw run "hypeproof-writer로 [주제] 칼럼 작성해줘"
```

---

## 지원 명령

| 명령 | 설명 |
|------|------|
| `write column [주제]` | GEO 최적화 칼럼 작성 |
| `write research [주제]` | 리서치 문서 작성 |
| `write tutorial [주제]` | 튜토리얼 작성 |
| `check geo [파일]` | 로컬 GEO 점수 확인 |
| `submit [파일]` | #content-pipeline에 제출 |
| `resubmit [파일] [제출ID]` | Herald 피드백 반영 후 재제출 |
| `status` | 내 제출 현황 조회 |

---

## 작업 플로우

```
1. 작성 (템플릿 기반)
   ↓
2. GEO QA 로컬 채점 (tools/geo_qa_local.py)
   → 70점 미만: 개선 후 재채점
   → 70점 이상: 제출 가능
   ↓
3. Discord #content-pipeline 제출
   → article.md + process-log.md + process-note.md
   ↓
4. Herald GEO 자동채점 (24h 내)
   → 70 미만: 피드백 수신 → 자동/반자동 수정 → 재제출
   → 70 이상: Peer Review 큐 진입
   ↓
5. Peer Review (2명, 48h)
   ↓
6. Mother 최종 승인 → 발행
```

---

## frontmatter 규칙

**필수 필드 9개** (모두 없으면 제출 차단):

```yaml
---
title: "글 제목"
creator: "Creator 이름"          # ⚠️ author가 아닌 creator
date: 2026-02-20
category: "Column"               # Column | Research | Tutorial
tags:
  - AEO
  - AI
slug: "article-slug"             # 파일명과 일치
readTime: "8 min"
excerpt: "한줄 요약 (SEO용, 120자 이내)"
creatorImage: "/members/jay.png" # /members/{name}.png 형식
lang: "ko"                       # ko | en
---
```

> **절대 금지**: `author` 필드 사용. HypeProof에서 모든 작성자는 **Creator**다.

---

## GEO 점수 배점

| 항목 | 배점 | 달성 방법 |
|------|------|-----------|
| 인라인 인용 (신뢰 출처) | 25점 | 최소 3개, 5개면 만점 |
| 구조 (H2/H3 + bullets) | 20점 | H2 4개+, H3 3개+, bullets 8개+ |
| 테이블 | 10점 | 핵심 데이터를 표로 정리 |
| 단어 수 | 15점 | 2,000단어 이상 |
| 통계/데이터 | 10점 | 수치 포함 주장 4개+ |
| Schema-ready 구조 | 10점 | frontmatter 완전 포함 |
| Freshness 메타데이터 | 5점 | date 필드 있으면 자동 |
| 가독성/유창성 | 5점 | 평균 문장 60자 이하 |
| 키워드 스터핑 (감점) | -10점 | 자연스러운 키워드 사용 |

**임계값**: 70+ → 제출 가능 / 90+ → Fast-track

---

## 프로세스 아카이브

제출 시 3개 파일 필수:

| 파일 | 내용 | 분량 |
|------|------|------|
| `article.md` | 본문 (frontmatter 포함) | 2,000자+ |
| `process-log.md` | AI와의 대화 전체 로그 | 제한 없음 |
| `process-note.md` | 작성 과정 요약 | 500자 이내 |

---

## 스킬 파일 구조

```
skills/hypeproof-writer/
├── SKILL.md                  # 이 파일
├── templates/
│   ├── column.md             # 칼럼 템플릿
│   ├── research.md           # 리서치 템플릿
│   └── tutorial.md           # 튜토리얼 템플릿
├── geo-checklist.md          # GEO 최적화 체크리스트
├── submission-protocol.md    # 제출 프로토콜 상세
└── tools/
    └── geo_qa_local.py       # 로컬 GEO 채점 스크립트
```

---

## Herald 피드백 루프

Herald가 스레드에 채점 결과를 보내면:

1. **자동 수정 가능**: 문장 길이, frontmatter 누락, 키워드 스터핑
2. **반자동 (Creator 확인 필요)**: 인라인 인용 추가, 테이블 삽입, 구조 개선
3. **재제출**: 같은 스레드에 `RESUBMIT:` prefix로 전송

```
RESUBMIT: {"submissionId":"20260220-abc123","changes":["가독성 개선: 8문장 분리","인라인 인용 1개 추가"]}
```

---

## 월 제한

- Creator당 **월 8편** 상한
- 초과 제출 시 Herald가 자동으로 안내

---

*관련 문서: `geo-checklist.md`, `submission-protocol.md`, `tools/geo_qa_local.py`*
*커뮤니티 스펙: `community/SPEC.md`, `community/WRITER-AGENT-SPEC.md`*
