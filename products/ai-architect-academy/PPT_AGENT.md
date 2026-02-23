# PPT Generation Agent Architecture
> SPEC.md → 깔끔한 텍스트 PPT → (수동) 이미지 오버레이
> Created: 2026-02-23

---

## 1. 설계 철학

**텍스트 퍼스트**: 깔끔한 타이포그래피 + 여백 + 구조로 승부. 이미지는 나중에 수동으로 입힘.
**Single Source**: `SPEC.md` → 에이전트 → `.pptx` (SPEC 수정 → 재생성)

---

## 2. 파이프라인

```
SPEC.md
  ↓
[1. Slide Planner] — SPEC 읽고 슬라이드 구성 결정
  ↓
slide-plan.json (슬라이드별 제목, 레이아웃, 콘텐츠 키)
  ↓
[2. Content Writer] — 각 슬라이드 텍스트 작성 (간결화, 키메시지 추출)
  ↓
slide-content.json (슬라이드별 완성 텍스트)
  ↓
[3. PPT Builder] — python-pptx로 실제 .pptx 생성
  ↓
output/제안서_v2.pptx
  ↓
[4. QA Reviewer] — 생성된 PPT 스크린샷 → 검토 → 피드백
  ↓
(통과) or (피드백 → 2번으로 루프)
```

---

## 3. 각 에이전트 상세

### 3.1 Slide Planner

**역할**: SPEC.md를 읽고 프레젠테이션 스토리라인 결정

**입력**: `SPEC.md`
**출력**: `slide-plan.json`

```json
{
  "title": "Future AI Leader's Academy — 동아일보 제안",
  "slideCount": 9,
  "slides": [
    {
      "id": 1,
      "type": "title",
      "layout": "center-title",
      "specSections": ["1"],
      "notes": "프로그램명 + 부제 + 로고 자리"
    },
    {
      "id": 2,
      "type": "data",
      "layout": "three-column-stats",
      "specSections": ["2.1", "2.2", "2.3"],
      "notes": "시장 규모 3개 숫자 강조"
    }
  ]
}
```

**프롬프트 핵심**:
- 원본 PDF 9슬라이드 구조를 기본으로 따르되, 내용은 SPEC.md 기준
- 각 슬라이드에 "한 가지 메시지"만
- 레이아웃 타입: `center-title`, `two-column`, `three-column-stats`, `quote`, `timeline`, `table`, `bullet-minimal`

### 3.2 Content Writer

**역할**: 슬라이드별 텍스트를 PPT에 맞게 간결하게 가공

**규칙**:
- 제목: 최대 10자 (한글 기준)
- 서브타이틀: 최대 25자
- 본문 bullet: 최대 3개, 각 15자 이내
- 숫자는 크게, 단위는 작게 (예: **430**억 달러)
- 불필요한 조사/접속사 제거

**프롬프트**:
```
당신은 프레젠테이션 카피라이터입니다.
SPEC.md의 해당 섹션을 읽고, 슬라이드 한 장에 들어갈 텍스트를 작성하세요.

규칙:
- 한 슬라이드 = 한 메시지
- 제목 10자 이내
- bullet 3개 이내, 각 15자 이내
- 숫자를 시각적으로 강조 (크기 차별화용 마킹)
- 청중: 동아일보 임원 (50대, 미디어 업계)
```

### 3.3 PPT Builder

**도구**: `python-pptx`
**역할**: slide-content.json → .pptx 파일 생성

**디자인 시스템**:

#### 컬러
| 용도 | 색상 | Hex |
|------|------|-----|
| Primary (제목, 강조) | 딥 네이비 | `#1B2A4A` |
| Accent (숫자, CTA) | 코럴 오렌지 | `#FF6B35` |
| Background | 화이트 | `#FFFFFF` |
| Subtitle/Body | 다크 그레이 | `#4A4A4A` |
| Light accent | 라이트 그레이 | `#F5F5F5` |

#### 폰트
| 용도 | 폰트 | 사이즈 | Weight |
|------|------|--------|--------|
| 슬라이드 제목 | Pretendard | 36pt | Bold |
| 서브타이틀 | Pretendard | 20pt | SemiBold |
| 본문 | Pretendard | 16pt | Regular |
| 숫자 강조 | Pretendard | 48pt | ExtraBold |
| 캡션/출처 | Pretendard | 10pt | Light |

> Pretendard 없는 환경 fallback: Apple SD Gothic Neo → Malgun Gothic

#### 레이아웃 템플릿

**center-title** (표지/섹션 구분):
```
┌────────────────────────────┐
│                            │
│                            │
│      [TITLE 36pt Bold]     │
│    [subtitle 20pt Semi]    │
│                            │
│         [로고 자리]          │
│                            │
└────────────────────────────┘
```

**three-column-stats** (데이터 슬라이드):
```
┌────────────────────────────┐
│  [TITLE]                   │
│                            │
│  ┌──────┐┌──────┐┌──────┐ │
│  │ 430  ││ 10x  ││ 93%  │ │
│  │억 달러││ 성장  ││ 학부모│ │
│  │글로벌 ││한국   ││인식   │ │
│  └──────┘└──────┘└──────┘ │
│                            │
│  [source 10pt]             │
└────────────────────────────┘
```

**two-column** (비교/설명):
```
┌────────────────────────────┐
│  [TITLE]                   │
│                            │
│  ┌────────┐ ┌────────┐    │
│  │ Left   │ │ Right  │    │
│  │ column │ │ column │    │
│  │        │ │        │    │
│  └────────┘ └────────┘    │
│                            │
└────────────────────────────┘
```

**bullet-minimal** (핵심 포인트):
```
┌────────────────────────────┐
│  [TITLE]                   │
│                            │
│  ● Point 1                 │
│  ● Point 2                 │
│  ● Point 3                 │
│                            │
│  [quote or callout box]    │
└────────────────────────────┘
```

### 3.4 QA Reviewer

**역할**: 생성된 PPT를 스크린샷으로 변환 → 시각적 검토

**체크리스트**:
- [ ] 텍스트 잘림 없음 (overflow)
- [ ] 폰트 사이즈 일관성
- [ ] 여백 충분 (슬라이드 가장자리 최소 1인치)
- [ ] 숫자 강조가 시각적으로 돋보임
- [ ] 9슬라이드 스토리 흐름 자연스러움
- [ ] 오탈자 없음
- [ ] 출처 표기 완료

**도구**: `libreoffice --headless --convert-to png` 또는 `pdf2image`

---

## 4. 실행 방법

### 원커맨드 생성
```bash
cd ~/CodeWorkspace/hypeproof/products/ai-architect-academy
python3 scripts/generate_ppt.py --spec SPEC.md --output output/제안서_v2.pptx
```

### 스크립트 구조
```
scripts/
├── generate_ppt.py        # 메인 오케스트레이터
├── slide_planner.py       # SPEC → slide-plan.json
├── content_writer.py      # slide-plan → slide-content.json
├── ppt_builder.py         # slide-content → .pptx
├── qa_reviewer.py         # .pptx → screenshots → 검토
└── templates/
    ├── layouts.py          # 레이아웃 함수들
    └── styles.py           # 컬러/폰트 상수
```

---

## 5. 테스트 계획

### A/B 비교

| Group | 설명 | 목적 |
|-------|------|------|
| A (Baseline) | 현재 PDF (동아일보_제안서_260210.pdf) | 기준선 |
| B (Generated) | 에이전트 생성 PPT | 품질 비교 |

**평가 기준** (각 1-5점):
1. **가독성** — 3초 안에 슬라이드 메시지 파악 가능?
2. **정보 밀도** — 핵심 정보가 빠짐없이 포함?
3. **시각적 정돈** — 정렬, 여백, 타이포그래피 일관성
4. **스토리 흐름** — 슬라이드 순서가 설득적?
5. **전문성** — 동아일보 임원이 진지하게 받아들일 수준?

### 자동 검증
```python
# 텍스트 잘림 검사
assert all(len(title) <= 20 for title in slide_titles)
# 슬라이드 수
assert len(slides) == plan["slideCount"]
# 빈 슬라이드 없음
assert all(slide.has_content for slide in slides)
```

---

## 6. 이미지 오버레이 (Phase 2 — 수동)

PPT 생성 후, 아래 영역에 이미지를 수동으로 배치:

| 슬라이드 | 이미지 영역 | 권장 콘텐츠 |
|---------|-----------|-----------|
| 1 (표지) | 하단 30% | 워크숍 사진 콜라주 |
| 3 (문제정의) | 우측 40% | 인포그래픽 |
| 4 (핵심컨셉) | 중앙 | Co-Founding 다이어그램 |
| 5 (커리큘럼) | 아이콘 | Part별 아이콘 4개 |
| 7 (실적) | 그리드 | 워크숍 현장 사진 |
| 8 (Faculty) | 프로필 | 팀원 사진 4장 |

> 이미지 placeholder는 PPT에 빈 박스 + 캡션으로 표시

---

## 7. 향후 확장

- **버전 관리**: SPEC.md 변경 → git diff → 변경된 슬라이드만 재생성
- **다국어**: SPEC.md 영문 버전 → 영문 PPT 자동 생성
- **테마**: `styles.py` 교체로 동아일보 CI 적용 가능
- **Gamma 연동**: slide-content.json → Gamma API (더 화려한 디자인 필요 시)

---

*Mother 🫶*
