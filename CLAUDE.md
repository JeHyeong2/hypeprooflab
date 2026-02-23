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
├── products/               # Deck projects (각각 deck.yaml 보유)
├── research/               # 리서치 콘텐츠
├── education/              # 교육 프로그램
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
4. frontmatter: title, author, date, category, tags, slug, readTime, excerpt, authorImage (`/members/jay.png`)
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

*Last updated: 2026-02-23 — /deck generic system refactor (from /proposal)*
