# Work Spec #001: CI/CD Pipeline Setup

## Assignee: JeHyeong
## Priority: P0
## Due: 2026-04-18

---

## Goal

PR이 올라오면 자동으로 빌드 체크가 돌고, main 머지 시 Vercel preview가 생성되는 파이프라인 구축.
현재는 빌드 체크 없이 머지 가능 — 깨진 코드가 main에 들어갈 수 있음.

## Background

- 웹: Next.js (App Router), `web/` 디렉토리
- **CI/CD workflow 이미 생성됨**: `.github/workflows/ci.yml` (Jay 4/9)
- **GitHub Secrets 설정 완료**: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
- **빌드 테스트 통과**: workflow_dispatch로 수동 실행, 37초 빌드 성공
- Branch protection: 아직 미설정 → JeHyeong이 설정
- 기존 workflow: `.github/workflows/verify-members.yml` (멤버 데이터 검증용, CI와 별개)
- JeHyeong은 GitHub repo admin 권한 있음

## Spec

### 1. GitHub Actions workflow — 이미 생성됨

**파일**: `.github/workflows/ci.yml` (Jay 4/9 생성)

**현재 동작**:
- PR to main (`web/` 변경): build job 실행 (npm ci + npm run build)
- Push to main (`web/` 변경): build + deploy job 실행 (Vercel 프로덕션 자동 배포)
- workflow_dispatch: 수동 트리거 가능

**JeHyeong 할 일**:
- lint 스텝 추가 검토 (`npm run lint` — ESLint 설정 있으면 추가)
- 배포 workflow가 실제 main push에서 정상 동작하는지 검증 (web/ 파일 수정 PR → 머지 → 자동 배포 확인)
- 문제 있으면 ci.yml 수정

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
