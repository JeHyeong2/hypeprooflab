# Work Spec #001: CI/CD Pipeline Setup

## Assignee: JeHyeong
## Priority: P0
## Due: 2026-04-18

---

## Goal

PR이 올라오면 자동으로 빌드 체크가 돌고, main 머지 시 Vercel preview가 생성되는 파이프라인 구축.
현재는 빌드 체크 없이 머지 가능 — 깨진 코드가 main에 들어갈 수 있음.

## Background

- 웹: Next.js 15, `web/` 디렉토리
- 배포: Vercel CLI (`vercel --prod --yes`) — 프로덕션 배포는 수동
- 현재 CI: 없음. GitHub Actions 미설정
- Branch protection: 없음
- 기존 workflow: `.github/workflows/verify-members.yml` (멤버 데이터 검증용, CI와 별개)
- JeHyeong은 GitHub repo admin 권한 있음

## Spec

### 1. GitHub Actions workflow

**파일**: `.github/workflows/ci.yml`

**Trigger**: PR to main, push to main

**Steps**:
```
1. Checkout
2. Setup Node 20
3. npm ci (web/)
4. npm run build (web/)
5. npm run lint (web/) — ESLint 설정 이미 있음, 포함할 것
```

**Requirements**:
- `web/` 디렉토리 변경이 있을 때만 실행 (paths filter)
- `data/`, `.claude/`, `cron-prompts/` 변경은 빌드 트리거 불필요
- Build 실패 시 PR에 빨간 체크
- Build 성공 시 PR에 초록 체크
- 환경변수가 필요한 빌드 스텝이 있으면 GitHub Secrets에 직접 추가 (admin 권한)

### 2. Branch protection rule

Settings → Branches → main:
- Require PR before merging (최소 1 review)
- Require status checks to pass: `ci.yml` build
- No direct push to main
- Admin도 예외 없음 (Include administrators 체크)

### 3. Vercel Git integration

Vercel Dashboard → Project → Settings → Git → Connect GitHub repo:
- PR마다 preview URL 자동 생성
- **프로덕션 auto-deploy는 끄기** — 프로덕션은 `vercel --prod --yes`로 수동 배포
- Vercel 계정 접근 필요하면 Jay에게 요청

### 4. (Stretch) `.nvmrc` 추가

프로젝트 루트에 `.nvmrc` 파일 생성 (내용: `20`).
`nvm use`로 Node 버전 자동 맞춤.

## Acceptance Criteria

- [ ] PR 올리면 GitHub Actions에서 빌드 + lint 실행됨
- [ ] 빌드 실패 시 PR 머지 불가
- [ ] main branch에 직접 push 불가
- [ ] `.github/workflows/ci.yml` 커밋됨
- [ ] Branch protection rule 활성화됨
- [ ] (Stretch) Vercel preview URL이 PR에 자동으로 달림
- [ ] (Stretch) `.nvmrc` 추가됨

## Reference

- `web/package.json` — build/lint scripts
- `CONTRIBUTING.md` — 개발 워크플로우
- `.claude/skills/deploy-rules/SKILL.md` — 배포 규칙
- `.github/workflows/verify-members.yml` — 기존 workflow (참고용, 수정 불필요)
