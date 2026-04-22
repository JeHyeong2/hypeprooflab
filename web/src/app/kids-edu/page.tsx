import Link from "next/link";
import { Reveal } from "./_components/Reveal";

// "Hype" 글자만 HypeProof 퍼플 액센트(#a855f7)로 강조 — 다크 섹션 안에서 사용.
function highlightHype(text: string) {
  return text.split(/(Hype)/g).map((part, i) =>
    part === "Hype" ? (
      <span key={i} className="text-[#a855f7] font-bold">
        Hype
      </span>
    ) : (
      part
    )
  );
}

const heroExternalServiceUrl = "/kids-edu/programs";

const architectVsLaborer = {
  laborer: {
    title: "코드를 작성하는 노동자",
    sub: "정답을 외우고, 구현하는 사람",
    bullets: [
      "문법을 외우고 반복 구현한다",
      "AI를 도구로만 본다",
      "기술에 끌려간다",
    ],
  },
  architect: {
    title: "설계도면을 그리는 건축가",
    sub: "문제를 정의하고, AI를 지휘하는 사람",
    bullets: [
      "무엇을 만들지 결정한다",
      "맥락을 설계한다",
      "도구를 지휘한다",
    ],
  },
};

const cofounding = [
  {
    who: "자녀",
    role: "Visionary",
    tagline: "두려움 없는 상상력",
    description:
      '"하늘 나는 고양이"처럼, 한계를 모르는 아이디어를 던지고 AI에게 직접 지시합니다.',
  },
  {
    who: "부모",
    role: "Integrator",
    tagline: "현실 감각, 구조화 파트너",
    description:
      '"날개는 어떤 버튼이야?"처럼, 아이의 상상을 논리로 다듬는 Co-Founder입니다.',
  },
  {
    who: "AI",
    role: "Executor",
    tagline: "지시받은 대로 실행",
    description:
      "코드는 AI가 씁니다. 팀은 '무엇을 만들지' 결정에만 집중합니다.",
  },
];

const communityEffects = [
  {
    label: "Belonging",
    title: "같은 이름으로 묶입니다",
    body: '세션을 지나면 아이는 "Hype크리에이터"라는 이름을 얻습니다. 혼자 배운 수강생이 아니라, 같은 경험을 공유한 커뮤니티의 구성원이 됩니다.',
  },
  {
    label: "Self-driven",
    title: "누가 시키지 않아도 만듭니다",
    body: '경쟁이나 과제가 아니라, "이번엔 이런 거 만들어볼래"가 디폴트인 분위기. 한 번 완성해본 사람은 다음 것을 스스로 꺼내 듭니다.',
  },
  {
    label: "Ongoing",
    title: "계속 새로운 것이 흐릅니다",
    body: "새로운 세션, Hype크리에이터끼리의 리서치·칼럼, 서로를 비추는 피드백 루프. 이곳은 멈추지 않습니다.",
  },
];

const curriculum = [
  {
    part: "Part 1",
    title: "관점의 전환",
    goal: '"나는 코딩하는 사람이 아니라, AI를 지휘하는 설계자다"',
  },
  {
    part: "Part 2",
    title: "협업과 조율",
    goal: "아이의 상상력과 부모의 현실감각이 기획서로 수렴",
  },
  {
    part: "Part 3",
    title: "AI 지휘와 실습",
    goal: "AI에게 지시를 내려 실제 작동하는 결과물 만들기",
  },
  {
    part: "Part 4",
    title: "발표와 시상",
    goal: '"우리가 이걸 만들었다"는 효능감의 경험',
  },
];

export default function KidsEduLandingPage() {
  return (
    <main>
      {/* 1. Hero */}
      <section className="relative bg-white">
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-32 md:pt-40 md:pb-40 text-center">
          <Reveal as="p" className="mb-5 text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)]">
            Future AI Leader&apos;s Academy
          </Reveal>
          <Reveal as="h1" delay={80} className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05]">
            코딩은 AI가 합니다.
            <br />
            아이는 &ldquo;무엇을 할지&rdquo; <br className="hidden md:block" />
            결정만 하면 됩니다.
          </Reveal>
          <Reveal as="p" delay={200} className="mt-8 text-lg md:text-xl text-[color:var(--kf-muted)] max-w-2xl mx-auto">
            10~15세 청소년이 부모와 한 팀이 되어, AI를 지휘하는{" "}
            <span className="text-[color:var(--kf-fg)]">설계자(Architect)</span>
            로 자라납니다.
          </Reveal>
          <Reveal delay={320} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={heroExternalServiceUrl}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--kf-accent)] hover:bg-[color:var(--kf-accent-hover)] px-7 py-3.5 text-base font-medium text-white transition-colors"
            >
              교육 프로그램 살펴보기
            </a>
            <Link
              href="/kids-edu/projects"
              className="inline-flex items-center gap-1.5 text-base text-[color:var(--kf-accent)] hover:underline"
            >
              지난 팀들의 프로젝트 보기
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
        {/* Scroll-down hint */}
        <div
          aria-hidden
          className="absolute bottom-14 md:bottom-16 left-1/2 -translate-x-1/2 pointer-events-none"
        >
          <div className="scroll-hint">
            <svg
              width="22"
              height="13"
              viewBox="0 0 22 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 1 L11 11 L21 1" />
            </svg>
          </div>
        </div>
      </section>

      {/* 2. Architect vs Laborer */}
      <section className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-20 md:mb-24">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              관점의 전환
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold">
              노동자가 아닌, 건축가를 키웁니다.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Laborer */}
            <Reveal delay={120} className="rounded-3xl bg-white p-8 md:p-10 border border-[color:var(--kf-divider)]">
              <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--kf-muted)]">
                Before
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">
                {architectVsLaborer.laborer.title}
              </h3>
              <p className="text-[color:var(--kf-muted)] mb-6">
                {architectVsLaborer.laborer.sub}
              </p>
              <ul className="space-y-2.5 text-[color:var(--kf-fg-soft)]">
                {architectVsLaborer.laborer.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span className="mt-2 w-1 h-1 rounded-full bg-[color:var(--kf-muted)] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Architect — thunder at card's top edge, 수평 center+15px, ~75%는 카드 위, ~25%만 안으로 overlap */}
            <Reveal
              delay={240}
              className="relative rounded-3xl bg-white p-8 md:p-10 border border-[color:var(--kf-accent)] shadow-[0_12px_40px_-12px_rgba(0,113,227,0.25)]"
            >
              <div
                className="absolute pointer-events-none z-10 left-1/2 top-0"
                style={{ transform: "translate(calc(-50% + 15px), -75%)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/thunder.svg"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="thunder-flash h-20 md:h-28 w-auto"
                />
              </div>

              <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--kf-accent)]">
                Now
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">
                {architectVsLaborer.architect.title}
              </h3>
              <p className="text-[color:var(--kf-muted)] mb-6">
                {architectVsLaborer.architect.sub}
              </p>
              <ul className="space-y-2.5 text-[color:var(--kf-fg-soft)]">
                {architectVsLaborer.architect.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span className="mt-2 w-1 h-1 rounded-full bg-[color:var(--kf-accent)] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. Co-Founding 모델 */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              Co-Founding Model
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5">
              셋이 하나로 움직입니다.
            </h2>
            <p className="text-lg text-[color:var(--kf-muted)] max-w-2xl mx-auto">
              자녀의 상상력, 부모의 구조화, AI의 실행력이 한 팀으로 움직입니다.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {cofounding.map((c, i) => (
              <Reveal
                key={c.who}
                delay={120 * i}
                className="rounded-3xl bg-[color:var(--kf-bg)] p-8 md:p-10 border border-[color:var(--kf-divider)]"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)] mb-3">
                  {c.role}
                </div>
                <div className="text-2xl md:text-3xl font-semibold mb-2">
                  {c.who}
                </div>
                <div className="text-[color:var(--kf-accent)] font-medium mb-4">
                  {c.tagline}
                </div>
                <p className="text-[color:var(--kf-fg-soft)]">{c.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Curriculum */}
      <section className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-4xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              Curriculum
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold">
              4단계로 설계된 학습 여정.
            </h2>
          </Reveal>

          <div className="space-y-4">
            {curriculum.map((p) => (
              <Reveal
                key={p.part}
                className="rounded-3xl bg-white p-8 md:p-10 border border-[color:var(--kf-divider)]"
              >
                <div className="flex items-baseline gap-4 mb-3 flex-wrap">
                  <span className="text-sm font-semibold tracking-[0.1em] text-[color:var(--kf-accent)]">
                    {p.part}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-semibold">
                    {p.title}
                  </h3>
                </div>
                <p className="text-[color:var(--kf-fg-soft)] text-base md:text-lg">
                  {p.goal}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Beyond the Program — community effect (dark inverted emphasis) */}
      <section className="bg-[color:var(--kf-fg)] text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-white/50 mb-3">
              Beyond the Program
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5 text-white">
              교육이 끝나도, 이곳에 남습니다.
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              경험을 공유한{" "}
              <span className="text-[#a855f7] font-bold">Hype</span>
              크리에이터끼리의 커뮤니티가 남습니다.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {communityEffects.map((item, i) => (
              <Reveal
                key={item.title}
                delay={120 * i}
                className="rounded-3xl bg-[#2b2b2e] p-8 md:p-10 border border-white/10"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-[#7fb7ff] mb-3">
                  {item.label}
                </div>
                <h3 className="text-2xl font-semibold mb-4 leading-snug text-white">
                  {item.title}
                </h3>
                <p className="text-white/70">{highlightHype(item.body)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Projects Archive CTA */}
      <section className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <Reveal>
            <Link
              href="/kids-edu/projects"
              className="block group rounded-3xl bg-white border border-[color:var(--kf-divider)] p-10 md:p-14 transition-colors hover:border-[color:var(--kf-accent)]"
            >
              <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
                Archive
              </p>
              <h2 className="text-3xl md:text-5xl font-semibold mb-4">
                지난 팀들이 만든 것들
              </h2>
              <p className="text-lg text-[color:var(--kf-muted)] max-w-2xl mb-8">
                초등·중등 팀들이 AI를 지휘해 만들어낸 실제 프로젝트를
                살펴보세요.
              </p>
              <span className="inline-flex items-center gap-1.5 text-[color:var(--kf-accent)] font-medium">
                프로젝트 아카이브 열기
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 7. Closing CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
          <Reveal as="h2" className="text-3xl md:text-5xl font-semibold mb-10">
            아이는 AI를 두려워하지 않는 세대입니다.
          </Reveal>
          <Reveal delay={200} className="inline-block">
            <a
              href={heroExternalServiceUrl}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--kf-fg)] hover:bg-[color:var(--kf-fg-soft)] px-7 py-3.5 text-base font-medium text-white transition-colors"
            >
              교육 프로그램 보기
            </a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
