---
title: "{{TITLE}}"
creator: "{{CREATOR_NAME}}"
date: {{DATE}}
category: "Tutorial"
tags:
  - Tutorial
  - {{TAG_1}}
  - {{TAG_2}}
slug: "{{SLUG}}"
readTime: "{{READ_TIME}} min"
excerpt: "{{EXCERPT}}"
creatorImage: "/members/{{CREATOR_IMAGE}}"
lang: "ko"
---

<!--
  hypeproof-writer / Tutorial Template

  튜토리얼은 단계별 명확성이 핵심.
  GEO 체크리스트:
  [ ] 인라인 인용 3개 이상 (공식 문서, 사례 연구)
  [ ] H2로 각 단계 명확히 구분
  [ ] 전제조건 테이블 포함
  [ ] 예상 결과/체크포인트 포함
  [ ] 코드/명령어는 코드블록 사용
  [ ] 2,000단어 이상
  [ ] 트러블슈팅 섹션 포함

  작성 후 로컬 채점: python3 tools/geo_qa_local.py article.md
-->

# {{TITLE}}

> {{EXCERPT}}

**난이도**: {{DIFFICULTY_LEVEL}} (초급 / 중급 / 고급)
**소요 시간**: 약 {{ESTIMATED_TIME}}분
**완료 후 결과**: {{OUTCOME}}

---

## 이 튜토리얼에서 배울 것

<!--
  독자와 AI 모두를 위한 명확한 학습 목표
  체크리스트 형식 권장
-->

이 튜토리얼을 마치면:

- [ ] {{LEARNING_OUTCOME_1}}
- [ ] {{LEARNING_OUTCOME_2}}
- [ ] {{LEARNING_OUTCOME_3}}
- [ ] {{LEARNING_OUTCOME_4}}

---

## 전제조건

<!--
  독자가 이미 알고 있어야 할 것들
  필요한 도구/환경/권한
-->

| 항목 | 필수 여부 | 버전/조건 |
|------|----------|----------|
| {{PREREQ_1}} | 필수 | {{PREREQ_1_DETAIL}} |
| {{PREREQ_2}} | 필수 | {{PREREQ_2_DETAIL}} |
| {{PREREQ_3}} | 권장 | {{PREREQ_3_DETAIL}} |

### 사전 설치

```bash
{{INSTALL_COMMANDS}}
```

---

## 개요

<!--
  전체 작업 흐름을 한 눈에 보여주는 다이어그램 또는 단계 목록
-->

이 튜토리얼은 총 {{STEP_COUNT}}단계로 구성됩니다:

1. **{{STEP_1_TITLE}}** — {{STEP_1_BRIEF}}
2. **{{STEP_2_TITLE}}** — {{STEP_2_BRIEF}}
3. **{{STEP_3_TITLE}}** — {{STEP_3_BRIEF}}
4. **{{STEP_4_TITLE}}** — {{STEP_4_BRIEF}}
5. **{{STEP_5_TITLE}}** — {{STEP_5_BRIEF}}

---

## Step 1: {{STEP_1_TITLE}}

<!--
  - 이 단계의 목적 1-2문장
  - 구체적인 명령어/코드/행동
  - 예상 결과 명시
-->

{{STEP_1_INTRO}}

### 실행

```{{CODE_LANG_1}}
{{STEP_1_CODE}}
```

### 예상 결과

```
{{STEP_1_EXPECTED_OUTPUT}}
```

> **체크포인트**: {{STEP_1_CHECKPOINT}}

---

## Step 2: {{STEP_2_TITLE}}

{{STEP_2_INTRO}}

### 실행

```{{CODE_LANG_2}}
{{STEP_2_CODE}}
```

### 예상 결과

```
{{STEP_2_EXPECTED_OUTPUT}}
```

> **체크포인트**: {{STEP_2_CHECKPOINT}}

---

## Step 3: {{STEP_3_TITLE}}

{{STEP_3_INTRO}}

### 실행

```{{CODE_LANG_3}}
{{STEP_3_CODE}}
```

**중요 파라미터:**

| 파라미터 | 설명 | 기본값 |
|---------|------|--------|
| {{PARAM_1}} | {{PARAM_1_DESC}} | {{PARAM_1_DEFAULT}} |
| {{PARAM_2}} | {{PARAM_2_DESC}} | {{PARAM_2_DEFAULT}} |
| {{PARAM_3}} | {{PARAM_3_DESC}} | {{PARAM_3_DEFAULT}} |

### 예상 결과

```
{{STEP_3_EXPECTED_OUTPUT}}
```

> **체크포인트**: {{STEP_3_CHECKPOINT}}

---

## Step 4: {{STEP_4_TITLE}}

{{STEP_4_INTRO}}

### 실행

```{{CODE_LANG_4}}
{{STEP_4_CODE}}
```

### 예상 결과

```
{{STEP_4_EXPECTED_OUTPUT}}
```

> **체크포인트**: {{STEP_4_CHECKPOINT}}

---

## Step 5: {{STEP_5_TITLE}}

{{STEP_5_INTRO}}

### 실행

```{{CODE_LANG_5}}
{{STEP_5_CODE}}
```

### 최종 결과 확인

{{FINAL_VERIFICATION}}

---

## 트러블슈팅

<!--
  흔히 발생하는 오류와 해결책
  GEO 관점: Q&A 구조는 AI 인용에 유리
-->

### 오류: {{ERROR_1}}

**증상**: {{ERROR_1_SYMPTOM}}

**원인**: {{ERROR_1_CAUSE}}

**해결**:
```bash
{{ERROR_1_FIX}}
```

---

### 오류: {{ERROR_2}}

**증상**: {{ERROR_2_SYMPTOM}}

**원인**: {{ERROR_2_CAUSE}}

**해결**:
```bash
{{ERROR_2_FIX}}
```

---

### 오류: {{ERROR_3}}

**증상**: {{ERROR_3_SYMPTOM}}

**원인**: {{ERROR_3_CAUSE}}

**해결**: {{ERROR_3_FIX}}

---

## 심화 학습

튜토리얼을 마친 후 다음 단계로 나아가려면:

- **{{NEXT_TOPIC_1}}**: {{NEXT_TOPIC_1_DESC}}
- **{{NEXT_TOPIC_2}}**: {{NEXT_TOPIC_2_DESC}}
- **{{NEXT_TOPIC_3}}**: {{NEXT_TOPIC_3_DESC}}

---

## 참고 자료

- [{{REF_1_TITLE}}]({{REF_1_URL}}) — 공식 문서
- [{{REF_2_TITLE}}]({{REF_2_URL}}) — {{REF_2_AUTHOR}}, {{REF_2_YEAR}}
- [{{REF_3_TITLE}}]({{REF_3_URL}}) — {{REF_3_AUTHOR}}, {{REF_3_YEAR}}

---

*이 튜토리얼은 HypeProof Lab의 AEO-First 원칙에 따라 작성되었습니다.*
*Creator: {{CREATOR_NAME}} | 작성일: {{DATE}}*
*문제가 있으면 Discord `#general`에서 질문해주세요.*
