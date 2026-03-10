# 칼럼 제출 프로세스

> Mother가 칼럼 제출을 처리할 때 반드시 따라야 하는 프로세스.
> **핵심 원칙: 절대 바로 올리지 않는다.**

---

## 프로세스 단계

### 1. 접수
- 크리에이터가 `#ai-column` 채널에 MD 파일 첨부 + `@Mother` 멘션
- Mother: 👀 리액션 + "접수했습니다" 메시지로 ACK

### 2. ⭐ 크리에이터와 대화 (필수!)
> **제출 → 즉시 게시는 금지.** 최소 1회 크리에이터 확인 후 다음 단계.

Mother가 확인해야 할 것:
- **제목 확인**: "제목은 이대로 갈까요?"
- **내용 피드백**: "이 부분은 좀 더 설명이 있으면 좋을 것 같은데, 어떠세요?"
- **EN 제목 제안**: "영문 제목은 이렇게 하면 어떨까요: ..."
- 크리에이터가 최소 1회 확인/수정 응답을 해야 다음 단계 진행

### 3. 보안 검사
```bash
cd ~/CodeWorkspace/hypeproof
python3 research/scripts/security_check.py <submitted_file.md>
```
- **CRITICAL 발견 시**: 즉시 크리에이터에게 알림, 게시 차단
- 해당 부분 수정 후 재검사 통과 필요

### 4. 품질 평가
```bash
python3 research/scripts/eval_column.py <submitted_file.md> --quick
```
- **70점 미만**: 개선 포인트를 크리에이터에게 공유
- 크리에이터와 함께 수정 후 재평가
- 70점 이상 통과 시 다음 단계

### 5. Frontmatter 생성 + EN 번역
- KO frontmatter 필수 필드 확인/생성:
  - `title`, `creator`, `date`, `category`, `slug`, `readTime`, `excerpt`, `creatorImage`, `lang`
- EN 버전 번역 생성
- 파일 배치:
  - KO: `web/src/content/columns/ko/<date>-<slug>.md`
  - EN: `web/src/content/columns/en/<date>-<slug>.md`

### 6. 크리에이터 최종 확인
- 완성된 KO + EN 버전을 크리에이터에게 공유
- 최종 OK 받은 후 다음 단계

### 7. 빌드 검증
```bash
cd ~/CodeWorkspace/hypeproof/web
npm run build
```
- 빌드 실패 시 **절대 배포하지 않는다**
- 에러 수정 후 재빌드

### 8. 배포
```bash
git add .
git commit -m "column: <slug> by <creator>"
cd web && vercel --prod --yes
```

### 9. 배포 완료 알림
- 배포 URL을 `#ai-column` 채널에 공유
- 크리에이터 멘션 + 게시 완료 알림
- 해당 칼럼 관련 콘텐츠 넛지 트리거 (content-nudge 스킬)

---

## 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **대화 우선** | 제출 → 즉시 게시 금지. 반드시 크리에이터와 1회 이상 대화 |
| **보안 필수** | security_check 통과 없이 게시 불가 |
| **품질 게이트** | eval_column 70점 미만은 게시 차단 |
| **빌드 필수** | npm run build 통과 확인 후 배포 |
| **크리에이터 존중** | AI가 대필하지 않음. 피드백하고 크리에이터가 수정 |

---

## Frontmatter 템플릿

```yaml
---
title: "칼럼 제목"
creator: "크리에이터 이름"
date: "YYYY-MM-DD"
category: "카테고리"
tags: ["tag1", "tag2"]
slug: "YYYY-MM-DD-slug-name"
readTime: "Nmin"
excerpt: "한 줄 요약"
creatorImage: "/members/name.png"
lang: "ko"
---
```

---

*Last updated: 2026-03-10*
