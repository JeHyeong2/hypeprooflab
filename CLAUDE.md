# CLAUDE.md — HypeProof 프로젝트 지침

> 이 파일은 모든 에이전트(서브에이전트 포함)가 HypeProof 작업 전 반드시 읽어야 하는 최상위 규칙이다.

## 프로젝트 구조
```
hypeproof/
├── web/                    # Next.js 웹사이트 (Vercel 배포)
├── novels/                 # 소설 원본 (집필용)
│   ├── authors/            # 작가 페르소나 YAML
│   ├── designs/            # 마스터 프롬프트, 설계 문서
│   └── simulacra/          # SIMULACRA 시리즈
├── scripts/gslides/        # Generic Google Slides toolkit
├── scripts/headless/       # Mother → Claude Code headless 스크립트
├── products/               # Deck projects (각각 deck.yaml 보유)
├── research/               # 리서치 콘텐츠
├── education/              # 교육 프로그램
├── AGENTS.md               # Agent 팀 구성 및 파견 가이드
└── PHILOSOPHY.md           # HypeProof Lab 철학
```

## 배포
- **Vercel**: Git 미연결 → `cd web && vercel --prod --yes` CLI 전용
- **도메인**: https://hypeproof-ai.xyz

---

## ✅ DO

### 콘텐츠
- 소설 원본(`novels/`)과 웹 버전(`web/src/content/novels/ko/`) **둘 다** 만들어라
- 웹 버전 frontmatter 필수 필드: `title`, `author`, `date`, `slug`, `series`, `volume`, `chapter`, `authorImage`, `excerpt`
- `slug` 값은 **파일명과 반드시 일치** (예: `simulacra-vol1-ch06.md` → `slug: "simulacra-vol1-ch06"`)
- 소설 집필 후 반드시 summary 파일도 작성 (`summary-{NN}.md`)
- 이전 챕터 summary를 **반드시** 읽고 연속성 확인 후 집필

### 빌드 & 배포
- 코드 변경 후 반드시 `npm run build` 통과 확인
- 빌드 실패 시 **절대 배포하지 마라**
- 의심되면 `.next` 삭제 후 클린 빌드: `rm -rf .next && npm run build`

### 데이터
- 챕터 수, 시리즈 수 등은 **콘텐츠 파일에서 동적으로** 계산 (하드코딩 금지)
- 이미지 경로는 `public/` 기준 절대경로 사용 (`/authors/cipher.png`)

### 검증
- 배포 전 `hypeproof-deploy` 스킬의 Content Integrity Check 실행
- 소설 집필 후 QA Review Agent로 디자인 문서 대조 검증

---

## ❌ DO NOT

### 파일 수정
- **`sed`로 YAML/frontmatter 수정하지 마라** → 줄바꿈 깨짐. 파일 전체 재생성하라
- **`sed`로 JSX/TSX 파일 수정하지 마라** → 닫는 태그 삭제됨. `Edit` 도구 사용하라
- grep + sed 조합으로 다중 파일 일괄 수정하지 마라 → 한 파일씩 Edit 도구로

### 콘텐츠
- **`aiModel` 필드를 UI에 표시하지 마라** — frontmatter에 남겨도 되지만 렌더링 금지
- 챕터 수를 하드코딩하지 마라 (2 → 5 같은 수동 변경 반복하게 됨)
- 원본만 쓰고 웹 버전 생성을 빠뜨리지 마라
- `authorImage`에 `/members/jay.png` 쓰지 마라 → CIPHER는 `/authors/cipher.png`

### 빌드
- 로컬 빌드 캐시를 맹신하지 마라 (캐시 때문에 통과한 것처럼 보일 수 있음)
- 빌드 실패 상태에서 배포하지 마라
- TypeScript 에러를 무시하지 마라

### 배포
- `git push`로 배포하지 마라 (Git 미연결)
- 배포 후 라이브 URL 확인 없이 "완료"라 하지 마라

---

## 🔧 자주 발생하는 빌드 에러

| 에러 | 원인 | 해결 |
|------|------|------|
| `slug was not provided as a string` | frontmatter에 `slug:` 누락 | slug 필드 추가, 파일명과 일치시키기 |
| `Expected '</', got 'jsx text'` | sed가 JSX 닫는 태그 삭제 | git checkout 또는 수동 복원 |
| `Failed to collect page data` | frontmatter 파싱 실패 | YAML 문법 확인, 특수문자 이스케이프 |
| Vercel 빌드 실패 (로컬 성공) | 캐시 차이 | `rm -rf .next && npm run build` |

---

---

## 📝 콘텐츠 운영 (Content Nudge System)

### 핵심 파일
- `members.md` — 크리에이터 7명 프로필 (전공, 직함, Discord)
- `PHILOSOPHY.md` — HypeProof Lab 철학 (칼럼 톤 참고)
- `research/daily/` — Daily Research 원본 (칼럼 소스)
- `web/src/content/columns/ko/` — 발행된 칼럼 (12편, 마지막 2/14)
- `research/templates/` — 리서치 템플릿

### 크리에이터 (넛지 대상, 우선순위순)
| 이름 | 전공 | 넛지 포인트 |
|------|------|------------|
| JY (신진용) | AI/ML Engineer, 퀀트, 물리 | AI코딩, Claude Code — 글쓰기 의지 높음 |
| Ryan (김지웅) | CERN 물리 Ph.D, 퀀트리서처 | 데이터분석, AI교육 — 제안서 경험 |
| Kiwon (남기원) | 글로벌 마케팅, GWU 심리학 | 마케팅 관점의 AI 분석 |
| TJ (강태진) | 미디어/영상, 前 창업자 | 콘텐츠 제작 워크플로우 |
| BH (태봉호) | CERN CMS 실험물리 박사과정 | 양자/물리 토픽에 전문성 |
| Sebastian | 실리콘밸리 EM | Discord 미가입, 보류 |

### 칼럼 작성 → 맨션 질문 워크플로우
1. Daily Research (`research/daily/`)에서 칼럼 후보 선정
2. `research-columnist` 스킬로 칼럼 작성
3. `web/src/content/columns/ko/<slug>.md` + `en/<slug>.md` 생성
4. frontmatter: title, creator, date, category, tags, slug, readTime, excerpt, creatorImage (`/members/jay.png`)
5. `cd web && npm run build` 통과 확인
6. `cd web && vercel --prod --yes` 배포
7. #daily-research에 포스팅
8. **크리에이터 맨션 질문** — 칼럼 키워드 ↔ 크리에이터 전공 매칭, 2~3명에게 구체적 질문

### 맨션 질문 규칙
- **구체적 질문만** — "어떻게 생각하세요?" 금지
- **전공 기반** — 그 사람만 답할 수 있는 질문
- **로테이션** — 같은 사람 연속 맨션 금지 (최소 2일 간격)
- **리액션 DB**: Mother workspace `memory/hypeproof-creators.json`에 추적

### Discord 채널
- `#daily-research` (1468135779271180502) — 칼럼 + 리서치 포스팅
- `#content-pipeline` (1471863670718857247) — Herald 관할, 제출/리뷰
- `#인사이트-공유` (1463019098685571257) — 자유 공유
- `#잡담` (1458325093871521895) — 일반 대화

---

---

## 🎫 GitHub Issue Management

Repo: `jayleekr/hypeprooflab` — Issues enabled, guide at `.github/ISSUE_GUIDE.md`.

### Labels

Every issue gets **one type + one area** label.

**Type**: `bug` | `content` | `feature` | `question` | `infra`
**Area**: `web` | `columns` | `novels` | `research` | `deck` | `docs`

### Issue Templates

| Type | Title format | Required fields |
|------|-------------|-----------------|
| Bug | `[bug] <description>` | URL/page, what happened, what expected, screenshot |
| Content | `[content] <topic>` | type (column/research/novel), author, language, outline |
| Feature | `[feature] <description>` | problem, proposed solution, affected area |
| Question | `[question] <topic>` | context, options, who should weigh in |

### Creator → Expertise Routing

| Creator | Route these issues |
|---------|-------------------|
| JY (신진용) | AI feature design, model integration, coding workflow |
| Ryan (김지웅) | Data pipelines, analytics, research methodology |
| Kiwon (남기원) | UX copy, audience strategy, growth features |
| TJ (강태진) | Video/media features, content workflow, creator tools |
| BH (태봉호) | Physics-domain content accuracy, data analysis |
| Sebastian | Architecture decisions, scalability, eng process |

### Agent Rules for Issue Creation

- Prefix title with bracket tag: `[bug]`, `[content]`, `[feature]`, `[question]`, `[infra]`
- Add `> Filed on behalf of **{creator}**` when filing for someone
- Link files with repo-relative paths
- Cross-reference with `#N` syntax
- **Don't auto-assign** — Jay (admin) triages

```bash
gh issue create \
  --repo jayleekr/hypeprooflab \
  --title "[bug] Column page 404 for published slug" \
  --label "bug,columns" \
  --body "$(cat <<'EOF'
> Filed on behalf of **JY**

**URL**: https://hypeproof-ai.xyz/columns/my-slug
**What happened**: Page returns 404 despite file existing
**What I expected**: Column renders normally
EOF
)"
```

### Workflow

```
Creator spots issue → files GitHub Issue
  → Jay triages (label + assign)
  → Agent or Jay implements
  → Commit references #N
  → Close on merge/deploy
```

---

## 📊 Deck Generation System (`/deck`)

Generic Google Slides generation system. Each project has a `deck.yaml` config.

### 파이프라인
```
deck.yaml + SPEC.md
  → [slide-planner] → slide-plan.json
  → [content-writer] → slide-content.json
  → [gslides-builder] → Google Slides
  → [deck-qa] → QA Report
  → [deck-capture] → output/screenshots/s01-sNN.png
  → [deck-critic] → feedback.json (screenshot-based visual review)
  → export → .pptx
```

### 라이브러리
```
scripts/gslides/              ← Generic toolkit
  grid.py                     ← emu(), margins, col2/3/4, font tokens
  themes.py                   ← Theme class + navy-coral preset
  primitives.py               ← tb, rect, card, rrect, section_header
  api_client.py               ← OAuth + create + batch update + generate()
  auth.py                     ← Google OAuth helper
  export_pptx.py              ← Google Slides → .pptx
  validate.py                 ← Text constraint checker
  lint_typography.py           ← tb() overflow detector
```

### 프로젝트: AI Architect Academy
```
products/ai-architect-academy/
  deck.yaml                   ← Project config (theme, audience, limits)
  slides.py                   ← s01-s09 builders (imports from scripts/gslides/)
  SPEC.md                     ← Content source (read-only)
  output/                     ← Generated artifacts
```

### 명령어
| 명령 | 동작 |
|------|------|
| `/deck generate <dir>` | 전체 파이프라인: SPEC → Google Slides → QA |
| `/deck review <dir>` | 슬라이드 비평 → feedback.json |
| `/deck fix <dir>` | 피드백 반영 → 재생성 |
| `/deck refine [score] [max] <dir>` | review→fix 루프 |
| `/deck lint <dir>` | 타이포그래피 오버플로 검사 |
| `/deck sync <dir>` | slide-content.json부터 재생성 |
| `/deck export <dir>` | Google Slides → .pptx |
| `/deck setup` | OAuth 인증 설정 |
| `/proposal <subcmd>` | → `/deck <subcmd> products/ai-architect-academy` (redirect) |

### 에이전트
| Agent | 역할 | Model |
|-------|------|-------|
| `deck-orchestrator` | 파이프라인 총괄 (generic) | sonnet |
| `slide-planner` | SPEC → slide-plan.json | sonnet |
| `content-writer` | 구조 → 텍스트 최적화 | sonnet |
| `gslides-builder` | Google Slides API 실행 | sonnet |
| `deck-qa` | 텍스트 제약/완성도 검증 | haiku |
| `deck-capture` | 슬라이드 스크린샷 캡처 (Chrome) | haiku |
| `deck-critic` | 스크린샷 기반 시각 비평 (적대적) | opus |

### 규칙
- **SPEC.md는 읽기 전용** — 생성 중 절대 수정하지 마라
- **deck.yaml 먼저 읽어라** — 프로젝트 설정을 모르면 작업하지 마라
- **Progress.md 먼저 읽어라** (있는 경우) — 현재 상태 파악
- **텍스트 제약은 deck.yaml의 text_limits** — 하드 리밋
- **slides.py를 직접 수정하지 마라** — 콘텐츠 변경은 slide-content.json으로
- **OAuth 토큰**: `~/.cm-tracker/config/` — 절대 커밋하지 마라

### 새 프로젝트 추가 방법
1. `products/new-project/deck.yaml` — 10줄 설정
2. `products/new-project/SPEC.md` — 콘텐츠 원본
3. `products/new-project/slides.py` — academy 복사 후 레이아웃 수정
4. `/deck generate products/new-project`

에이전트, 커맨드, 스킬 변경 불필요.

---

## 📄 Content Pipeline (Headless)

`claude -p` (headless) 기반 콘텐츠 파이프라인. 현재 수동 운영 중이며, Mother 자동화 통합 대기 상태.

### 에이전트

| Agent | Model | 역할 |
|-------|-------|------|
| `content-columnist` | sonnet | 칼럼 KO/EN 작성 |
| `content-novelist` | opus | SIMULACRA 소설 집필 |
| `web-developer` | sonnet | 빌드, 배포, 웹 개발 |
| `qa-reviewer` | haiku | 콘텐츠 QA (read-only) |
| `research-analyst` | sonnet | 일일 리서치 파이프라인 |
| `community-manager` | haiku | Discord 포스팅 콘텐츠 생성 |
| `publish-orchestrator` | sonnet | E2E 파이프라인 총괄 |
| `healthcheck` | sonnet | 전체 파이프라인 테스트 + 리포트 |

### 커맨드

| 명령 | 에이전트 | 설명 |
|------|--------|------|
| `/write-column <topic>` | content-columnist | 칼럼 KO/EN 작성 |
| `/write-novel [vol-ch]` | content-novelist | 소설 챕터 집필 |
| `/qa-check <file>` | qa-reviewer | 콘텐츠 QA 검증 |
| `/research [--topic X]` | research-analyst | 일일 리서치 |
| `/deploy [--clean]` | web-developer | 빌드 + Vercel 배포 |
| `/publish <topic>` | publish-orchestrator | E2E 파이프라인 |
| `/announce <slug>` | community-manager | Discord 공지 콘텐츠 생성 |
| `/healthcheck [--level]` | healthcheck | 전체 파이프라인 E2E 테스트 |

### Headless 호출

스크립트: `scripts/headless/`

단일 진입점 `run-command.sh`로 모든 커맨드 실행. 커맨드별 예산/타임아웃 자동 설정.

```bash
# 칼럼 작성 (budget $2.00, timeout 600s)
bash scripts/headless/run-command.sh write-column "AI 보안" --author JY

# E2E 파이프라인 (budget $5.00, timeout 1800s)
bash scripts/headless/publish.sh "AI agent 자율성"

# 소설 이어쓰기 (budget $5.00, timeout 900s)
bash scripts/headless/run-command.sh write-novel --continue

# 전체 파이프라인 테스트 (dedicated orchestrator script)
bash scripts/headless/healthcheck.sh --level all

# QA 검증 (budget $1.00, timeout 300s)
bash scripts/headless/run-command.sh qa-check "web/src/content/columns/ko/my-column.md" --type column

# 리서치 (budget $2.00, timeout 600s)
bash scripts/headless/run-command.sh research --topic "LLM agents"

# Discord 공지 (budget $0.50, timeout 180s)
bash scripts/headless/run-command.sh announce "my-slug"

# 배포 (budget $2.00, timeout 600s)
bash scripts/headless/run-command.sh deploy --clean
```

ENV 오버라이드: `CLAUDE_TIMEOUT`, `CLAUDE_BUDGET_USD` — **`run-command.sh`에만 적용**.
`healthcheck.sh`는 Phase별 budget이 하드코딩되어 있어 env override 무시.

> **Nested session 방지**: `run-command.sh`는 실행 직전 모든 `CLAUDE*`/`OTEL*` 환경변수를 unset하여
> 부모 Claude Code 세션이 자식 `claude -p`를 nested session으로 감지하는 것을 방지한다.
> 사용자 오버라이드(`CLAUDE_TIMEOUT`, `CLAUDE_BUDGET_USD`)는 unset 전에 캡처한다.

### 스크립트 구조

| 파일 | 역할 |
|------|------|
| `run-command.sh` | 단일 진입점. 커맨드별 예산/타임아웃 내장, `--max-budget-usd`로 비용 제한 |
| `healthcheck.sh` | 멀티 에이전트 오케스트레이터. T1-T5 단계별 `claude -p` 호출 |
| `publish.sh` | E2E 파이프라인. `run-command.sh` 호출 후 credit-points 처리 |
| `credit-points.sh` | 크레딧 포인트 API 호출 (CREDIT_API_SECRET 필요) |

### JSON 출력 계약

모든 agent는 JSON을 stdout으로 출력:
```json
{"status": "ok|fail|error", ...}
```

### Exit Code

| Code | 의미 | Mother 행동 |
|------|------|------------|
| 0 | 성공 | JSON 파싱 후 진행 |
| 1 | agent 에러 | 에러 로깅 |
| 2 | timeout | 1회 재시도 후 Jay 알림 |
| 3 | build 실패 | 배포 차단, Jay 알림 |

### Orchestrator Sub-Agent Delegation Rule

When an orchestrator agent delegates work to a sub-agent via the Task tool, it MUST follow this pattern:

#### Required Pattern
```
Delegate to `<agent-name>` agent:
Task prompt: "<Specific instruction. Include file paths. Self-contained.>"
- Wait for completion
- Parse/verify output
```

#### Prohibited Patterns
- Mentioning agent name without a Task prompt
- Using "Expect:" to describe results (not a delegation instruction)
- Implicit delegation (agent name only in section title)

#### Sub-Agent Constraints
- Sub-agents CANNOT spawn other sub-agents (1 level only)
- Each sub-agent has its own maxTurns budget (independent of parent)
- Include ALL necessary context in the Task prompt (sub-agents do NOT inherit parent context)
- Always instruct sub-agents to "Read CLAUDE.md first" for project rules

#### Architecture Principle: Shell Scripts as Orchestrators

When a pipeline needs to call multiple agents, use a shell script (not an agent)
as the orchestrator. Each `claude -p --agent <name>` call runs at level 0,
bypassing the sub-agent nesting limit.

- **Shell script orchestration**: healthcheck.sh, publish.sh
- **Agent orchestration**: Only when the agent itself is level 0
  (e.g., `/publish` called interactively runs publish-orchestrator at level 0)

### 규칙
- community-manager는 콘텐츠 생성만 — Discord 전송은 Mother가 담당
- publish-orchestrator는 sub-agent를 Task tool로 위임
- qa-reviewer는 **read-only** — 파일 수정 안 함
- headless 스크립트는 `--dangerously-skip-permissions`로 실행
- 비용 제한은 `--max-budget-usd`로 (달러 기반, 턴 기반 아님)

---

*Last updated: 2026-02-24*
