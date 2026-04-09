---
name: team-announce
description: Generate team announcements and individual DMs from context changes. Reads ROLES.md, OKR, roadmap, auto-formats for 카톡/Discord, fact-checks against repo state.
user_invocable: true
triggers:
  - "announce team"
  - "team announce"
  - "공지"
  - "DM"
---

## Purpose

Jay가 "뭐가 바뀌었는지" + "누구한테 보낼지" 입력하면, repo 컨텍스트를 자동 수집해서 공지 + 개인 DM 초안을 생성하고 fact check까지 완료.

## Jay's Role (3 inputs only)

1. **변경 사항** — 한 줄 또는 자유 형식 ("역할 재정비, OKR 받음, CI/CD 만듦")
2. **대상** — "전체", "제형이만", "JY + Ryan", "개별 DM 전부" 등
3. **최종 확인** — 초안 보고 승인 또는 수정 지시

## Pipeline

### Phase 1: Context Gather

Read these files to build context:

```
ROLES.md                              — 역할 구조
docs/okr/2026-Q2-individual.md        — 개인 OKR + 타임라인
docs/okr/collaboration-matrix.md      — 협업 매트릭스
products/hypeproof-roadmap-2026Q2.md  — 로드맵
data/members.json                     — 멤버 데이터
```

### Phase 2: Draft

For each target audience, generate a message block:

**전체 공지** (if requested):
- 변경 사항 요약 (번호 매기기)
- 관련 문서 GitHub URL 링크
- Q2 주요 일정 (OKR 타임라인에서 추출)

**개인 DM** (if requested):
- OKR 확인 멘트
- 해당 멤버의 다음 일정 (타임라인에서 추출)
- 서포트 관계 (collaboration-matrix.md에서 추출)
- 관련 문서 GitHub URL 링크
- 산출물 리마인드

### Phase 3: Validation

1. **GitHub URL 검증** — 모든 파일 경로를 `https://github.com/jayleekr/hypeprooflab/blob/main/` 로 변환. Glob으로 파일 존재 확인.
2. **시크릿 스캔** — 메시지에 API key, token, secret, password 패턴 없는지 grep
3. **Fact check** — 메시지의 날짜/역할/OKR 내용이 실제 문서와 일치하는지 교차 검증
4. **톤 검수** — 존댓말 통일 (반말 패턴 감지: ~해, ~줘, ~봐 → ~해주세요, ~주세요, ~봐주세요)
5. **번호 중복** — 이모지 번호(1️⃣2️⃣...) 순서 검증

### Phase 4: Save & Confirm

1. `docs/announcements/YYYY-MM-DD-<topic>.txt` 에 저장
2. Jay에게 AskUserQuestion으로 초안 보여주기
3. 승인 시 커밋

## Output Format

```
========================================
[대상 — 채널]
========================================

메시지 본문
(GitHub URL 포함, 존댓말, 시크릿 없음)
```

## Rules

- **시크릿 절대 포함 금지** — env var 값, token, key는 "별도 채널로 전달" 처리
- **파일 경로는 반드시 GitHub URL로** — 카톡에서 클릭 가능해야 함
- **존댓말 통일** — 팀 전체 공지와 개인 DM 모두
- **이전 공지 참고** — `docs/announcements/` 디렉토리의 기존 파일 톤/형식 따르기
- **fact check는 skip 불가** — 반드시 repo 상태와 교차 검증 후 저장
