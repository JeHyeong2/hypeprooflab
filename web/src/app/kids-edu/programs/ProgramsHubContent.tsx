"use client";

import Link from "next/link";
import { Reveal } from "../_components/Reveal";
import { MagicBackground } from "../_components/MagicBackground";
import { c, useKidsLang } from "../_i18n/content";

export function ProgramsHubContent() {
  const lang = useKidsLang();

  const activePrograms = [
    {
      slug: "childrens-day-2026",
      href: "/kids-edu/childrens-day-2026",
      date: c.progCdDate,
      dateLabel: c.progCdDateLabel,
      title: c.progCdTitle,
      tagline: c.progCdTagline,
      description: c.progCdDesc,
    },
  ] as const;

  return (
    <main>
      {/* 1. Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-20 md:pt-40 md:pb-24 text-center">
          <Reveal as="p" className="mb-5 text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)]">
            {c.progHeroEyebrow[lang]}
          </Reveal>
          <Reveal as="h1" delay={80} className="text-4xl md:text-6xl font-semibold leading-[1.08]">
            {c.progHeroTitle[lang]}
          </Reveal>
          <Reveal as="p" delay={200} className="mt-8 text-lg md:text-xl text-[color:var(--kf-muted)] max-w-2xl mx-auto">
            {c.progHeroSub[lang]}
          </Reveal>
        </div>
      </section>

      {/* 2. Active / Upcoming Programs */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <Reveal className="mb-10">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[color:var(--kf-accent)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--kf-accent)] animate-pulse" />
                {c.progNowLabel[lang]}
              </span>
              <h2 className="text-2xl md:text-4xl font-semibold">
                {c.progNowTitle[lang]}
              </h2>
            </div>
          </Reveal>

          <div className="space-y-5">
            {activePrograms.map((p) => (
              <Reveal key={p.slug}>
                <Link
                  href={p.href}
                  className="relative block group overflow-hidden rounded-3xl bg-[color:var(--kf-fg)] p-10 md:p-14 text-white transition-colors hover:bg-[#2b2b2e]"
                >
                  <MagicBackground orbs={false} />
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 mb-6 text-xs uppercase tracking-[0.2em] text-white/60">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                        <span aria-hidden>◆</span>
                        {p.date[lang]}
                      </span>
                      <span>{p.dateLabel[lang]}</span>
                      <span className="ml-auto inline-flex items-center gap-1.5 text-[#7fb7ff]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7fb7ff] animate-pulse" />
                        {c.progUpcoming[lang]}
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-semibold mb-3 leading-tight">
                      {p.title[lang]}
                    </h3>
                    <p className="text-xl md:text-2xl text-[#7fb7ff] font-medium mb-5">
                      {p.tagline[lang]}
                    </p>
                    <p className="text-base md:text-lg text-white/70 max-w-2xl mb-8">
                      {p.description[lang]}
                    </p>
                    <span className="inline-flex items-center gap-2 text-base font-medium text-white">
                      {c.progCardCta[lang]}
                      <span
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
