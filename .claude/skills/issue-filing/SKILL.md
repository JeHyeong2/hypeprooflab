---
name: issue-filing
description: Standardized issue filing skill shared by Mother (OpenClaw) and Claude Code. Defines triggers, templates, label rules, duplicate checks, and validation for creating GitHub Issues on jayleekr/hypeprooflab.
user_invocable: false
disable-model-invocation: false
---

# Issue Filing — Shared Issue Creation Standard

> Mother(OpenClaw)와 Claude Code가 공유하는 이슈 발행 전용 규칙.
> 누가 발행하든 동일한 트리거, 포맷, 라벨, 검증을 따른다.
> 라벨 체계와 워크플로우는 `issue-ops` 스킬을 따른다.

## Triggers

이슈를 발행해야 하는 상황 목록. 각 트리거는 자동(Mother/크론) 또는 수동(Jay/Creator) 발동.

| # | Trigger | Source | Priority |
|---|---------|--------|----------|
| T1 | Creator가 이슈 발행 요청 (Discord/대화) | Mother or Jay | high |
| T2 | Heartbeat 실패 감지 (빌드, 배포, 헬스체크) | Mother cron | high |
| T3 | `/roadmap` 리뷰 결과 → 액션 아이템 도출 | Claude Code | medium |
| T4 | Creator 48h+ 미응답 (넛지 후 자동 에스컬레이션) | Mother | medium |
| T5 | QA/리뷰 리포트에서 수정 필요 항목 발견 | issue-filer cron | high or medium |
| T6 | 콘텐츠 파이프라인 장애 (publish, deploy 실패) | Mother cron | high |

## Issue Templates

### Required Sections (모든 이슈 공통)

모든 이슈 body에 반드시 포함:

```markdown
## 배경
왜 이 이슈가 필요한가. 트리거 원인 명시.

## 작업 항목
- [ ] 구체적 TODO 1
- [ ] 구체적 TODO 2
- [ ] 검증: npm run build 통과

## 검증
어떻게 완료를 확인하는가. 최소 1개 검증 기준.

## Max Files
N (issue-solver가 변경 파일 수를 제한하는 데 사용)
```

### Type-Specific Templates

#### Bug

```markdown
Title: [bug] <short description>

## 배경
**URL/페이지**: (e.g., https://hypeproof-ai.xyz/columns/my-slug)
**현상**: 무엇이 깨졌는가
**기대 동작**: 정상적으로 어떻게 되어야 하는가

## 작업 항목
- [ ] 원인 파악
- [ ] 수정
- [ ] 검증: npm run build 통과

## 검증
- 해당 페이지/기능이 정상 동작

## Max Files
5
```

#### Enhancement

```markdown
Title: [feature] <short description>

## 배경
**문제**: 무엇이 부족하거나 불편한가
**제안**: 어떻게 해결할 것인가

## 작업 항목
- [ ] 설계
- [ ] 구현
- [ ] 검증: npm run build 통과

## 검증
- 새 기능이 의도대로 동작

## Max Files
5
```

#### Content

```markdown
Title: [content] <topic>

## 배경
**유형**: column / research / novel
**작성자**: (creator name)
**언어**: ko / en / both

## 작업 항목
- [ ] 콘텐츠 작성
- [ ] frontmatter 검증 (title, slug, date)
- [ ] 검증: npm run build 통과

## 검증
- 콘텐츠 페이지 정상 렌더링

## Max Files
5
```

#### Architecture / Skill

```markdown
Title: [arch] or [skill] <short description>

## 배경
왜 이 변경이 필요한가.

## 현재 상태
지금 어떻게 동작하는가. 파일 경로 포함.

## 목표 상태
변경 후 어떻게 되어야 하는가. 파일 경로 포함.

## 작업 항목
- [ ] 구체적 TODO
- [ ] 검증: npm run build 통과

## 검증
- 목표 상태 달성 여부

## Max Files
3
```

## Label Rules

issue-ops 라벨 체계를 따른다. 자동 선택 규칙:

### Required Labels (모든 이슈)

1. **`agent:claude-code`** — 필수. issue-solver 픽업 조건.
2. **Priority** — `priority:high` 또는 `priority:medium` 중 하나 필수.
3. **Type** — 하나 필수 (아래 매핑 참조).
4. **Area** — 하나 필수 (아래 매핑 참조).

### Type Auto-Selection

| Trigger / Keyword | Label |
|-------------------|-------|
| 빌드 실패, 404, 에러, 깨짐 | `bug` |
| 새 기능, 추가, 개선 | `enhancement` |
| 칼럼, 리서치, 소설 | `content` |
| 구조 변경, 마이그레이션 | `type:architecture` |
| 논의, 질문, 선택지 | `question` |
| 스킬, 에이전트, 파이프라인 | `enhancement` + `area:pipeline` |

### Area Auto-Selection

| File Path Pattern | Label |
|-------------------|-------|
| `web/src/` | `web` |
| `web/src/content/columns/` | `columns` |
| `web/src/content/novels/` or `novels/` | `novels` (if exists, else `web`) |
| `research/` | `research` |
| `scripts/gslides/` or `products/` | `deck` |
| `data/` | `area:data` |
| `.claude/` or `docs/` | `docs` |
| `.claude/skills/` or `.claude/agents/` | `area:pipeline` |

### Priority Auto-Selection

| Condition | Priority |
|-----------|----------|
| 빌드/배포 실패 (T2, T6) | `priority:high` |
| Creator 직접 요청 (T1) | `priority:high` |
| QA 리포트 수정 필요 (T5) | `priority:high` |
| Roadmap 액션 아이템 (T3) | `priority:medium` |
| 48h 미응답 에스컬레이션 (T4) | `priority:medium` |

## Duplicate Check

이슈 생성 전 반드시 중복 확인:

```bash
# 1. 같은 area의 오픈 이슈 확인
gh issue list --repo jayleekr/hypeprooflab \
  --label "area:TARGET_AREA" --state open \
  --json number,title,body --limit 20

# 2. 키워드로 검색 (제목 + 본문)
gh issue list --repo jayleekr/hypeprooflab \
  --state open --search "KEYWORD" \
  --json number,title --limit 10
```

**중복 판단 기준**:
- 같은 파일/기능에 대한 같은 종류의 요청 → 중복. 기존 이슈에 코멘트 추가.
- 같은 영역이지만 다른 문제 → 별도 이슈.
- 기존 이슈가 닫힌 상태 → 재발이면 새 이슈 (기존 번호 참조).

## Evidence Rules

이슈 발행 시 증거 첨부 규칙:

| Trigger | Required Evidence |
|---------|-------------------|
| 빌드 실패 (T2) | `npm run build` 에러 출력 (마지막 30줄) |
| 배포 실패 (T6) | `vercel --prod` 에러 출력 |
| 헬스체크 실패 (T2) | healthcheck 리포트 JSON 또는 요약 |
| QA 결과 (T5) | QA 리포트 요약 + 실패 항목 |
| Creator 요청 (T1) | 원문 인용 또는 요약 |
| Roadmap 리뷰 (T3) | 해당 액션 아이템 텍스트 |
| 48h 미응답 (T4) | 최초 요청 날짜 + 미응답 기간 |

증거는 코드블록으로 감싸서 가독성 유지.

## CLI Pattern

복붙 가능한 이슈 생성 패턴:

```bash
gh issue create \
  --repo jayleekr/hypeprooflab \
  --title "[TYPE_TAG] Short description" \
  --label "TYPE_LABEL,AREA_LABEL,agent:claude-code,priority:PRIORITY" \
  --body "$(cat <<'EOF'
> Filed on behalf of **CREATOR_NAME** (or "Auto-detected by SYSTEM")

## 배경
WHY_THIS_ISSUE

## 작업 항목
- [ ] TODO_1
- [ ] TODO_2
- [ ] 검증: npm run build 통과

## 검증
ACCEPTANCE_CRITERIA

## Max Files
N
EOF
)"
```

### Examples

```bash
# Bug from heartbeat failure
gh issue create \
  --repo jayleekr/hypeprooflab \
  --title "[bug] Build failure in columns content collection" \
  --label "bug,columns,agent:claude-code,priority:high" \
  --body "$(cat <<'EOF'
> Auto-detected by Mother heartbeat

## 배경
npm run build 실패. columns content collection에서 slug 파싱 에러 발생.

## 작업 항목
- [ ] 누락된 slug 필드 찾기
- [ ] frontmatter 수정
- [ ] 검증: npm run build 통과

## 검증
- cd web && npm run build 성공

## Max Files
3
EOF
)"

# Enhancement from roadmap review
gh issue create \
  --repo jayleekr/hypeprooflab \
  --title "[feature] Add member activity dashboard widget" \
  --label "enhancement,web,agent:claude-code,priority:medium" \
  --body "$(cat <<'EOF'
> From /roadmap review (2026-03-25)

## 배경
Q2 로드맵 액션: 멤버 활동 현황을 대시보드에 표시.

## 작업 항목
- [ ] 대시보드 위젯 컴포넌트 설계
- [ ] 구현
- [ ] 검증: npm run build 통과

## 검증
- /dashboard 페이지에 위젯 표시

## Max Files
5
EOF
)"
```

## Pre-Filing Validation

이슈 생성 직전 체크리스트:

1. **Labels exist?** — `gh label list --repo jayleekr/hypeprooflab` 으로 라벨 존재 확인. 없으면 생성하지 말고 경고.
2. **Duplicate?** — 위 Duplicate Check 실행 완료.
3. **Required sections?** — `## 배경`, `## 작업 항목`, `## 검증`, `## Max Files` 모두 포함.
4. **agent:claude-code label?** — 반드시 포함 (issue-solver 픽업 조건).
5. **Priority label?** — `priority:high` 또는 `priority:medium` 포함.
6. **Evidence attached?** — 트리거에 맞는 증거 첨부 확인.
7. **No secrets?** — API 키, 토큰, 비밀번호 미포함 확인.

## Cross-Reference

- **Label taxonomy**: `.claude/skills/issue-ops/SKILL.md`
- **Issue templates (human)**: `.github/ISSUE_GUIDE.md`
- **Issue resolver**: `.claude/skills/issue-solver/SKILL.md`
- **Issue auto-filer**: `.claude/skills/issue-filer/SKILL.md` (if exists)
