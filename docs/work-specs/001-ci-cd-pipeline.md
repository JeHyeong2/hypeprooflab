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
- 배포: Vercel CLI (`vercel --prod --yes`) — Jay가 수동 실행
- 현재 CI: 없음. GitHub Actions 미설정
- Branch protection: 없음

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
5. (optional) npm run lint if configured
```

**Requirements**:
- `web/` 디렉토리 변경이 있을 때만 실행 (paths filter)
- Build 실패 시 PR에 빨간 체크
- Build 성공 시 PR에 초록 체크

### 2. Branch protection rule

**Settings** → Branches → main:
- Require PR reviews: 1 (Jay)
- Require status checks: CI build must pass
- No direct push to main

### 3. Vercel Git integration (optional)

현재 Vercel는 Git 미연결. PR preview를 자동으로 하려면:
- Vercel Dashboard → Project → Settings → Git → Connect GitHub repo
- 이거 하면 PR마다 preview URL 자동 생성
- **주의**: 프로덕션 auto-deploy는 끄기 (Jay가 수동 배포)

## Acceptance Criteria

- [ ] PR 올리면 GitHub Actions에서 빌드 체크 실행됨
- [ ] 빌드 실패 시 PR 머지 불가
- [ ] main branch에 직접 push 불가
- [ ] `.github/workflows/ci.yml` 커밋됨

## Reference

- `web/package.json` — build/lint scripts
- `CONTRIBUTING.md` — 개발 워크플로우
- `.claude/skills/deploy-rules/SKILL.md` — 배포 규칙

## Notes

- Vercel Git 연동은 Jay 계정에서 해야 함 — JeHyeong은 GitHub Actions까지만
- 환경변수가 필요한 빌드 스텝이 있으면 GitHub Secrets에 추가 (Jay에게 요청)
- `data/`, `.claude/`, `cron-prompts/` 변경은 빌드 트리거 불필요
