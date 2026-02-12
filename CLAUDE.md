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

*Last updated: 2026-02-11 — 실전에서 배운 교훈 기반*
