---
title: "법과 돈이 만든 구조, AI가 바꾸는 구조 — 자동차 번들의 해체"
creator: "Jay"
creatorImage: "/members/jay.png"
date: 2026-03-27
category: "Industry Analysis"
tags: ["automotive", "SDV", "unbundling", "AI", "middleware", "regulation", "supply-chain", "OEM", "Tier-1"]
slug: "2026-03-27-automotive-unbundling"
readTime: "25분"
excerpt: "리콜 나면 누가 돈 내느냐 — 이 질문이 자동차 산업의 모든 구조를 결정한다. Evans의 번들/언번들 프레임이 자동차에서는 왜 절반만 맞는지, 그리고 AI가 이 구조를 어떻게 바꾸고 있는지."
lang: "ko"
authorType: "creator"
---

## 1. 한 차종, 세 리콜, 세 개의 완전히 다른 팀

2026년 3월, [현대 팰리세이드에서 세 건의 리콜이 동시에 터졌다](https://www.hyundainews.com/releases/4724).

전동시트 결함으로 [미국·캐나다 69,000대 + 한국 58,000대](https://www.edmunds.com/car-news/hyundai-palisade-kia-telluride-rear-seat-recall.html). [계기판 디스플레이가 꺼지는 소프트웨어 버그](https://www.cars.com/articles/84000-plus-hyundais-kias-recalled-for-instrument-panel-displays-521035/). [안전벨트 버클 결함 568,000대](https://www.cars.com/research/hyundai-palisade/recalls/). 한 차종, 세 리콜, 세 개의 완전히 다른 팀.

시트팀은 시트를 소유한다. 전장팀은 계기판을 소유한다. 벨트팀은 벨트를 소유한다. 각자의 Tier-1 서플라이어가 있고, 각자의 워런티 적립금이 있고, 각자의 Type Approval 문서가 있다.

전동시트 리콜은 전통적 부품 결함에 가깝다. 시트팀이 책임지면 된다. 하지만 계기판 디스플레이 리콜은 성격이 다르다. 이건 소프트웨어 버그이고, OTA로 수정이 가능하며, "부품 교체" 패러다임에 맞지 않는다.

더 본질적인 질문은 이것이다: 차량에 수십 개 ECU가 연결되어 있을 때, OTA로 한 ECU의 소프트웨어를 업데이트하면 다른 ECU에 무슨 일이 일어나는가? 현재의 부품 중심 silo에서, 각 ECU 담당팀은 자기 ECU의 검증만 책임진다. **ECU 간 상호작용의 검증은 구조적 맹점이다.** 브레이크팀은 브레이크 ECU의 워런티를 소유하지만, 다른 도메인의 업데이트가 브레이크 ECU에 미치는 영향은 누구의 워런티인가?

OEM에 차량용 미들웨어와 AI 플랫폼을 납품하는 일을 하면서, 이 질문에 매일 부딪힌다. 우리가 만드는 소프트웨어는 부품 경계를 넘어 차량 전체의 데이터를 다룬다. 하지만 우리가 들어가야 하는 서플라이 체인은 부품 단위로 잘려 있다. **기술은 수평이고, 구조는 수직이다.** 그리고 이 일을 시작하고 가장 먼저 배운 건 기술이 아니었다 — **"리콜 나면 누가 돈 내느냐"가 모든 구조를 결정한다**는 것이었다.

---

## 2. 번들/언번들, 그리고 자동차의 특수성

[Benedict Evans](https://www.ben-evans.com/)는 20년간 테크 산업의 구조 변동을 분석해온 독립 애널리스트다. [Andreessen Horowitz(a16z)](https://a16z.com/author/benedict-evans/)에서 6년간 파트너로 일했고, 현재는 반기별 매크로 트렌드 프레젠테이션을 발표한다.

[The Great Unbundling(2020)](https://www.ben-evans.com/presentations)에서 그가 추적하는 패턴은 단순하다: **배포 수단이 바뀔 때마다 기존 번들이 해체(unbundle)되고, 새로운 승자가 다른 축으로 재결합(re-bundle)한다.** 케이블 TV가 채널을 묶었다. 인터넷이 해체했다. Netflix가 다시 묶었다. 은행이 금융을 묶었다. 핀테크가 해체했다. 슈퍼앱이 다시 묶고 있다.

Evans는 이후 [The New Gatekeepers(2022)](https://www.ben-evans.com/presentations)에서 해체 이후 누가 새로운 독점을 형성하는지를, [Unbundling AI(2023)](https://www.ben-evans.com/benedictevans/2023/10/5/unbundling-ai)에서 LLM이 Excel처럼 범용 도구에서 전문 도구로 분화될 것이라는 예측을, 그리고 [AI Eats the World(2025)](https://www.ben-evans.com/presentations)에서 "AI 스타트업들이 Google, Excel, 이메일, Oracle... 그리고 ChatGPT를 해체하려 한다"는 분석을 내놓았다.

한국에서는 [노정석 대표](https://www.syncly.kr/blog/251119seminar-bfactory)(비팩토리)가 [AI Frontier EP91(2026.3.21)](https://aifrontier.kr/ko/episodes/ep91/)에서 이 프레임을 AI 시대의 비즈니스에 적용했다. 두 가지 핵심 테제:

1. **"모든 문제가 computational search로 수렴한다"** — 인간이 직접 풀던 문제를 AI가 탐색 공간에서 컴퓨팅으로 푼다. 핵심은 "non-verifiable을 verifiable로 전환할 수 있는 환경을 소유하느냐"다.
2. **"1/10x efficiency가 아니라 10x new business"** — 대부분의 AI Transformation은 비용을 100에서 10으로 줄이는 데 집중한다. 하지만 진짜 기회는 900의 새로운 가치를 만드는 것이다.

자동차 산업에서도 같은 일이 일어나고 있다. **다만 Evans의 프레임을 자동차에 그대로 적용하면 절반만 맞는다.** 케이블 TV, 은행, 미디어의 번들은 편의와 유통 장악력으로 만들어졌다. 인터넷이라는 새로운 배포 수단이 등장하자 비교적 빠르게 해체됐다 — 규제 허가나 안전 인증이 필요 없었기 때문이다.

자동차의 번들은 다르다. **법과 돈과 정치가 설계한 구조다.** 미디어 번들을 해체하는 데는 스트리밍 플랫폼 하나면 됐지만, 자동차의 부품 중심 번들을 해체하려면 제조물책임법, 형식 승인 제도, 워런티 회계 기준, 노동위원회 협상까지 동시에 움직여야 한다. Evans의 패턴 — "배포 수단이 바뀌면 번들이 해체된다" — 은 자동차에서도 작동하지만, **해체의 속도는 기술이 아니라 법과 제도가 결정한다.** 그래서 자동차의 언번들링은 미디어처럼 5년이 아니라 15-20년짜리 프로세스가 될 가능성이 높다.

또한 해체의 경로도 다르다. 미디어에서는 콘텐츠가 유통에서 분리되었다. 자동차에서는 소프트웨어가 하드웨어에서 분리되고 있지만, 안전 관련 SW는 물리적 부품의 Type Approval에 묶여 있어서 완전한 분리가 법적으로 불가능하다. **해체는 일어나되, "완전한 해체"에는 법적 상한선이 있다** — 이것이 Evans 프레임이 자동차에서 수정되어야 하는 핵심이다.

---

## 3. Tier 구조는 기술적 분업이 아니라 책임의 분배 체계다

자동차 서플라이 체인은 겉보기에 단순하다:

**Tier-3 (소재)** → **Tier-2 (부품)** → **Tier-1 (시스템)** → **OEM (브랜드)**

이 체인을 "누가 뭘 만드느냐"로 읽으면 절반만 본 것이다. **진짜 질문은 "리콜이 나면 누가 돈을 내느냐"다.**

미국의 strict liability, EU의 Product Liability Directive, 한국의 제조물책임법 — 전부 물리적 부품에 책임을 부착한다. 이것이 OEM 내부에 "브레이크팀", "파워트레인팀", "전장팀"이라는 silo가 존재하는 첫 번째 이유다. 조직도가 BOM(Bill of Materials)을 따라간다. Type Approval(형식 승인)도 같은 구조를 강화한다 — UNECE R13H(제동), R48(등화), R155(사이버보안), 규제 하나당 담당 팀 하나.

소프트웨어 회사가 이 체인에 진입할 때, 가장 먼저 결정해야 하는 건 기술 아키텍처가 아니다. **무한책임(product liability)을 누가 지느냐**다. OEM에 직접 납품하면 무한책임이 따라온다. 연 매출 $10M의 스타트업이 $48억 규모의 리콜 책임 체인에 들어가는 건 존재론적 리스크다. 그래서 대부분의 자동차 소프트웨어 회사는 대기업을 법적 버퍼로 사이에 둔다. 매출 구조 자체가 이 법적 아키텍처 위에 세워진다.

나도 마찬가지다. 기술적으로는 OEM의 아키텍처에 관여하지만, 계약적으로는 대형 파트너를 통해 연결된다. **기술적 포지션과 법적 포지션이 일치하지 않는 것** — 이게 자동차 SW 업계의 현실이다.

---

## 4. Silo를 지탱하는 다섯 개의 기둥

OEM의 부품 중심 조직 구조는 단순한 관성이 아니다. 다섯 개의 구조적 기둥이 이걸 합리적 균형점으로 만든다.

### 기둥 1: 자본배분 — 차량 프로그램이 돈의 단위

차량 프로그램(예: 투싼 NX4, 골프 MQB-evo)은 $10억~$30억의 개발 투자와 $20억~$50억의 생산 설비 투자를 수반한다. "공유 소프트웨어 플랫폼"이 여러 프로그램을 가로지르면 근본적 질문이 생긴다: **어느 프로그램 예산에서 이 비용을 내는가?**

VW의 CARIAD가 [€50억짜리 교훈](https://www.autocar.co.uk/car-news/business-tech-development/vw-spent-over-%E2%82%AC50-billion-failed-cariad-software-unit)이다. 내부 이전가격(transfer pricing) 합의가 안 됐다. VW, Audi, Porsche, Škoda 각 브랜드가 "왜 우리가 다른 브랜드 SW 비용을 부담하느냐"고 물었고, 답은 끝내 나오지 않았다. CEO는 2회 교체됐고, 전략 차량 Trinity는 2년 이상 지연됐다. VW는 결국 [Rivian에 $50억을 투자](https://www.investing.com/news/stock-market-news/)해서 외부에서 사왔다 — 내부 구축 5년의 실패를 인수로 우회한 것이다. 모든 멀티브랜드 OEM 그룹 — 현대차그룹, Toyota, Stellantis(14개 브랜드) — 이 동일한 구조적 질문에 직면한다.

### 기둥 2: 워런티 — 변화 자체가 재무 리스크

[Ford의 연간 워런티 비용은 약 $48억](https://www.reuters.com/business/autos-transportation/), 대당 $2,800이다. 현대기아는 2023년 Theta II 엔진 리콜로 [$39억을 일시 충당](https://www.businesskorea.co.kr/news/)했다. 워런티는 OEM 재무제표에서 가장 예측 불가능한 항목이며, 한 번의 대규모 리콜이 분기 실적을 뒤집을 수 있다.

이 비용은 부품 카테고리별 과거 클레임 비율로 적립된다. 이 구조가 만드는 인센티브는 명확하다: **검증된 설계를 절대 바꾸지 마라.** SW팀이 OTA로 회생제동 로직 변경을 제안하면, 브레이크팀의 첫 반응은 "내 워런티 적립금으로 실험하지 마라"다. 재보험 구조도 같은 방향을 밀어붙인다 — 차량 아키텍처가 바뀌면 과거 failure rate 데이터가 무효가 되고, 보험료가 폭등하거나 인수를 거부당한다. **아키텍처 전환의 숨겨진 비용은 재보험료에 있다.**

팰리세이드로 돌아오면: 전동시트 리콜과 안전벨트 리콜은 각각 다른 부품팀의 적립금에서 차감된다. 하지만 OTA로 수정되는 계기판 SW 결함은? 어느 팀의 적립금에서 나가는가? SW 업데이트가 복수 부품에 영향을 미치는 결함은 기존 워런티 회계 모델에 맞지 않는다.

### 기둥 3: 공급계약 — 5-7년의 구조적 관성

Tier-1 공급계약은 NRE(비반복 엔지니어링비, $500만~$5,000만) + 대당 단가(5-7년 고정, 연 1-3% 원가절감)로 구성된다. 중간에 서플라이어를 교체하면: NRE 매몰비용 상각, 새 NRE 지급, 재검증 6-18개월, Type Approval 재신청, 워런티 책임 전환 협상, 물량 미달 위약금(수천만 달러). 브레이크팀은 Continental과 사실상 결혼한 상태다 — 팀의 프로세스, 테스트 프로토콜, 마일스톤 리뷰가 전부 해당 서플라이어에 최적화되어 있다.

### 기둥 4: 지배구조 — 법인 경계가 곧 조직 경계

대형 OEM 그룹은 복수의 상장/비상장 법인으로 구성된다. 현대차그룹만 해도 현대자동차(상장), 기아(상장, 현대차 34% 보유), 현대모비스(상장, 기아 21% 보유), 현대오토에버(상장, 현대차 50%), 42dot(비상장, 현대차 100%) — 각각이 별도 법인이다. 모비스의 SW팀과 현대차의 전장팀을 합치려면 관계사 거래 심사, 소수주주 보호, 공정거래위 심사를 거쳐야 한다. VW에서는 감독이사회 50%가 IG Metall 등 노동자 대표이므로 조직 개편 자체가 노동위원회 협상 대상이다.

스타트업을 인수해도 통합은 어렵다. 스타트업의 2주 스프린트와 OEM의 18개월 게이트 리뷰는 케이던스가 물리적으로 안 맞고, 법인이 다르면 강제할 수도 없다. Toyota의 Woven Planet, GM의 Cruise, VW의 CARIAD — 모두 같은 통합 난제에 부딪혔다.

### 기둥 5: 시장별 규제 파편화

같은 ESC 시스템도 미국(FMVSS 126)과 EU(UNECE R140)의 테스트 절차가 다르다. 데이터 규제는 더 심하다. 중국은 차량 데이터가 국외로 나갈 수 없다. EU는 2025년 9월부터 차주가 제3자에게 데이터 공유를 요구할 수 있다. 미국은 연방 차원의 차량 데이터 법이 없다. 한국은 on-prem 처리를 선호한다. 동일 OEM이 5개 시장에서 5개의 다른 데이터 정책을 준수해야 한다.

내가 일하면서 체감하는 건 이것이다: **Silo는 무능의 산물이 아니라, 이 다섯 기둥이 만든 균형점이다.** 그래서 "Silo를 부수겠다"는 접근은 실패한다.

---

## 5. 세 가지 힘이 번들을 흔든다

다섯 개의 기둥은 여전히 서 있다. 하지만 세 가지 힘이 기둥 위에 올려진 번들을 흔들고 있다.

### 해체 1: Tier-1의 블랙박스

전통적으로 Tier-1은 HW + SW + 진단 + 데이터를 하나의 ECU로 묶어 납품했다. OEM은 안을 볼 수 없었고, 볼 필요도 없었다. SDV 전환은 이 번들을 해체한다 — OEM이 차량 전체의 소프트웨어를 통합 관리하려면 개별 ECU의 SW에 접근해야 한다. "이 칩을 쓰면 이 SW를 써야 한다"는 등식이 깨지고 있다.

하지만 Tier-1에게 블랙박스는 마진의 원천이다. SW를 분리하면 HW는 commodity가 되고, 마진은 SW 플랫폼으로 이동한다. Bosch, Continental, Denso가 자체 SW 플랫폼(Eclipse SDV, EB corbos)에 투자하는 이유는 이 마진 이동을 자기 안에서 일으키기 위해서다.

### 해체 2: OEM의 데이터 독점

OEM은 자기 차에서 나오는 데이터를 독점해왔다. 딜러만 진단 데이터에 접근할 수 있고, 독립 정비소는 제한된 OBD-II 데이터만 본다. [EU Data Act(2025.9 시행)](https://eur-lex.europa.eu/eli/reg/2023/2854)가 이 독점을 법적으로 해체한다. 차주가 원하면 제3자에게 데이터를 공유할 수 있다. EU는 나아가 차량 데이터 중개 플랫폼("neutral server")에 관한 별도 규제를 2026년에 제안할 예정이다. Right to Repair 법안도 같은 방향이다. $3,000억 규모의 글로벌 독립 정비 시장이 디지털 진단 도구에 열린다.

### 해체 3: 지정학이 하드웨어를 파편화한다

US-China 칩 수출 통제(2022, 2023, 2024 세 차례)로 중국 OEM은 NVIDIA/Qualcomm에서 이탈하고 있다. Horizon Robotics(2024년 홍콩 IPO, $6.96억 조달), Huawei HiSilicon, Black Sesame 같은 국산 칩으로 이동한다. 비중국 OEM도 중국 시장용 차량에는 국산 칩을 써야 할 수 있다.

결과: **동일 OEM이 시장별로 다른 칩을 쓰는 세계**. 칩이 3종류면 미들웨어가 3배 더 필요한 게 아니라, HW-agnostic 미들웨어 하나가 3배 더 가치 있어지는 것이다.

데이터 주권의 파편화도 같은 구조다. 중국(국외 이전 금지), EU(공유 의무), 미국(연방 규제 부재), 한국(PIPA), 인도(DPDPA 진행 중) — 다섯 가지 정책 환경이 하나의 데이터 인프라에서 config로 전환되어야 한다. 2025년 관세 환경은 OEM의 생산 지리를 빠르게 바꾸고 있고, **생산 지리가 바뀔 때마다 데이터 정책도 바뀐다.**

자동차의 "배포 수단" 변화는 결국 이것이다: **edge-to-cloud 데이터 파이프라인**이 새로운 배포 수단이고, 이 배포 수단 위에서 옛 번들이 해체되고 새 번들이 형성된다.

---

## 6. 재결합 — 새로운 번들의 축

해체된 조각들은 다른 축으로 재결합된다. 하지만 재결합의 메커니즘을 이해하려면, 먼저 **"루프가 닫히는 순간"**이 무엇을 의미하는지 정리해야 한다.

### 닫힌 루프가 만드는 번들

2026년 3월, Andrej Karpathy가 [Autoresearch](https://github.com/karpathy/autoresearch)를 공개했다. 컨셉은 단순하다: AI 에이전트에게 작은 LLM 학습 코드를 주고, 밤새 자율적으로 실험하게 한다. 코드를 수정하고, 5분 학습하고, 결과가 나아졌는지 확인하고, 유지하거나 버리고, 반복한다. 사람은 아침에 일어나서 실험 로그를 확인할 뿐이다. 핵심은 `program.md` — 연구자는 코드를 직접 건드리지 않고, AI 에이전트의 연구 방향을 설정하는 마크다운 파일만 편집한다. Karpathy의 표현: **"you are programming the program."**

이 프로젝트의 진짜 의미는 기술이 아니라 구조에 있다. **평가(eval)를 자동화할 수 있는 순간, 루프가 닫히고, 닫힌 루프는 사람 없이 돌아간다.** `program.md → 코드 수정 → 학습 → eval → keep/discard → 반복`. 사람이 매 단계 개입할 필요가 없어진다. Karpathy가 블랙유머로 쓴 서문이 이를 압축한다: *"연구는 이제 완전히 자율 AI 에이전트 떼의 영역이다. 에이전트들은 코드베이스가 10,205세대라고 주장하지만, 코드는 이미 인간의 이해를 넘어선 자기수정 바이너리가 되어 아무도 그게 맞는지 확인할 수 없다."*

자동차에 대입하면: **수집 → 분석 → 배포 → 모니터링** 루프에서 "이 분석이 맞았는가?"를 자동으로 평가할 수 있는 순간, 이 루프도 닫힌다. 차량이 데이터를 보내고, AI가 진단하고, 결과를 OTA로 배포하고, 배포 후 차량 행동 변화를 측정해서 다시 모델을 업데이트한다. Autoresearch에서 `program.md`가 연구 방향을 설정하듯, 자동차에서는 **안전 정책과 규제 요건이 루프의 `program.md`** 역할을 한다 — 루프가 자율적으로 돌아가되, 어떤 방향으로 돌아가는지는 사람이 정의한다.

**루프가 닫히는 곳에서 재번들이 일어난다.** 이유는 간단하다: 닫힌 루프의 한 조각만 제공하는 회사는 루프 전체를 가진 회사에 종속된다. Bosch가 "수집"만, Continental이 "분석"만, 스타트업이 "배포"만 담당하면 — 루프를 묶는 자(integrator)가 가치를 가져간다. Evans의 언어로: **닫힌 루프 자체가 새로운 번들**이고, 이 번들의 switching cost는 루프를 끊으면 전체가 깨진다는 사실에서 온다.

### 옛 축 vs 새 축

옛 번들의 축은 **부품**이었다. 브레이크 ECU = HW + SW + 진단 + 데이터 + 책임 → 하나의 팀, 하나의 서플라이어. 부품 안에서 모든 것이 통합되고, 부품 사이는 단절되어 있었다.

새 번들의 축은 **데이터 흐름 루프**다:

**수집(Collect)** → **저장(Store)** → **분석(Analyze)** → **배포(Deploy)** → **모니터링(Monitor)** → *(다시 수집으로)*

이 흐름은 부품을 횡단하고, 프로그램을 횡단하고, 시장을 횡단한다. 개별 단계를 따로 사면 도구(tool)다. 루프로 묶으면 **자기 강화 시스템**이 된다 — Autoresearch가 밤새 더 나은 모델을 찾듯, 닫힌 차량 데이터 루프는 스스로 더 나은 진단·예측·배포를 만들어간다.

### Frontier Model이 먹는 부분, 먹지 못하는 부분

이 루프에서 Frontier Model(GPT-5, Claude, Gemini)이 차지하는 영역은 어디인가?

**Frontier가 먹는 영역 — "분석(Analyze)"의 commodity화**. 범용 추론 능력으로 로그 해석, 이상 탐지, 자연어 진단 리포트를 생성한다. OEM이 "GPT-5 API + 자사 차량 데이터"로 직접 진단 시스템을 만들 수 있다면, 전문 진단 AI 플랫폼의 존재 이유가 흔들린다. Karpathy 프레임으로 말하면: Frontier Model은 **eval 함수를 범용화**한다. 도메인별로 만들어야 했던 평가 로직을, 범용 모델이 "이 결과가 정상인가?"를 직접 판단한다.

**Frontier가 먹지 못하는 영역 — 루프의 물리적 접점**. 세 가지다. 첫째, **수집(Collect)**: 차량 내 ECU에서 데이터를 실시간 추출하려면 CAN/Ethernet 프로토콜, AUTOSAR 인터페이스, OEM별 proprietary 신호 정의를 알아야 한다. API 호출로 안 된다. 둘째, **배포(Deploy)**: OTA 업데이트는 UNECE R156 인증, 롤백 메커니즘, ECU별 호환성 검증이 필요하다. "모델을 서버에 올린다"와 "ASIL-D 인증 ECU에 올린다"는 완전히 다른 세계다. 셋째, **모니터링(Monitor)**: 배포 후 차량 행동 변화를 실시간 추적하려면 fleet 규모의 edge 인프라가 필요하다. 클라우드 API로 커버할 수 없다.

**구조적 함의**: Frontier Model은 루프의 **두뇌(분석)**를 commodity화하지만, 루프의 **손발(수집·배포·모니터링)**은 물리적·법적 장벽 때문에 commodity화하지 못한다. 결국 분석 레이어는 가격 경쟁 → 마진 압축. 물리 접점 + 인증 + fleet 인프라가 진짜 moat. "분석만 잘한다"는 미들웨어 회사가 가장 위험하고, **물리 접점을 통제하면서 Frontier를 분석 엔진으로 꽂을 수 있는 회사**가 가장 유리하다.

### Tier-0.5의 진짜 전쟁터

PC 산업에서 Microsoft Windows는 Dell, HP, Lenovo라는 OEM 위에, Intel이라는 부품 아래에 놓인 수평 레이어였다. 자동차에서도 같은 포지션이 형성되고 있다 — 업계 용어로 "Tier-0.5". NVIDIA DRIVE, Qualcomm Digital Chassis, Google Android Automotive가 이 자리를 노린다.

하지만 결정적 차이가 있다. Microsoft는 Windows 버그로 누군가 다쳐도 제조물책임을 지지 않았다. 자동차에서 Tier-0.5 플랫폼의 버그로 사고가 나면 책임 체인에 들어간다. **기술적으로는 플랫폼이지만, 법적으로는 서플라이어다.** 그래서 현실의 Tier-0.5는 대형 파트너를 법적 버퍼로 사이에 두고, 기술적으로는 아키텍처를 정의하면서 계약적으로는 하위 Tier에 머문다.

Tier-0.5의 진짜 전쟁터는 "누가 더 똑똑한 AI를 가졌나"가 아니다. **"누가 루프의 물리적 접점을 더 많이 통제하면서, Frontier Model을 분석 엔진으로 꽂아 닫힌 루프를 완성할 수 있나"**다. Autoresearch에서 `program.md`를 누가 쓰느냐가 연구 방향을 결정하듯, 자동차에서 **루프의 `program.md` — 안전 정책, 인증 요건, fleet 운영 규칙 — 를 누가 정의하느냐**가 재번들의 승자를 가른다.

---

## 7. AI가 만드는 새로운 게임 — 그리고 미들웨어의 함정

### 미들웨어 회사의 운명

모든 자동차 SW 회사가 "AI 플랫폼"을 표방하지만, 역사는 냉정하다:

| 시대 | 미들웨어 | 결말 | 교훈 |
|------|---------|------|------|
| 모바일 OS | Symbian | Nokia와 함께 소멸 | 단일 OEM 종속 = 공멸 |
| J2EE | BEA WebLogic | 오픈소스에 commodity화 | 순수 미들웨어는 제로 경쟁 |
| API 미들웨어 | MuleSoft | Salesforce에 $65억 인수 | 데이터 소유 없이는 독립 불가 |
| 가상화 | VMware | Broadcom에 $610억 인수 | 카테고리 창시만이 독립 유지 |
| 자동차 RTOS | BlackBerry QNX | 2.5억대 탑재, 매출 ~$2.2억 | 시장 지배해도 대당 $1-5 |
| 자동차 데이터 | Otonomo, Wejo | 파산/흡수 | 데이터 마켓플레이스 모델 실패 |

**교훈은 명확하다**: 순수 미들웨어는 아래(칩 벤더)에서 위로, 위(OEM/클라우드)에서 아래로 squeeze된다. 살아남은 미들웨어는 (a) 데이터를 소유하거나, (b) 안전 인증으로 교체 비용을 높이거나, (c) 칩에 묶이거나, (d) 인수당했다.

### Frontier Lab들의 자동차 진출 — 위에서 내려오는 위협

2025-2026년, AI 모델을 만드는 Frontier Lab들이 자동차에 진입하고 있다. [OpenAI는 Applied Intuition($150억 밸류에이션, ARR $4.15억)과 파트너십](https://www.appliedintuition.com/news/applied-intuition-openai)으로 차량 내 AI 에이전트를, Google은 Android Automotive + [Waymo(주당 45만 라이드, 2억 마일 자율주행)](https://waymo.com/blog/2026/02/the-waymo-world-model-a-new-frontier-for-autonomous-driving-simulation/)로, [Microsoft는 Azure SDV + Stellantis 파트너십](https://www.microsoft.com/en-us/industry/blog/manufacturing-and-mobility/2026/01/07/ces-2026-powering-the-next-frontier-in-automotive/)으로 진출한다.

이들의 공통점: **Tier에 직접 안 들어간다.** 제조물책임을 지지 않는 클라우드/API 레이어에서 가치를 추출한다. 차량 안에서 사고가 나도 클라우드 API 제공자에게 제조물책임이 가는 경우는 극히 드물다. 3장에서 논의한 "법적 리스크 설계"의 가장 세련된 형태다.

이건 기존 자동차 AI 회사들에게 위에서 내려오는 압착이다. OEM이 "GPT-5 API + 자체 차량 데이터"로 진단 시스템을 만들 수 있다면, 전문 진단 AI 플랫폼의 가치는 어디에 있는가?

### 모빌리티 스타트업의 세 갈래 생존 전략

위에서는 Frontier Lab이 내려오고, 아래에서는 칩 벤더가 올라오고, 옆에서는 OEM이 내재화를 시도한다. 이 squeeze 속에서 세 가지 생존 전략이 분화하고 있다:

**규모로 도망치기**: [Applied Intuition](https://www.appliedintuition.com/blog/series-f) — $600M Series F, 상위 20개 OEM 중 18개와 거래. 시뮬레이션에서 Vehicle OS까지 확장하며 교체 불가능한 깊이를 만든다.

**거인에 붙기**: [Apex.AI](https://www.apex.ai/press-release/apex.ai-secures-strategic-investment-from-lg-electronics) — LG전자 전략 투자로 한국 생태계 진입. ASIL-D 인증 미들웨어로 교체 비용을 극대화한다.

**수직 통합으로 뚫기**: [Aurora Innovation](https://ir.aurora.tech/) — 자율주행 트럭을 직접 운영. 2026년 목표: 수백 대 무인 트럭, 런레이트 $8,000만. 미들웨어를 파는 게 아니라 미들웨어 위에서 직접 매출을 만든다.

**그리고 사라진 자들**: Argo AI($36억 투자 후 2022 해산), TuSimple(2023 미국 사업 폐쇄), Otonomo/Wejo(데이터 마켓플레이스 실패). 공통점: 미들웨어만 있고, 데이터 소유도, 안전 인증도, 고객 분산도 없었다.

### 그렇다면 진짜 해자는 무엇인가

노정석 대표가 EP91에서 말한 "non-verifiable을 verifiable로 전환할 수 있는 환경"을 자동차에 적용하면: **부품 silo 사이를 관통하는 데이터 루프를 소유하는 것**이다. 차량에서 데이터를 수집하고, 진단하고, 예측 모델로 만들어 다시 배포하는 루프. 이 루프의 한 조각을 교체하면 전체가 깨진다.

코드로 복제할 수 있는 건 해자가 아니다:

- **규제 인증**: ASIL-D에 2-3년, 수백만 달러. R155 CSMS 감사 통과에 12-18개월. 한번 type approval에 들어간 SW는 교체 비용 = 재인증 비용.
- **정치적 alliance**: OEM 그룹 내 보안 심사 통과, 내부 IT 인프라 통합에 1-2년. 기술은 복제할 수 있지만 관계는 복제할 수 없다.
- **Cross-OEM 데이터**: 개별 OEM은 자기 차만 본다. 하지만 Bosch 브레이크, Continental ECU는 여러 OEM에 공통이다. Cross-OEM failure pattern은 개별 OEM이 혼자서는 만들 수 없다.

**시간과 관계와 구조로만 쌓이는 것이 진짜 해자다.**

---

## 8. 아직 답이 없는 질문들

이 글에서 나는 silo가 존재하는 이유를 분석했고, 그 silo가 어떤 힘에 의해 흔들리고 있는지를 추적했다. 하지만 분석이 깔끔하게 끝나는 지점에서, 현실은 끝나지 않는다. 오히려 가장 어려운 질문들이 그 지점에서 시작된다.

### 연결자의 책임 공백

부품 silo 사이를 관통하는 데이터 레이어는 기존에 없던 가치를 만든다 — cross-ECU 영향 분석, fleet 차원의 failure pattern 감지, 리콜 전 예측. 하지만 이 레이어가 가치를 만드는 만큼, **새로운 종류의 책임 공백도 만든다.**

브레이크팀은 브레이크 ECU의 결함에 책임진다. 파워트레인팀은 엔진 제어의 결함에 책임진다. 그런데 cross-ECU 데이터 레이어가 "브레이크 ECU와 파워트레인 ECU의 상호작용에서 anomaly를 감지했지만 false positive으로 분류했고, 그 판단이 사고로 이어졌다"면 — 이 책임은 누구의 것인가?

기존 제조물책임법은 이 시나리오를 상정하지 않았다. 물리적 부품에 책임을 부착하는 프레임워크에서, **부품 사이의 관계를 분석하는 소프트웨어**는 법적 미지의 영역이다. EU의 개정 Product Liability Directive(2024)가 SW를 "제품"으로 명시했지만, cross-domain 분석 레이어의 책임 소재에 대한 판례는 아직 없다.

silo를 연결하는 자가 가치를 가져가려면, 그 연결에서 발생하는 리스크도 소유해야 한다. **연결의 가치는 명확한데, 연결의 책임은 미정** — 이것이 자동차 AI 산업의 가장 큰 구조적 미해결 문제다.

### 미들웨어의 수익 모델 한계

7장에서 다룬 미들웨어 역사의 교훈을 자동차에 적용하면, 한 가지 불편한 질문이 남는다. BlackBerry QNX는 2.5억 대에 깔려 있지만 대당 $1-5를 받는다. 자동차 미들웨어의 수익 구조가 이것이라면, **silo를 연결하는 데이터 레이어도 같은 운명 아닌가?**

QNX가 대당 $1-5에 머무는 이유는 RTOS가 commodity로 인식되기 때문이다. 데이터 레이어가 이 함정을 피하려면 "인프라"가 아니라 "의사결정"을 팔아야 한다 — 즉 데이터를 흘려보내는 파이프가 아니라, 데이터에서 리콜을 예측하고, OTA 배포의 안전성을 검증하고, 워런티 비용을 줄여주는 결과를 파는 것이다. 하지만 "결과를 판다"는 것은 곧 "결과에 책임진다"는 것이고, 이는 다시 책임 공백 문제로 돌아온다.

### Evans 프레임의 한계 — 법이 만든 번들은 어디까지 해체되는가

2장에서 나는 Evans의 bundle/unbundle 패턴이 자동차에서는 속도와 경로가 다르다고 주장했다. 하지만 더 근본적인 질문이 있다: **법이 설계한 번들은 "해체"가 끝점이 아닐 수 있다.** 미디어 번들은 기술이 해체하고 기술이 재결합했다. 자동차 번들은 법이 설계했으므로, 진짜 해체는 기술이 아니라 법의 변화에 달려 있다.

EU의 Product Liability Directive 개정, Data Act 시행, 중국의 데이터 주권법 — 이 법적 변화들이 새로운 번들의 형태를 결정할 것이다. 그렇다면 자동차 산업에서 승자를 결정하는 건 "누가 더 좋은 기술을 만드느냐"가 아니라, **"누가 법의 변화를 먼저 읽고 그 위에 구조를 세우느냐"**가 될 수 있다.

---

이 업계에서 일하면서 깨달은 건 이것이다: 우리가 경쟁하는 건 기술이 아니라 **구조**다. 법적 책임 체인 안에서 어디에 자리 잡느냐, 워런티 회계 모델과 어떻게 양립하느냐, OEM의 5-7년 프로그램 사이클에 어떻게 녹아드느냐. 기술은 6개월이면 따라잡힌다. 구조적 포지션은 5년이 걸린다.

**Silo가 존재하는 이유를 이해하지 못하는 플레이어는, 그 Silo를 연결하는 플레이어가 될 수 없다. 그리고 연결하는 플레이어가 연결의 책임을 설계하지 못하면, 연결 자체가 새로운 리스크가 된다.**

답은 아직 없다. 하지만 질문이 어디에 있는지는 보이기 시작했다.

---

## Sources

| # | 출처 | URL |
|---|------|-----|
| 1 | Benedict Evans — The Great Unbundling (2020) | https://www.ben-evans.com/presentations |
| 2 | Benedict Evans — The New Gatekeepers (2022) | https://www.ben-evans.com/presentations |
| 3 | Benedict Evans — Unbundling AI (2023) | https://www.ben-evans.com/benedictevans/2023/10/5/unbundling-ai |
| 4 | Benedict Evans — AI Eats the World (2025) | https://www.ben-evans.com/presentations |
| 5 | Benedict Evans — Cars and Second Order Consequences (2017) | https://www.ben-evans.com/benedictevans/2017/3/20/cars-and-second-order-consequences |
| 6 | AI Frontier EP91 — 노정석, 최승준 (2026.3.21) | https://aifrontier.kr/ko/episodes/ep91/ |
| 7 | 노정석 — 비팩토리 대표 (연쇄창업가, 태터앤컴퍼니 구글 매각) | https://byline.network/2025/08/2-ai/ |
| 8 | VW CARIAD — €50억 투자와 실패 | https://www.autocar.co.uk/car-news/business-tech-development/vw-spent-over-%E2%82%AC50-billion-failed-cariad-software-unit |
| 9 | 현대 팰리세이드 리콜 — Hyundai Newsroom (2026.3.13) | https://www.hyundainews.com/releases/4724 |
| 10 | 팰리세이드 리콜 상세 — Consumer Reports | https://www.consumerreports.org/cars/car-recalls-defects/hyundai-palisade-recall-folding-seats-stop-sale-child-death-a6861032164/ |
| 11 | 팰리세이드 리콜 규모 — Edmunds | https://www.edmunds.com/car-news/hyundai-palisade-kia-telluride-rear-seat-recall.html |
| 12 | 계기판 SW 리콜 — Cars.com | https://www.cars.com/articles/84000-plus-hyundais-kias-recalled-for-instrument-panel-displays-521035/ |
| 13 | 팰리세이드 전체 리콜 이력 — Cars.com | https://www.cars.com/research/hyundai-palisade/recalls/ |
| 14 | EU Data Act (Regulation 2023/2854) | https://eur-lex.europa.eu/eli/reg/2023/2854 |
| 15 | EU Product Liability Directive revision (2024) | https://ec.europa.eu/commission/presscorner/detail/en/ip_22_5807 |
| 16 | UNECE R155/R156 (Cybersecurity/Software Update) | https://unece.org/transport/documents/2021/03/standards/un-regulation-no-155 |
| 17 | Applied Intuition Series F ($150억 밸류에이션) | https://www.appliedintuition.com/blog/series-f |
| 18 | Applied Intuition + OpenAI 파트너십 | https://www.appliedintuition.com/news/applied-intuition-openai |
| 19 | Apex.AI + LG전자 전략 투자 | https://www.apex.ai/press-release/apex.ai-secures-strategic-investment-from-lg-electronics |
| 20 | Aurora Innovation IR | https://ir.aurora.tech/ |
| 21 | Waymo World Model (2026) | https://waymo.com/blog/2026/02/the-waymo-world-model-a-new-frontier-for-autonomous-driving-simulation/ |
| 22 | Microsoft Azure SDV — CES 2026 | https://www.microsoft.com/en-us/industry/blog/manufacturing-and-mobility/2026/01/07/ces-2026-powering-the-next-frontier-in-automotive/ |
| 23 | Andrej Karpathy — Autoresearch (2026.3) | https://github.com/karpathy/autoresearch |
| 24 | Karpathy Autoresearch 소개 트윗 | https://x.com/karpathy/status/2029701092347630069 |
