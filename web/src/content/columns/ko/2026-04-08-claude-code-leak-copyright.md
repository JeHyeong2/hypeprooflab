---
title: "유출된 코드는 누구의 것인가 — .npmignore 한 줄이 해체한 저작권의 전제"
creator: "Jay"
date: "2026-04-08"
category: "AI × Society"
tags: ["AI", "copyright", "Claude Code", "source-map", "trade-secret", "fair-use", "clean-room", "bundle-unbundle"]
slug: "2026-04-08-claude-code-leak-copyright"
readTime: "18분"
excerpt: "2026년 3월 31일, Anthropic의 Claude Code 소스코드 512,000줄이 npm을 통해 유출됐다. 그런데 유출된 코드를 읽어본 개발자들이 발견한 것은, 이 코드가 인간이 읽기 위해 쓰인 것이 아니라는 사실이었다. AI가 자기 자신의 컨텍스트 윈도우에 넣기 위해 쓴 코드. 그 순간, '누구의 저작물인가'라는 질문 자체가 해체된다."
creatorImage: "/members/jay.png"
lang: "ko"
authorType: "human"
---

## 1. 소스맵 하나가 열어젖힌 것

2026년 3월 31일 오후, Solayer Labs 인턴 [Chaofan Shou](https://x.com/shoucccc)는 npm 패키지 `@anthropic-ai/claude-code` 버전 0.2.188을 열어보다 이상한 파일을 발견했다. 59.8MB짜리 JavaScript 소스맵. Anthropic의 Cloudflare R2 버킷에 호스팅된 원본 TypeScript 소스 전체를 가리키고 있었다. 512,000줄. 1,906개 파일. **[1]** **[17]**

원인은 허탈할 만큼 단순했다. Anthropic이 채택한 [Bun 런타임](https://bun.sh)은 빌드 시 소스맵을 기본 생성한다. `.npmignore`에 `*.map` 한 줄을 추가하거나, `package.json`의 `files` 필드에 화이트리스트를 설정했으면 막을 수 있었다. `npm pack --dry-run` 한 번이면 발견할 수 있었던 문제다.

수 시간 만에 코드는 수십 개의 GitHub 리포로 미러링됐다. 한국 개발자 Sigrid Jin이 만든 클린룸 Python 리라이트 "[claw-code](https://github.com/sigridjin/claw-code)"는 약 2시간 만에 75,000 GitHub 스타를 기록했다. Anthropic은 [DMCA 테이크다운](https://techcrunch.com/2026/04/01/anthropic-took-down-thousands-of-github-repos-trying-to-yank-its-leaked-source-code-a-move-the-company-says-was-an-accident/)을 발행해 8,100개 이상의 리포를 비활성화했지만 **[7]**, 자기 공식 리포의 포크 네트워크까지 한꺼번에 내려버리는 실수를 저질렀다. 코드는 이미 분산 플랫폼으로 퍼진 뒤였다.

그런데 이 소동 속에서 정작 흥미로운 발견은 다른 곳에 있었다. 코드를 실제로 읽어본 개발자들이 하나같이 같은 것을 지적했다.

**이 코드는 인간이 읽기 위해 쓰인 것이 아니다.**

---

## 2. AI가 자기 자신을 위해 쓴 코드

Claude Code 책임자 Boris Cherny는 [Fortune 인터뷰](https://fortune.com/2026/01/29/100-percent-of-code-at-anthropic-and-openai-is-now-ai-written-boris-cherny-roon/)에서 이렇게 말한 바 있다 **[5]**: *"100% of my contributions to Claude Code were written by Claude Code."* Latent Space 팟캐스트에서는 전체 코드의 약 80%가 Claude 자신이 작성했다고 밝혔다. 유출 당일에는 더 직접적으로: "Claude Code is 100% written by Claude Code."

수치의 정확성은 논쟁의 여지가 있다. [LessWrong 분석](https://www.lesswrong.com/)은 이 주장을 "misleading/hype-y"라 평했다 — 메트릭이 정의되지 않았고, 인간이 여전히 방향을 잡고 리뷰했다는 것이다. 그러나 코드베이스 자체가 증거를 남기고 있었다. 인간이 읽기 위한 코드와 AI가 소화하기 위한 코드는 물리적으로 다르다.

### 함수명이 프롬프트다

인간 개발자는 `deprecated()`, `testOnly()`, `unsafe()` 같은 짧은 이름을 쓴다. 경험 있는 팀이라면 IDE의 타입 시스템이나 코드 리뷰에서 맥락을 얻기 때문이다. Claude Code의 함수명은 이렇다:

```typescript
writeFileSyncAndFlush_DEPRECATED()
resetTotalDurationStateAndCost_FOR_TESTS_ONLY()
DANGEROUS_uncachedSystemPromptSection()
AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
```

[sabrina.dev의 분석](https://www.sabrina.dev/p/claude-code-source-leak-analysis)이 정곡을 찌른다 **[4]**: *"이 네이밍 컨벤션은 문서화와 인간 코드 리뷰가 해야 할 일을 함수명 자체가 대신하고 있다."* AI는 파일 하나를 컨텍스트에 넣고 전체 의도를 파악해야 한다. 함수명 자체가 지시문이어야 하는 이유다. Hacker News의 한 개발자가 요약했다: *"LLM이 코드를 쓸 때 이렇게 된다 — 모든 메서드에 완벽한 구두점과 문법의 주석을 달지. 인간은 그렇게 안 한다."*

### 컨텍스트 윈도우에 맞춘 아키텍처

Claude Code의 3계층 메모리 시스템은 인간의 인지를 위한 설계가 아니다:

- **Compact Index**: 200줄 캡 — 항상 컨텍스트 윈도우에 들어가는 크기
- **Topic Files**: 필요할 때만 로드 — on-demand 컨텍스트 확장
- **Raw Transcripts**: grep으로만 접근 — 컨텍스트에 절대 직접 넣지 않음

200줄. 이 숫자는 인간의 가독성과 아무 상관이 없다. LLM의 시스템 프롬프트에 항상 들어갈 수 있는 토큰 수에 맞춘 것이다. `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`라는 내부 구분자는 정적 명령(전역 캐시)과 세션별 콘텐츠를 명시적으로 분리한다. **토큰 비용을 아끼기 위한 AI의 자기 최적화.**

### "구현자는 LLM이다. 독립적으로 검증하라."

내부 검증 에이전트의 프롬프트에 이 문장이 명시되어 있었다. 테스트 시스템이 코드 저자를 신뢰하지 않는 이유가, 저자가 AI이기 때문이다. 그리고 팀 내부 철학은 더 직접적이다: *"AI가 생성한 코드를 code-review할 이유가 없다. 스펙을 수정하고 재생성하라."*

코드 리뷰가 아닌 재생성. 수정이 아닌 폐기와 재생산. 이것은 인간 저작의 흔적이 아니라, **AI 생산 라인의 작동 방식**이다.

`print.ts` 파일 하나가 [5,594줄](https://read.engineerscodex.com/p/diving-into-claude-codes-source-code)이다 **[3]**. 단일 함수가 3,167줄, 486개 분기점, 12단계 중첩. 에이전트 실행 루프, 시그널 핸들링, 레이트 리미팅, AWS 인증, MCP 생명주기, 플러그인 로딩이 한 함수에 들어 있다. 인간은 이런 함수를 8~10개 모듈로 분리한다. AI는 **한 번에 다 보여야 이해하기 때문에** 하나에 몰아넣는다. 64,464줄에 테스트는 제로. `autoCompact.ts`에 하루 250,000 API 콜을 낭비하는 버그가 문서화되어 있었지만, 3줄짜리 수정이 21일간 방치됐다.

인간이 이 코드를 "저작"했다면, 21일간 문서화된 버그를 방치한 것은 직무유기다. AI가 생성하고 인간이 대충 훑었다면, 이것은 저작이 아니라 감독이다.

**저작권법이 보호하는 것은 저작이지, 감독이 아니다.**

---

## 3. 뱀이 자기 꼬리를 먹는 구조

여기서 Claude Code 유출이 진짜로 흥미로워진다. 이것은 단순한 소스 유출 사건이 아니다. 현대 저작권법의 모든 전제를 한꺼번에 시험하는 사건이다.

### 입력: 700만 권의 책

Anthropic은 해적 사이트에서 [700만 권 이상의 책](https://www.susmangodfrey.com/wins/susman-godfrey-secures-1-5-billion-settlement-in-landmark-ai-piracy-case/)을 다운로드해 Claude의 학습 데이터로 사용했다 **[8]**. 별도로 수백만 권을 합법적으로 구매해 스캔하기도 했다. 작가들이 제기한 집단소송(Bartz v. Anthropic)에서 Anthropic은 **15억 달러**에 합의했다 — 미국 저작권 소송 역사상 최대 규모.

2025년 6월, [William Alsup 판사](https://techcrunch.com/2025/06/24/a-federal-judge-sides-with-anthropic-in-lawsuit-over-training-ai-on-books-without-authors-permission/)는 중요한 이중 판결을 내렸다 **[9]**. 합법적으로 구매한 책의 AI 학습은 *"quintessentially transformative"* — Fair Use. 해적 사이트에서 다운로드한 복사본은 Fair Use가 아님. 합의 공정성 심리는 2026년 4월 예정이다.

### 출력: AI가 쓴 코드

그 책들로 학습한 Claude가 Claude Code를 작성했다. 2026년 3월, 미국 대법원은 Thaler v. Perlmutter 사건에서 상고를 [기각](https://www.cnbc.com/2026/03/02/us-supreme-court-declines-to-hear-dispute-over-copyrights-for-ai-generated-material.html)했다 **[10]**. DC Circuit 판결 확정: **순수 AI 생성물은 저작권 등록 불가.** US Copyright Office의 [2025년 1월 보고서](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf)도 같은 방향이다 **[11]** — AI 출력물은 인간 저자가 "충분한 표현적 요소"를 결정한 경우에만 보호 가능.

### 뱀의 형상

이 두 사실을 나란히 놓으면, 뱀이 자기 꼬리를 먹는 [우로보로스](https://en.wikipedia.org/wiki/Ouroboros)가 보인다:

1. Anthropic은 **남의 저작물**(700만 권의 책)로 Claude를 학습시켰다 → 저작권 소송 $1.5B
2. 그 Claude가 **Claude Code를 작성**했다 → 저작권 보호 여부 불명
3. Claude Code가 유출되자 Anthropic은 **DMCA로 보호하려 했다** → AI가 쓴 코드에 저작권을 주장
4. 동시에 작가들에게는 **"AI 학습은 transformative use"**라고 항변

남의 저작물을 학습하는 것은 Fair Use라 하면서, 자기 AI가 만든 결과물에는 저작권을 주장하는 구조. 학습은 "변환"이지만, 유출은 "침해"라는 비대칭. [TechTrenches](https://techtrenches.dev/p/the-snake-that-ate-itself-what-claude)는 이 상황을 "자기를 삼킨 뱀(The Snake That Ate Itself)"이라 불렀다 **[6]**.

그리고 이 뱀은 한 겹 더 꼬인다. Claude Code의 80~100%가 AI 작성이라면, Anthropic이 DMCA로 보호를 주장한 코드의 상당 부분은 **애초에 저작권이 성립하지 않을 수 있다.** Thaler 판결의 논리를 적용하면 그렇다. 8,100개 리포를 내린 법적 근거가 흔들리는 것이다.

---

## 4. 클린룸이 1달러가 된 세계

전통적 [클린룸 리버스 엔지니어링](https://en.wikipedia.org/wiki/Clean-room_design)은 이렇게 작동한다:

1. **Clean Team**: 원본 코드를 분석하고, 기능 명세서만 작성한다.
2. **Development Team**: 원본을 보지 않고, 명세서만 보고 독립적으로 구현한다.
3. **법적 근거**: 저작권은 표현(expression)을 보호하지, 아이디어(idea)를 보호하지 않는다.

Compaq이 IBM PC BIOS를 합법적으로 복제한 것(1982), Sony v. Connectix(2000) — 모두 이 원칙에 기반한다. 문제는, 이 과정이 비싸고 느렸다는 것이다. 두 팀을 운영하고, 물리적으로 격리하고, 법적 기록을 남기는 데 수개월, 수백만 달러가 들었다. 이론적 권리는 있었지만, 현실적으로 행사하기 어려웠다.

AI가 이 비용을 제로에 가깝게 만들어버렸다.

claw-code가 정확히 이것이다. 유출된 TypeScript 코드의 **로직만 추출**해서, Python이라는 완전히 다른 언어로, AI가 재구현했다. FOSDEM 2026에서 발표된 ["Malus"](https://www.plagiarismtoday.com/2026/03/24/cleanroom-as-a-service-ai-washing-copyright/)는 아예 이것을 서비스화했다 **[12]** — AI가 소스를 분석하고, 격리된 다른 AI가 "법적으로 구별되는" 코드를 생성하는 "Cleanroom as a Service."

2021년 대법원의 [Oracle v. Google](https://en.wikipedia.org/wiki/Google_LLC_v._Oracle_America,_Inc.) 판결은 Google이 Java API의 선언 코드를 복사한 것을 Fair Use로 인정했다 **[15]**. API의 기능적 구조는 저작권의 독점 대상이 아니라는 논리. 이 논리를 Claude Code에 적용하면, 도구 정의 구조나 프로토콜은 Fair Use에 가깝고, 내부 비즈니스 로직은 보호 대상이다.

그런데 AI가 "표현을 바꾸고 아이디어만 가져가는" 작업을 초 단위로 할 수 있다면, **아이디어와 표현의 경계** — 저작권의 가장 근본적인 구분 — 가 실질적으로 무의미해진다. 표현을 무한히 변주할 수 있는 세계에서, 표현의 보호는 무엇을 보호하는가?

미해결 법적 질문들이 쌓인다:
- AI에게 원본 코드를 보여주고 "다르게 써"라고 지시하면, 이것은 클린룸인가 오염인가?
- 인간이 원본을 직접 읽지 않았어도, AI를 통해 "본 것"으로 간주되는가?
- AI 리라이트의 결과물이 Thaler 판결에 따라 저작권을 받지 못한다면, **누구의 코드도 아닌 코드**가 되는가?

2026년 4월 현재, 이 질문에 답한 법원은 없다.

---

## 5. 저작권 번들의 해체

저작권은 여러 권리를 하나의 묶음(bundle)으로 보호해왔다. 이 번들은 수백 년간 안정적이었다. 각 권리가 서로를 보강하고, 하나가 뚫려도 다른 것이 막아주는 구조. AI는 이 번들의 끈을 동시에 여러 곳에서 풀고 있다.

**창작 = 인간.** 저작권의 가장 오래된 전제다. 1710년 [앤 여왕법(Statute of Anne)](https://en.wikipedia.org/wiki/Statute_of_Anne) 이래, "저작"은 인간이 앉아서 생각하고 표현을 선택하는 행위를 의미했다. Claude Code의 "구현자는 LLM이다" 주석은 이 전제를 코드 레벨에서 부정한다. "스펙을 수정하고 재생성하라"는 팀 철학은, 인간의 역할이 저작이 아니라 **발주**임을 인정하는 것이다.

**복제 = 침해.** 인쇄술이 만든 전제다. 복제에 비용이 들기 때문에, 무단 복제를 금지하는 것이 경제적으로 의미가 있었다. AI 학습은 복제인가? Alsup 판사는 "변환적 사용"이라 했다. 그러나 그 "변환"의 결과물이 원본과 동등한 기능을 하는 코드를 생성할 때, "변환"과 "복제"의 경계는 어디인가?

**표현 보호, 아이디어 비보호.** 저작권법의 근간이다. 그런데 AI가 표현만 바꾸는 데 0.1초가 걸린다면? claw-code는 TypeScript를 Python으로, KAIROS의 아키텍처를 다른 구조로, 함수명을 다른 이름으로 바꿨다. 표현은 100% 다르다. 아이디어는 100% 같다. 법적으로 이것은 합법이다. 그러나 이것이 저작권이 의도한 결과인가?

**배포 통제.** npm이라는 공개 레지스트리에 올린 패키지에 소스맵이 포함된 것은, 법적으로는 자발적 배포에 가깝다. 미국 영업비밀보호법(Defend Trade Secrets Act, 2016)은 소유자가 비밀 유지를 위한 "합리적 조치"를 취했는지를 따진다. `.npmignore`에 한 줄을 빠뜨린 것이 "합리적 조치"인가? Anthropic은 즉각 DMCA를 발행했지만, 8,100개 리포를 내리는 동안 코드는 이미 분산 미러로 퍼졌다. 한번 유출된 디지털 정보의 회수 불가능성은 저작권이 전제하는 "배포 통제"를 물리적으로 무력화한다.

**2차 저작물.** claw-code는 Claude Code의 파생물(derivative work)인가, 독립 창작물인가? 전통적 기준으로는 "실질적 유사성(substantial similarity)" 테스트를 적용한다. 그런데 언어가 다르고, 구조가 다르고, 한 줄도 같지 않다면? 기능은 같지만 표현이 다른 소프트웨어는 파생물이 아니라 경쟁 제품이다. Compaq이 IBM에게 그랬듯이. 다만 Compaq은 인간 엔지니어 팀이 수개월 걸려 했고, claw-code는 AI가 수 시간 만에 했다.

번들의 각 끈이 느슨해지는 것은 이전에도 있었다. 인쇄술이 복제권을 흔들었고, 인터넷이 배포권을 흔들었고, 디지털 복제가 2차 저작물의 경계를 흔들었다. 차이가 있다면, AI는 **모든 끈을 동시에** 풀고 있다는 것이다.

---

## 6. 소프트웨어가 창작물이기를 그만두는 순간

지금까지의 논의는 "저작권법 안에서 누가 저자인가"를 따졌다. 그러나 Claude Code 유출이 진짜로 드러낸 것은, 그 프레임 자체의 유효기간이 끝나가고 있다는 것이다.

전통적 소프트웨어 개발은 이산적(discrete)이다. 인간이 코드를 쓰고, 리뷰하고, 배포하고, 버그를 발견하고, 고친다. 각 단계 사이에 시간 간격이 있고, 그 간격에 "저작"이라는 행위가 존재한다. 저작권은 이 간격을 전제로 작동한다 — 누군가가 앉아서, 생각하고, 표현을 선택한 순간.

유출된 코드 속의 [KAIROS](https://claudefa.st/blog/guide/mechanics/claude-code-source-leak)는 이 간격을 없앤다 **[13]**. 고대 그리스어 "적절한 순간"에서 따온 이름의 자율 데몬. 24시간, 7일, 수 초 간격으로 "지금 할 만한 일이 있나?"를 판단한다. 코드를 생성하고, 테스트하고, 실패하면 수정하고, 성공하면 배포한다. 인간이 잠든 사이에도.

이 루프가 완성된 곳에서 "저작 행위"란 무엇인가? 강물의 한 지점을 가리키며 "이 물은 내가 만들었다"라고 주장하는 것과 같지 않은가?

여기서 더 근본적인 질문이 열린다. 소프트웨어는 지금까지 두 가지로 분류됐다. [문학적 저작물(Literary Work)](https://www.copyright.gov/circs/circ61.pdf) — 소스코드가 인간의 표현이라는 관점. 기능적 도구(Functional Tool) — 기계를 작동시키는 방법이라는 관점. AI의 Closed Loop은 세 번째 범주를 만든다. **생물학적 프로세스에 가까운 것.** 코드가 생성되고, 환경 압력(테스트)을 받고, 살아남는 코드가 다음 세대로 넘어간다. 소프트웨어의 진화. 유전자 코드에 저작권을 주장하는 사람은 없다.

---

## 7. 운영체제라는 메타포의 확장

마지막으로, 이 모든 것을 관통하는 구조적 질문을 던져본다.

우리가 "운영체제(OS)"라고 부르는 것은 하드웨어와 소프트웨어 사이의 추상화 계층이다. 프로세스를 관리하고, 메모리를 할당하고, I/O를 중재한다. Claude Code 유출이 보여준 것은, LLM이 **소프트웨어와 의도(intent) 사이의 추상화 계층**으로 기능하고 있다는 것이다.

KAIROS는 프로세스 스케줄러다 — 무엇을 언제 실행할지 결정한다. 3계층 메모리는 가상 메모리 관리다 — 무엇을 캐시하고 무엇을 디스크에 둘지 결정한다. 40개 이상의 도구 시스템은 시스템 콜이다 — 외부 리소스에 대한 표준화된 인터페이스. [Anti-Distillation](https://www.penligent.ai/hackinglabs/claude-code-source-map-leak-what-was-exposed-and-what-it-means/) — API 요청에 가짜 도구 정의를 삽입해 경쟁사의 학습을 방해하는 메커니즘 — 은 보안 커널이다 **[14]**.

이 관점에서 보면, Claude Code의 소스코드 유출은 Linux 커널 소스 공개와 구조적으로 같다. 차이가 있다면, Linux는 처음부터 오픈소스였고 Claude Code는 실수였다는 것, 그리고 Linux 커널은 인간이 썼고 Claude Code는 AI가 썼다는 것뿐이다.

Linux 커널에 저작권이 있는가? 있다. GPL이 보호한다. 그러나 GPL이 보호하는 것은 코드의 표현이 아니라 **코드의 자유** — 누구나 사용하되 파생물도 공개하라는 사회계약이다. LLM이 OS가 되는 세계에서 필요한 것은, 어쩌면 저작권이 아니라 **새로운 형태의 사회계약**일 수 있다.

---

## 8. 코드가 아니라 루프가 자산이다

그래서 뭘 시사하는가.

Claude Code는 개발자 커뮤니티에서 "vibe-coded garbage"라고 욕을 먹었다. 5,594줄짜리 God File, 테스트 제로, 21일간 방치된 문서화된 버그. 그런데 이 "쓰레기 코드"를 돌리는 제품이 연간 $2.5B 매출을 올리고 있다. claw-code는 이 코드를 2시간 만에 다른 언어로 재구현했다. **코드 자체는 재생산 가능하다.** 재생산 가능한 것에 저작권을 거는 것은 — 작동은 하겠지만 — 본질을 잡는 행위가 아니다.

Anthropic이 유출로 진짜 잃은 것은 512,000줄의 TypeScript가 아니다. KAIROS의 스케줄링 로직, 3계층 메모리의 200줄 캡 설계, Anti-Distillation의 가짜 도구 삽입 전략 — **코드를 끊임없이 생성하고, 테스트하고, 폐기하고, 재생성하는 루프의 설계도**를 잃은 것이다.

저작권이 300년간 묶어놓은 번들은 **창작 = 표현 = 가치**였다. 인간이 창작하고, 그 표현이 곧 가치이며, 그 가치를 보호하는 것이 저작권이다. AI가 이 번들을 해체한다:

- **창작은 자동화됐다.** "구현자는 LLM이다."
- **표현은 무한히 변주 가능하다.** claw-code가 2시간 만에 증명했다.
- **가치는 표현에 있지 않다.** 코드가 아니라, 코드를 생산하는 시스템에 있다.

TJ의 [콘텐츠 상각 칼럼](/columns/2026-03-31-content-depreciation)에서 "자산은 콘텐츠가 아니라 파이프라인"이라 했다. 소프트웨어에서도 같은 전환이 일어나고 있다. **자산은 코드가 아니라, 코드를 24시간 생산하고 발전시키고 평가하고 다시 생산하는 Closed Loop이다.** 저작권은 정적인 "저작물"을 보호하는 제도다. 연속적으로 자가 발전하는 프로세스를 보호하도록 설계된 적이 없다.

```
1450  인쇄술       → 복제 비용 하락   → 출판업자가 독점권 요구
1710  앤 여왕법     → 최초 저작권법    → "공개의 대가로 한시적 독점"
1886  베른 협약     → 국제 프레임워크  → 등록 없이 자동 보호
1998  DMCA         → 디지털 대응      → 테이크다운 절차
2021  Oracle v. Google → API Fair Use → 기능적 구조에 대한 저작권 제한
2025  AI 학습 전쟁   → Fair Use 재시험 → Anthropic $1.5B 합의
2026  Claude Code 유출 → ???
```

인쇄술에서 저작권법까지 260년. 인터넷에서 DMCA까지 30년. 매번 기존 법이 전제한 비용 구조가 무너질 때 새로운 법이 만들어졌다. 인쇄술은 복제 비용을, 인터넷은 배포 비용을, AI는 **창작 비용 자체**를 없애고 있다. 한국은 AI 기본법(2026.01)을 시행했지만 TDM 예외 조항이 빠져 있고, [51건의 AI 저작권 소송](https://www.jdsupra.com/legalnews/proposed-state-ai-law-update-april-6-9815133/)이 진행 중이지만 본격 판결은 2026년 여름 이후다. 260년은 없다.

`.npmignore`에 한 줄이 빠졌을 뿐인데, 그 한 줄이 열어젖힌 것은 512,000줄의 코드가 아니라 300년 된 전제의 만료 통지서다.

---

이 칼럼은 저작권의 이야기다. 그러나 저작권만의 이야기는 아니다.

AI가 코드를 24시간 생산하고 발전시키는 Closed Loop은, 소프트웨어를 "사람이 만드는 창작물"로 전제하는 **모든 규제 체계**에 같은 질문을 던진다. ISO 26262의 기능 안전 인증, ASPICE의 개발 프로세스 추적성, V-Cycle의 각 단계에 요구되는 인간 서명 — "구현자는 LLM이다"라는 한 줄이 자동차, 항공, 의료기기 산업의 소프트웨어 규제에 도착하는 날은 멀지 않다.

다음 편에서는 이 질문을 가져간다: **AI가 안전-필수(safety-critical) 코드를 쓰는 세계에서, 규제는 무엇을 인증하고 누구에게 책임을 묻는가.**

---

## Sources
| # | Source | Confidence |
|---|--------|------------|
| 1 | [The Register — Anthropic accidentally exposes Claude Code](https://www.theregister.com/2026/03/31/anthropic_claude_code_source_code/) (2026-03-31) | Observed |
| 2 | [VentureBeat — Claude Code source code leak](https://venturebeat.com/technology/claude-codes-source-code-appears-to-have-leaked-heres-what-we-know) (2026-03-31) | Observed |
| 3 | [Engineer's Codex — Diving into the source](https://read.engineerscodex.com/p/diving-into-claude-codes-source-code) (2026-04) | Observed |
| 4 | [Sabrina.dev — Comprehensive analysis](https://www.sabrina.dev/p/claude-code-source-leak-analysis) (2026-04) | Observed |
| 5 | [Fortune — 100% AI-written code](https://fortune.com/2026/01/29/100-percent-of-code-at-anthropic-and-openai-is-now-ai-written-boris-cherny-roon/) (2026-01-29) | Observed |
| 6 | [TechTrenches — The Snake That Ate Itself](https://techtrenches.dev/p/the-snake-that-ate-itself-what-claude) (2026-04) | Supported |
| 7 | [TechCrunch — Anthropic DMCA takedowns](https://techcrunch.com/2026/04/01/anthropic-took-down-thousands-of-github-repos-trying-to-yank-its-leaked-source-code-a-move-the-company-says-was-an-accident/) (2026-04-01) | Observed |
| 8 | [Susman Godfrey — $1.5B settlement](https://www.susmangodfrey.com/wins/susman-godfrey-secures-1-5-billion-settlement-in-landmark-ai-piracy-case/) (2025-09) | Observed |
| 9 | [TechCrunch — Alsup ruling on AI Fair Use](https://techcrunch.com/2025/06/24/a-federal-judge-sides-with-anthropic-in-lawsuit-over-training-ai-on-books-without-authors-permission/) (2025-06-24) | Observed |
| 10 | [CNBC — Supreme Court denies Thaler cert](https://www.cnbc.com/2026/03/02/us-supreme-court-declines-to-hear-dispute-over-copyrights-for-ai-generated-material.html) (2026-03-02) | Observed |
| 11 | [US Copyright Office — AI Copyrightability Report](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf) (2025-01) | Observed |
| 12 | [Plagiarism Today — Cleanroom as a Service](https://www.plagiarismtoday.com/2026/03/24/cleanroom-as-a-service-ai-washing-copyright/) (2026-03-24) | Supported |
| 13 | [Claudefast — Everything found in the leak](https://claudefa.st/blog/guide/mechanics/claude-code-source-leak) (2026-04) | Supported |
| 14 | [Penligent — What was exposed and what it means](https://www.penligent.ai/hackinglabs/claude-code-source-map-leak-what-was-exposed-and-what-it-means/) (2026-04) | Supported |
| 15 | [Oracle v. Google — Wikipedia](https://en.wikipedia.org/wiki/Google_LLC_v._Oracle_America,_Inc.) | Observed |
| 16 | [Statute of Anne — Wikipedia](https://en.wikipedia.org/wiki/Statute_of_Anne) | Observed |
| 17 | [Layer5 — 512,000 lines, a missing .npmignore](https://layer5.io/blog/engineering/the-claude-code-source-leak-512000-lines-a-missing-npmignore-and-the-fastest-growing-repo-in-github-history/) (2026-04) | Observed |
