---
title: "카파시가 잠든 사이, Claude가 연구했다"
creator: "Jay"
date: "2026-03-11"
category: "Opinion"
tags: ["AI", "자율연구", "LLM", "Karpathy", "Claude", "에이전트"]
slug: "2026-03-11-karpathy-autoresearch"
readTime: "6 min"
excerpt: "Andrej Karpathy가 Claude 에이전트에게 nanochat 튜닝을 맡기고 잤더니, 20년 경력자가 놓친 버그까지 잡아내며 GPT-2 학습 시간을 11% 단축했다."
creatorImage: "/members/jay.png"
lang: "ko"
---

20년간 신경망을 직접 손으로 튜닝해온 사람이 있다. 아이디어를 떠올리고, 구현하고, validation loss를 확인하고, 논문을 읽고, 다시 아이디어를 내는 — 그 반복. AI 연구의 본질이자, Andrej Karpathy가 매일 해온 일이다.

그가 이번에는 그 일을 Claude에게 시켰다.

## nanochat — $48짜리 GPT-2

nanochat은 Karpathy가 만든 미니멀 LLM 트레이닝 하네스다 **[1]**. 단일 GPU 노드에서 토크나이제이션부터 프리트레이닝, 파인튜닝, 평가, 추론, 챗 UI까지 전부 돌아간다. 핵심 컨셉은 간단하다: 2019년에 약 $43,000 들었던 GPT-2 학습을, 8xH100 노드에서 2시간, 약 $48에 재현하는 것.

프로젝트는 "Time to GPT-2" 리더보드를 운영한다. GPT-2 수준의 성능(DCLM CORE 점수)에 도달하는 벽시계 시간을 경쟁하는 방식이다. 1월 baseline이 3시간, 데이터셋 변경으로 2시간까지 내려왔다 **[1]**.

## 2일간의 자율 실험

3월 9일, 리더보드에 새 엔트리가 올라왔다. **1.80시간**. 직전 기록 2.02시간에서 11% 단축. 커밋 메시지가 말해준다 **[2]**:

> *"All of these improvements were developed by Claude running autonomous."*

Karpathy가 한 건 에이전트를 켜고 기다린 것뿐이다. Claude가 depth=12 모델을 대상으로 약 2일간 자율 실행되며 약 700개의 변경을 실험했고, 그중 ~20개가 실제로 validation loss를 개선했다. 더 놀라운 건, 이 개선들이 전부 가산적(additive)이었고, 더 큰 모델(depth=24)에도 그대로 전이됐다는 점이다 **[3]**.

## 사람이 놓친 것들

에이전트가 찾아낸 건 사소한 하이퍼파라미터 조정이 아니었다. Karpathy 본인이 놓치고 있던 구조적 문제들이다 **[3]**:

- **QKnorm에 스케일러가 없었다** — attention이 너무 분산되고 있었는데 못 봤다. 에이전트가 q, k에 각각 1.15 멀티플라이어를 삽입했다 **[2]**.
- **Value Embedding에 정규화를 안 걸고 있었다** — Karpathy 본인 표현: "oops"
- **Banded attention이 너무 보수적이었다** — 튜닝을 깜빡했다고.
- **AdamW beta 값이 엉망이었다**
- Weight decay 스케줄, 네트워크 초기화 방식까지 전부 재조정

20년 경력의 전문가가 "이미 꽤 잘 튜닝해놨다"고 생각한 프로젝트에서, 에이전트가 첫 시도만에 이 정도를 뽑아냈다.

## "최종 보스전"

Karpathy는 이렇게 썼다 **[3]**:

> *"모든 프론티어 랩이 이걸 할 것이다. 이건 최종 보스전이다."*

단일 train.py를 튜닝하는 것과 대규모 학습 파이프라인을 튜닝하는 것은 복잡도가 다르다. 하지만 그의 판단은 명확하다 — "그건 그냥 엔지니어링이고, 될 것이다." 에이전트 스웜을 돌리고, 작은 모델에서 유망한 아이디어를 찾아내고, 점점 큰 스케일로 승격시키고, 인간은 선택적으로 가장자리에서 기여한다.

그는 이미 round 2를 시작했고, 멀티 에이전트 협업을 통한 병렬화를 실험 중이다.

## 이게 의미하는 것

여기서 핵심은 "AI가 연구를 대체한다"가 아니다. 아직 이건 ground-breaking research는 아니라고 Karpathy 본인도 인정한다. 하지만 연구의 가장 지루하고 반복적인 부분 — 하이퍼파라미터 탐색, 설정 오류 발견, 실험 결과 기반 다음 실험 설계 — 이 영역이 자동화 가능하다는 걸 보여줬다.

그리고 더 일반적으로: **효율적으로 평가할 수 있는 메트릭이 있는 문제라면, 에이전트 스웜이 autoresearch할 수 있다.** 당신의 문제가 이 범주에 들어가는지 생각해볼 가치가 있다.

$48짜리 GPT-2를 만들던 프로젝트가, AI 연구 자동화의 벤치마크가 됐다.

---

### 🔗 Sources

| # | 출처 | 확신도 |
|---|------|--------|
| 1 | [karpathy/nanochat — GitHub](https://github.com/karpathy/nanochat) | 🟢 Observed |
| 2 | [Autoresearch commit (6ed7d1d)](https://github.com/karpathy/nanochat/commit/6ed7d1d82cee16c2e26f45d559ad3338447a6c1b) (2026-03-09) | 🟢 Observed |
| 3 | [Karpathy — X post](https://x.com/karpathy/status/2031135152349524125) (2026-03-09) | 🟢 Observed |
