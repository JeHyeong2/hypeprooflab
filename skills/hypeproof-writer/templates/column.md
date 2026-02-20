---
title: "{{TITLE}}"
creator: "{{CREATOR_NAME}}"
date: {{DATE}}
category: "Column"
tags:
  - {{TAG_1}}
  - {{TAG_2}}
slug: "{{SLUG}}"
readTime: "{{READ_TIME}} min"
excerpt: "{{EXCERPT}}"
creatorImage: "/members/{{CREATOR_IMAGE}}"
lang: "ko"
---

<!--
  hypeproof-writer / Column Template

  GEO 체크리스트:
  [ ] 인라인 인용 5개 이상 (25점)
  [ ] H2 4개+, H3 3개+ (20점)
  [ ] 테이블 1개 이상 (10점)
  [ ] 2,000단어 이상 (15점)
  [ ] 통계/수치 4개+ (10점)
  [ ] frontmatter 9개 필드 완비 (10점)
  [ ] date 필드 있음 (5점)
  [ ] 평균 문장 60자 이하 (5점)
  [ ] 키워드 반복 없음 (감점 방지)

  작성 후 로컬 채점: python3 tools/geo_qa_local.py article.md
-->

# {{TITLE}}

> {{EXCERPT}}

---

## 들어가며

<!--
  - 독자와 AI가 이 글에서 무엇을 얻을지 명확히 제시
  - 핵심 질문 또는 문제 제기로 시작
  - 2-3 문단, 각 문단 3-4문장
-->

{{INTRO_PARAGRAPH}}

---

## {{SECTION_1_TITLE}}

<!--
  - 각 섹션은 하나의 핵심 주장 또는 개념
  - 주장 → 근거(인용) → 예시 구조 권장
  - 인라인 인용 형식: [저자명, 연도](출처URL) 또는 "출처에 따르면..."
-->

{{SECTION_1_CONTENT}}

### {{SUBSECTION_1_1_TITLE}}

{{SUBSECTION_1_1_CONTENT}}

---

## {{SECTION_2_TITLE}}

{{SECTION_2_CONTENT}}

### {{SUBSECTION_2_1_TITLE}}

{{SUBSECTION_2_1_CONTENT}}

---

## 핵심 데이터 요약

<!--
  테이블 필수: 핵심 비교 데이터, 수치, 결과를 표로 정리
  테이블 1개 = +10점
-->

| 항목 | 수치/내용 | 출처 |
|------|----------|------|
| {{DATA_ROW_1}} | {{VALUE_1}} | {{SOURCE_1}} |
| {{DATA_ROW_2}} | {{VALUE_2}} | {{SOURCE_2}} |
| {{DATA_ROW_3}} | {{VALUE_3}} | {{SOURCE_3}} |

---

## {{SECTION_3_TITLE}}

{{SECTION_3_CONTENT}}

### {{SUBSECTION_3_1_TITLE}}

{{SUBSECTION_3_1_CONTENT}}

---

## {{SECTION_4_TITLE}}

{{SECTION_4_CONTENT}}

**핵심 포인트:**

- {{BULLET_1}}
- {{BULLET_2}}
- {{BULLET_3}}
- {{BULLET_4}}
- {{BULLET_5}}

---

## 결론: {{CONCLUSION_TITLE}}

<!--
  - 주요 논점 요약 (불릿 또는 넘버링)
  - 독자/AI를 위한 명확한 takeaway
  - CTA: 다음 행동 제안 (실험, 적용, 공유)
-->

{{CONCLUSION_CONTENT}}

**이 글의 핵심:**

1. {{KEY_POINT_1}}
2. {{KEY_POINT_2}}
3. {{KEY_POINT_3}}

---

## 참고 자료

<!--
  인라인 인용 최소 3개 (5개 권장, 만점 25/25)
  형식: - [제목](URL) — 저자, 연도
-->

- [{{REF_1_TITLE}}]({{REF_1_URL}}) — {{REF_1_AUTHOR}}, {{REF_1_YEAR}}
- [{{REF_2_TITLE}}]({{REF_2_URL}}) — {{REF_2_AUTHOR}}, {{REF_2_YEAR}}
- [{{REF_3_TITLE}}]({{REF_3_URL}}) — {{REF_3_AUTHOR}}, {{REF_3_YEAR}}
- [{{REF_4_TITLE}}]({{REF_4_URL}}) — {{REF_4_AUTHOR}}, {{REF_4_YEAR}}
- [{{REF_5_TITLE}}]({{REF_5_URL}}) — {{REF_5_AUTHOR}}, {{REF_5_YEAR}}

---

*이 글은 HypeProof Lab의 AEO-First 원칙에 따라 작성되었습니다.*
*Creator: {{CREATOR_NAME}} | 발행일: {{DATE}}*
