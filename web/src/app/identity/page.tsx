"use client";

import Link from "next/link";
import { Reveal } from "../kids-edu/_components/Reveal";
import { c, useIdentityLang } from "./_i18n/content";

// "Hype" 글자만 브랜드 퍼플로 강조 — 다크 섹션 안에서 사용.
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

// "AI" 단어만 브랜드 퍼플+볼드 + 한 단계 큰 글자 — Hero tension 문구용.
// baseline 기본 정렬 + leading-none으로 큰 글자가 줄간격을 흔들지 않게.
function highlightAI(text: string) {
  return text.split(/(\bAI\b)/g).map((part, i) =>
    part === "AI" ? (
      <span
        key={i}
        className="text-[#a855f7] font-bold text-2xl md:text-3xl leading-none"
      >
        AI
      </span>
    ) : (
      part
    )
  );
}

// H1의 핵심 키워드(함께/이정표, together/signpost)에 브랜드 퍼플 강조.
function highlightHeroKeywords(text: string) {
  const parts = text.split(/(함께|이정표|together|signpost)/g);
  return parts.map((part, i) =>
    ["함께", "이정표", "together", "signpost"].includes(part) ? (
      <span key={i} className="text-[#a855f7]">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function IdentityPage() {
  const lang = useIdentityLang();

  const roles = [c.roleHuman, c.roleAi, c.roleProcess] as const;
  const clusters = [c.clusterPosture, c.clusterCommand, c.clusterLoop] as const;
  const axes = [
    c.axisResearch,
    c.axisStandards,
    c.axisEducation,
    c.axisCommunity,
  ] as const;
  const communityCards = [c.cardVoluntary, c.cardRanked, c.cardCompeting] as const;

  return (
    <main>
      {/* 1. Hero */}
      <section className="relative bg-white">
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-32 md:pt-40 md:pb-40 text-center">
          <Reveal as="p" className="mb-5 text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)]">
            {c.heroEyebrow[lang]}
          </Reveal>
          <Reveal as="p" delay={60} className="mb-6 text-base md:text-lg text-[color:var(--kf-muted)] max-w-2xl mx-auto leading-relaxed">
            {highlightAI(c.heroTension[lang])}
          </Reveal>
          <Reveal as="h1" delay={160} className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05]">
            {c.heroLines[lang].map((line, i) => (
              <span key={i} className="block">
                {highlightHeroKeywords(line)}
              </span>
            ))}
          </Reveal>
          <Reveal as="p" delay={280} className="mt-8 text-lg md:text-xl text-[color:var(--kf-muted)] max-w-2xl mx-auto">
            {c.heroSub[lang]}
          </Reveal>
          <Reveal delay={400} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#take"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--kf-accent)] hover:bg-[color:var(--kf-accent-hover)] px-7 py-3.5 text-base font-medium text-white transition-colors"
            >
              {c.heroCtaPrimary[lang]}
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-base text-[color:var(--kf-accent)] hover:underline"
            >
              {c.heroCtaSecondary[lang]}
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

      {/* 2. Our Take — Before / Now */}
      <section id="take" className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              {c.takeEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold">
              {c.takeTitle[lang]}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <Reveal delay={120} className="rounded-3xl bg-white p-8 md:p-10 border border-[color:var(--kf-divider)]">
              <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--kf-muted)]">
                Before
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">
                {c.beforeTitle[lang]}
              </h3>
              <p className="text-[color:var(--kf-muted)] mb-6">
                {c.beforeSub[lang]}
              </p>
              <ul className="space-y-2.5 text-[color:var(--kf-fg-soft)]">
                {c.beforeBullets[lang].map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span className="mt-2 w-1 h-1 rounded-full bg-[color:var(--kf-muted)] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Now */}
            <Reveal
              delay={240}
              className="rounded-3xl bg-white p-8 md:p-10 border border-[color:var(--kf-accent)] shadow-[0_12px_40px_-12px_rgba(168,85,247,0.25)]"
            >
              <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--kf-accent)]">
                Now
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">
                {c.nowTitle[lang]}
              </h3>
              <p className="text-[color:var(--kf-muted)] mb-6">
                {c.nowSub[lang]}
              </p>
              <ul className="space-y-2.5 text-[color:var(--kf-fg-soft)]">
                {c.nowBullets[lang].map((b) => (
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

      {/* 3. AI Philosophy — Human · AI · Process */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              {c.aiPhilEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5">
              {c.aiPhilTitle[lang]}
            </h2>
            <p className="text-lg text-[color:var(--kf-muted)] max-w-2xl mx-auto">
              {c.aiPhilSub[lang]}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((item, i) => (
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
                  {item.desc[lang]}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Essence — 16 capabilities distilled into 3 clusters (Posture / Command / Loop) */}
      <section id="essence" className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              {c.essenceEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5">
              {c.essenceTitle[lang]}
            </h2>
            <p className="text-lg text-[color:var(--kf-muted)] max-w-2xl mx-auto">
              {c.essenceSub[lang]}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {clusters.map((cluster, i) => (
              <Reveal
                key={cluster.label.en}
                delay={120 * i}
                className="rounded-3xl bg-white p-8 md:p-10 border border-[color:var(--kf-divider)]"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--kf-accent)] mb-3 font-medium">
                  {cluster.label[lang]}
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                  {cluster.title[lang]}
                </h3>
                <p className="text-[color:var(--kf-fg-soft)] leading-relaxed">
                  {cluster.body[lang]}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Four Axes — links to /columns /glossary /kids-edu /creators */}
      <section id="four-axes" className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              {c.axesEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold">
              {c.axesTitle[lang]}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {axes.map((axis, i) => (
              <Reveal key={axis.label.en} delay={120 * i}>
                <Link
                  href={axis.href}
                  className="block group h-full rounded-3xl bg-[color:var(--kf-bg)] p-8 border border-[color:var(--kf-divider)] transition-colors hover:border-[color:var(--kf-accent)]"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--kf-accent)] mb-3 font-medium">
                    {axis.label[lang]}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 leading-snug">
                    {axis.title[lang]}
                  </h3>
                  <p className="text-sm text-[color:var(--kf-fg-soft)] mb-6 leading-relaxed">
                    {axis.desc[lang]}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-[color:var(--kf-accent)] font-medium">
                    {c.axisVisit[lang]}
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why Here — bridge: tool chaos → systematic path */}
      <section className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
          <Reveal as="p" className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-4">
            {c.whyHereEyebrow[lang]}
          </Reveal>
          <Reveal as="h2" delay={100} className="text-3xl md:text-5xl font-semibold mb-6">
            {c.whyHereTitle[lang]}
          </Reveal>
          <Reveal as="p" delay={200} className="text-lg md:text-xl text-[color:var(--kf-muted)]">
            {c.whyHereSub[lang]}
          </Reveal>
        </div>
      </section>

      {/* 7. Community — dark section with brand purple accent */}
      <section id="community" className="bg-[color:var(--kf-fg)] text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-white/50 mb-3">
              {c.communityEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5 text-white">
              {c.communityTitle[lang]}
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {c.communitySubBefore[lang]}
              <span className="text-[#a855f7] font-bold">Hype</span>
              {c.communitySubAfter[lang]}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {communityCards.map((item, i) => (
              <Reveal
                key={item.label.en}
                delay={120 * i}
                className="rounded-3xl bg-[#2b2b2e] p-8 md:p-10 border border-white/10"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-[#c4b5fd] mb-3">
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

      {/* 8. Closing */}
      <section className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
          <Reveal as="h2" className="text-3xl md:text-5xl font-semibold mb-10 whitespace-pre-line">
            {c.closingTitle[lang]}
          </Reveal>
          <Reveal delay={200} className="inline-block">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--kf-fg)] hover:bg-[color:var(--kf-fg-soft)] px-7 py-3.5 text-base font-medium text-white transition-colors"
            >
              {c.closingButton[lang]}
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
