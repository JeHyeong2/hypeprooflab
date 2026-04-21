import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../_components/Reveal";
import { MagicBackground } from "../_components/MagicBackground";

export const metadata: Metadata = {
  title: "2026 어린이날 · 나만의 마법 게임 만들기",
  description:
    "2026년 5월 5일, 국립암센터 소아암 병동 친구들과 함께 AI를 지휘해 '내 게임'을 완성하는 Future AI Leader's Academy 특별 세션 랜딩.",
  openGraph: {
    title: "나만의 마법 게임 만들기 — 지휘관의 탄생",
    description:
      "2026 어린이날 특별 세션. AI를 지휘해 두 시간 만에 내 게임을 완성합니다.",
    type: "website",
  },
};

const eventInfo = [
  {
    label: "일시",
    value: "2026년 5월 5일 (화)",
    detail: "13:30 – 15:30 · 두 시간",
  },
  {
    label: "함께하는 친구들",
    value: "40명의 지휘관",
    detail: "가족 · 아카데미 크리에이터팀 동행",
  },
];

const activities = [
  {
    no: "01",
    title: "AI에게 또박또박 지시하기",
    body:
      '"대충" 말한 AI와 "또박또박" 말한 AI의 결과를 나란히 보여드려요. AI가 내 말을 얼마나 꼼꼼히 듣는지 직접 확인하며 지휘관의 마음가짐으로 하루를 시작합니다.',
  },
  {
    no: "02",
    title: "나만의 아바타 소환하기",
    body:
      '"기사의 칼은 어떤 빛을 내나요?" AI가 되물어 올 때마다 대답하면, 머릿속에만 있던 내 캐릭터가 화면 위로 걸어 나옵니다. 묘사하면 할수록 더 나다워져요.',
  },
  {
    no: "03",
    title: "내 규칙으로 세계 만들기",
    body:
      '"우주에서 바이러스를 피해 별 10개 모으기!"처럼, 내가 정한 이기는 규칙이 곧 게임이 됩니다. 지휘관이 쓴 규칙대로 즉시 플레이 가능한 맵이 펼쳐집니다.',
  },
  {
    no: "04",
    title: "내 이름 새긴 게임 런칭",
    body:
      '게임 타이틀과 제목을 만들고 화면 하단에 "총괄 개발자: OOO"를 또렷하게 새깁니다. 40명의 런칭 영상이 대형 스크린에 차례로 상영되는 순간, 내 작품이 모두의 앞에 공개됩니다.',
  },
  {
    no: "05",
    title: "마스터 개발자로 돌아가기",
    body:
      '내 게임에 바로 접속할 수 있는 마스터 키(QR), "마스터 개발자 OOO" 사원증, 그리고 실물 게임 패키지까지. 오늘의 증거를 손에 쥐고 일상으로 돌아갑니다.',
  },
];

export default function ChildrensDay2026Page() {
  return (
    <main>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-white">
        <MagicBackground />
        <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-24 md:pt-40 md:pb-32 text-center">
          <Reveal as="p" className="mb-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--kf-accent)]">
            <span aria-hidden>◆</span>
            2026 · 05 · 05 · 어린이날 특별 세션
          </Reveal>
          <Reveal as="h1" delay={80} className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05]">
            나만의 마법 게임 만들기
          </Reveal>
          <Reveal as="p" delay={180} className="mt-4 text-lg md:text-2xl text-[color:var(--kf-accent)] font-medium">
            지휘관의 탄생
          </Reveal>
          <Reveal as="p" delay={280} className="mt-8 text-lg md:text-xl text-[color:var(--kf-muted)] max-w-2xl mx-auto">
            두 시간 동안 AI를 지휘해, 내 손으로 게임 하나를 끝까지 완성합니다.
            <br className="hidden md:block" />
            Future AI Leader&apos;s Academy가 준비한 어린이날 특별 세션.
          </Reveal>
        </div>
      </section>

      {/* 2. Event Info */}
      <section className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              At a Glance
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold">
              한 번의 오후, 오래 남을 하루.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {eventInfo.map((info, i) => (
              <Reveal
                key={info.label}
                delay={120 * i}
                className="rounded-3xl bg-white p-8 md:p-10 border border-[color:var(--kf-divider)] text-center"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)] mb-3">
                  {info.label}
                </div>
                <div className="text-2xl md:text-3xl font-semibold mb-2">
                  {info.value}
                </div>
                <div className="text-[color:var(--kf-muted)]">
                  {info.detail}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. What you'll do — 재밌는 활동 중심 */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              What You&apos;ll Do
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5">
              오늘 여러분은 이런 걸 합니다.
            </h2>
            <p className="text-lg text-[color:var(--kf-muted)] max-w-2xl mx-auto">
              만들고 싶은 게 있었는데 어떻게 해야 할지 몰랐다면,
              오늘이 바로 그 방법을 배우는 날이에요.
            </p>
          </Reveal>

          <div className="space-y-4">
            {activities.map((a) => (
              <Reveal
                key={a.no}
                className="rounded-3xl bg-[color:var(--kf-bg)] p-8 md:p-10 border border-[color:var(--kf-divider)]"
              >
                <div className="flex items-baseline gap-4 mb-3 flex-wrap">
                  <span className="text-sm font-semibold tracking-[0.1em] text-[color:var(--kf-accent)]">
                    {a.no}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-semibold">
                    {a.title}
                  </h3>
                </div>
                <p className="text-[color:var(--kf-fg-soft)] text-base md:text-lg">
                  {a.body}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-10 text-center text-sm text-[color:var(--kf-muted)]">
            * 세부 일정과 순서는 현장 상황에 따라 조정될 수 있어요.
          </Reveal>
        </div>
      </section>

      {/* 4. Partners */}
      <section className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              Together
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5">
              함께 준비합니다.
            </h2>
          </Reveal>

          <Reveal className="rounded-3xl bg-white border border-[color:var(--kf-divider)] p-10 md:p-14">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)] mb-3">
                  Host
                </div>
                <div className="text-2xl font-semibold mb-2">
                  Future AI Leader&apos;s Academy
                </div>
                <p className="text-[color:var(--kf-muted)]">
                  HypeProof의 청소년 AI 교육 프로그램. 아이들을 AI 시대의
                  설계자(Architect)로 안내합니다.
                </p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)] mb-3">
                  Venue Partner
                </div>
                <div className="text-2xl font-semibold mb-2">국립암센터</div>
                <p className="text-[color:var(--kf-muted)]">
                  소아암 병동 친구들과 가족이 어린이날 특별 세션에 함께합니다.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. Closing */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
          <Reveal as="h2" className="text-3xl md:text-5xl font-semibold mb-6">
            5월 5일, 40명의 지휘관이 탄생합니다.
          </Reveal>
          <Reveal as="p" delay={120} className="text-lg text-[color:var(--kf-muted)] mb-10">
            이날 완성된 작품들은 추후 아카이브에서 다시 만날 수 있습니다.
          </Reveal>
          <Reveal delay={240} className="inline-block">
            <Link
              href="/kids-edu/projects"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--kf-fg)] hover:bg-[color:var(--kf-fg-soft)] px-7 py-3.5 text-base font-medium text-white transition-colors"
            >
              프로젝트 아카이브로 가기
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
