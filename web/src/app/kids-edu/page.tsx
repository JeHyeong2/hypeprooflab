"use client";

import Link from "next/link";
import { Reveal } from "./_components/Reveal";
import { c, useKidsLang } from "./_i18n/content";

const heroExternalServiceUrl = "/kids-edu/programs";

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

export default function KidsEduLandingPage() {
  const lang = useKidsLang();

  const cofoundingItems = [c.cofChild, c.cofParent, c.cofAi] as const;
  const curriculumItems = [
    { no: "Part 1", title: c.cur1Title, goal: c.cur1Goal },
    { no: "Part 2", title: c.cur2Title, goal: c.cur2Goal },
    { no: "Part 3", title: c.cur3Title, goal: c.cur3Goal },
    { no: "Part 4", title: c.cur4Title, goal: c.cur4Goal },
  ] as const;
  const beyondCards = [c.beyondBelonging, c.beyondSelfDriven, c.beyondOngoing] as const;

  return (
    <main>
      {/* 1. Hero */}
      <section className="relative bg-white">
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-32 md:pt-40 md:pb-40 text-center">
          <Reveal as="p" className="mb-5 text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)]">
            {c.mainEyebrow[lang]}
          </Reveal>
          <Reveal as="h1" delay={80} className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05]">
            {c.heroLines[lang].map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </Reveal>
          <Reveal as="p" delay={200} className="mt-8 text-lg md:text-xl text-[color:var(--kf-muted)] max-w-2xl mx-auto">
            {c.heroSubPrefix[lang]}
            <span className="text-[color:var(--kf-fg)]">
              {c.heroSubHighlight[lang]}
            </span>
            {c.heroSubSuffix[lang]}
          </Reveal>
          <Reveal delay={320} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={heroExternalServiceUrl}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--kf-accent)] hover:bg-[color:var(--kf-accent-hover)] px-7 py-3.5 text-base font-medium text-white transition-colors"
            >
              {c.ctaProgram[lang]}
            </a>
            <Link
              href="/kids-edu/projects"
              className="inline-flex items-center gap-1.5 text-base text-[color:var(--kf-accent)] hover:underline"
            >
              {c.ctaProjects[lang]}
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
              {c.shiftEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold">
              {c.shiftTitle[lang]}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Laborer */}
            <Reveal delay={120} className="rounded-3xl bg-white p-8 md:p-10 border border-[color:var(--kf-divider)]">
              <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--kf-muted)]">
                Before
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">
                {c.laborerTitle[lang]}
              </h3>
              <p className="text-[color:var(--kf-muted)] mb-6">
                {c.laborerSub[lang]}
              </p>
              <ul className="space-y-2.5 text-[color:var(--kf-fg-soft)]">
                {c.laborerBullets[lang].map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span className="mt-2 w-1 h-1 rounded-full bg-[color:var(--kf-muted)] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Architect — thunder at card's top edge, 수평 center+15px */}
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
                {c.architectTitle[lang]}
              </h3>
              <p className="text-[color:var(--kf-muted)] mb-6">
                {c.architectSub[lang]}
              </p>
              <ul className="space-y-2.5 text-[color:var(--kf-fg-soft)]">
                {c.architectBullets[lang].map((b) => (
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

      {/* 3. Co-Founding */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              {c.coFoundingEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5">
              {c.coFoundingTitle[lang]}
            </h2>
            <p className="text-lg text-[color:var(--kf-muted)] max-w-2xl mx-auto">
              {c.coFoundingSub[lang]}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {cofoundingItems.map((item, i) => (
              <Reveal
                key={item.who.en}
                delay={120 * i}
                className="rounded-3xl bg-[color:var(--kf-bg)] p-8 md:p-10 border border-[color:var(--kf-divider)]"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)] mb-3">
                  {item.role[lang]}
                </div>
                <div className="text-2xl md:text-3xl font-semibold mb-2">
                  {item.who[lang]}
                </div>
                <div className="text-[color:var(--kf-accent)] font-medium mb-4">
                  {item.tagline[lang]}
                </div>
                <p className="text-[color:var(--kf-fg-soft)]">
                  {item.description[lang]}
                </p>
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
              {c.curriculumEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold">
              {c.curriculumTitle[lang]}
            </h2>
          </Reveal>

          <div className="space-y-4">
            {curriculumItems.map((p) => (
              <Reveal
                key={p.no}
                className="rounded-3xl bg-white p-8 md:p-10 border border-[color:var(--kf-divider)]"
              >
                <div className="flex items-baseline gap-4 mb-3 flex-wrap">
                  <span className="text-sm font-semibold tracking-[0.1em] text-[color:var(--kf-accent)]">
                    {p.no}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-semibold">
                    {p.title[lang]}
                  </h3>
                </div>
                <p className="text-[color:var(--kf-fg-soft)] text-base md:text-lg">
                  {p.goal[lang]}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Beyond the Program — dark inverted emphasis */}
      <section className="bg-[color:var(--kf-fg)] text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-white/50 mb-3">
              {c.beyondEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5 text-white">
              {c.beyondTitle[lang]}
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {c.beyondSubBefore[lang]}
              <span className="text-[#a855f7] font-bold">Hype</span>
              {c.beyondSubAfter[lang]}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {beyondCards.map((item, i) => (
              <Reveal
                key={item.label.en}
                delay={120 * i}
                className="rounded-3xl bg-[#2b2b2e] p-8 md:p-10 border border-white/10"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-[#7fb7ff] mb-3">
                  {item.label[lang]}
                </div>
                <h3 className="text-2xl font-semibold mb-4 leading-snug text-white">
                  {item.title[lang]}
                </h3>
                <p className="text-white/70">{highlightHype(item.body[lang])}</p>
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
                {c.archiveEyebrow[lang]}
              </p>
              <h2 className="text-3xl md:text-5xl font-semibold mb-4">
                {c.archiveTitle[lang]}
              </h2>
              <p className="text-lg text-[color:var(--kf-muted)] max-w-2xl mb-8">
                {c.archiveBody[lang]}
              </p>
              <span className="inline-flex items-center gap-1.5 text-[color:var(--kf-accent)] font-medium">
                {c.archiveLink[lang]}
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
            {c.closingTitle[lang]}
          </Reveal>
          <Reveal delay={200} className="inline-block">
            <a
              href={heroExternalServiceUrl}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--kf-fg)] hover:bg-[color:var(--kf-fg-soft)] px-7 py-3.5 text-base font-medium text-white transition-colors"
            >
              {c.closingButton[lang]}
            </a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
