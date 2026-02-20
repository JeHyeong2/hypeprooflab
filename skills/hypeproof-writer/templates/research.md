---
title: "{{TITLE}}"
creator: "{{CREATOR_NAME}}"
date: {{DATE}}
category: "Research"
tags:
  - {{TAG_1}}
  - {{TAG_2}}
  - Research
slug: "{{SLUG}}"
readTime: "{{READ_TIME}} min"
excerpt: "{{EXCERPT}}"
creatorImage: "/members/{{CREATOR_IMAGE}}"
lang: "ko"
---

<!--
  hypeproof-writer / Research Template

  리서치 문서는 데이터와 인용이 핵심.
  GEO 체크리스트:
  [ ] 인라인 인용 7개 이상 (학술/공식 출처 우선)
  [ ] H2 5개+, H3 4개+
  [ ] 데이터 테이블 2개 이상
  [ ] 2,500단어 이상 (리서치 특성상 더 긴 분량)
  [ ] 통계/수치 6개+
  [ ] 연구 방법론 섹션 포함
  [ ] 한계점/향후 연구 섹션 포함
  [ ] 키워드 반복 없음

  작성 후 로컬 채점: python3 tools/geo_qa_local.py article.md
-->

# {{TITLE}}

> **요약**: {{EXCERPT}}

**연구 분야**: {{RESEARCH_DOMAIN}}
**분석 기간**: {{ANALYSIS_PERIOD}}
**주요 출처**: {{SOURCE_COUNT}}개 문헌 분석

---

## 연구 배경 및 목적

<!--
  - 왜 이 주제를 연구했는가?
  - 기존 연구의 공백(gap) 명시
  - 이 리서치가 답하려는 핵심 질문
-->

{{BACKGROUND_CONTENT}}

**핵심 연구 질문:**

1. {{RESEARCH_QUESTION_1}}
2. {{RESEARCH_QUESTION_2}}
3. {{RESEARCH_QUESTION_3}}

---

## 분석 방법론

<!--
  - 어떤 데이터를 어떻게 수집했는가
  - 분석 기준과 프레임워크
  - 한계 및 가정사항
-->

### 데이터 수집

{{DATA_COLLECTION_METHOD}}

### 분석 프레임워크

{{ANALYSIS_FRAMEWORK}}

| 분석 기준 | 측정 방법 | 데이터 출처 |
|----------|----------|------------|
| {{CRITERIA_1}} | {{METHOD_1}} | {{SOURCE_TYPE_1}} |
| {{CRITERIA_2}} | {{METHOD_2}} | {{SOURCE_TYPE_2}} |
| {{CRITERIA_3}} | {{METHOD_3}} | {{SOURCE_TYPE_3}} |

---

## 주요 발견: {{FINDING_1_TITLE}}

<!--
  각 발견에는 반드시:
  1. 핵심 수치/데이터
  2. 신뢰 출처 인라인 인용
  3. 함의(implication) 설명
-->

{{FINDING_1_CONTENT}}

**데이터 요약:**

| 지표 | 수치 | 비교 기준 | 출처 |
|------|------|----------|------|
| {{METRIC_1}} | {{VALUE_1}} | {{BASELINE_1}} | {{SOURCE_1}} |
| {{METRIC_2}} | {{VALUE_2}} | {{BASELINE_2}} | {{SOURCE_2}} |
| {{METRIC_3}} | {{VALUE_3}} | {{BASELINE_3}} | {{SOURCE_3}} |

### 세부 분석

{{FINDING_1_DETAIL}}

---

## 주요 발견: {{FINDING_2_TITLE}}

{{FINDING_2_CONTENT}}

### 세부 분석

{{FINDING_2_DETAIL}}

---

## 주요 발견: {{FINDING_3_TITLE}}

{{FINDING_3_CONTENT}}

### 세부 분석

{{FINDING_3_DETAIL}}

---

## 종합 분석

<!--
  여러 발견을 연결하여 전체 그림 제시
  상관관계, 인과관계, 패턴 분석
-->

{{SYNTHESIS_CONTENT}}

**핵심 인사이트:**

- {{INSIGHT_1}}
- {{INSIGHT_2}}
- {{INSIGHT_3}}
- {{INSIGHT_4}}

---

## 실무 적용

<!--
  이 리서치가 실제로 어떻게 활용될 수 있는가
  구체적이고 실행 가능한 제안
-->

### {{APPLICATION_1_TITLE}}

{{APPLICATION_1_CONTENT}}

### {{APPLICATION_2_TITLE}}

{{APPLICATION_2_CONTENT}}

---

## 한계점 및 향후 연구

### 이 연구의 한계

{{LIMITATIONS_CONTENT}}

### 향후 연구 방향

- {{FUTURE_RESEARCH_1}}
- {{FUTURE_RESEARCH_2}}
- {{FUTURE_RESEARCH_3}}

---

## 결론

{{CONCLUSION_CONTENT}}

---

## 참고 문헌

<!--
  리서치는 인용 7개 이상 권장
  학술 논문, 공식 보고서, 신뢰 기관 우선
  형식: - [제목](URL) — 저자, 기관, 연도
-->

- [{{REF_1_TITLE}}]({{REF_1_URL}}) — {{REF_1_AUTHOR}}, {{REF_1_INSTITUTION}}, {{REF_1_YEAR}}
- [{{REF_2_TITLE}}]({{REF_2_URL}}) — {{REF_2_AUTHOR}}, {{REF_2_INSTITUTION}}, {{REF_2_YEAR}}
- [{{REF_3_TITLE}}]({{REF_3_URL}}) — {{REF_3_AUTHOR}}, {{REF_3_INSTITUTION}}, {{REF_3_YEAR}}
- [{{REF_4_TITLE}}]({{REF_4_URL}}) — {{REF_4_AUTHOR}}, {{REF_4_INSTITUTION}}, {{REF_4_YEAR}}
- [{{REF_5_TITLE}}]({{REF_5_URL}}) — {{REF_5_AUTHOR}}, {{REF_5_INSTITUTION}}, {{REF_5_YEAR}}
- [{{REF_6_TITLE}}]({{REF_6_URL}}) — {{REF_6_AUTHOR}}, {{REF_6_INSTITUTION}}, {{REF_6_YEAR}}
- [{{REF_7_TITLE}}]({{REF_7_URL}}) — {{REF_7_AUTHOR}}, {{REF_7_INSTITUTION}}, {{REF_7_YEAR}}

---

*이 리서치는 HypeProof Lab의 AEO-First 원칙에 따라 작성되었습니다.*
*Creator: {{CREATOR_NAME}} | 분석 완료: {{DATE}}*
