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

### 3. Vercel 자동 배포 (GitHub Actions)

main 머지 시 자동으로 Vercel production 배포. Vercel CLI를 GitHub Actions에서 실행.

**GitHub Secrets 설정** (Settings → Secrets → Actions):
- `VERCEL_TOKEN` — Jay가 https://vercel.com/account/tokens 에서 생성해서 전달
- `VERCEL_ORG_ID` — `team_CfP9smWEfKRd9byEl6GATl8W`
- `VERCEL_PROJECT_ID` — `prj_3SAcZNZIweNYNMWtvyGgbNnThLdN`

**배포 workflow** (ci.yml에 포함 또는 별도 deploy.yml):
```yaml
- name: Install Vercel CLI
  run: npm i -g vercel
- name: Pull Vercel env
  run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
- name: Build
  run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
- name: Deploy
  run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**조건**: `web/` 디렉토리 변경 + main push 시에만 배포
**Hobby 플랜에서 동작 확인됨** — 추가 비용 없음

### 4. (Stretch) `.nvmrc` 추가

프로젝트 루트에 `.nvmrc` 파일 생성 (내용: `20`).
`nvm use`로 Node 버전 자동 맞춤.

## Acceptance Criteria

- [ ] PR 올리면 GitHub Actions에서 빌드 + lint 실행됨
- [ ] 빌드 실패 시 PR 머지 불가
- [ ] main branch에 직접 push 불가
- [ ] `.github/workflows/ci.yml` 커밋됨
- [ ] Branch protection rule 활성화됨
- [ ] main 머지 시 Vercel 프로덕션 자동 배포됨
- [ ] GitHub Secrets에 VERCEL_TOKEN/ORG_ID/PROJECT_ID 설정됨
- [ ] (Stretch) `.nvmrc` 추가됨

## Reference

- `web/package.json` — build/lint scripts
- `CONTRIBUTING.md` — 개발 워크플로우
- `.claude/skills/deploy-rules/SKILL.md` — 배포 규칙
- `.github/workflows/verify-members.yml` — 기존 workflow (참고용, 수정 불필요)
