"use client";

import Link from "next/link";
import { Reveal } from "../_components/Reveal";
import { MagicBackground } from "../_components/MagicBackground";
import { c, useKidsLang } from "../_i18n/content";

export function EventContent() {
  const lang = useKidsLang();

  const eventInfo = [
    {
      label: c.evInfoWhenLabel,
      value: c.evInfoWhenValue,
      detail: c.evInfoWhenDetail,
    },
    {
      label: c.evInfoWithLabel,
      value: c.evInfoWithValue,
      detail: c.evInfoWithDetail,
    },
  ] as const;

  const activities = [
    { no: "01", title: c.evAct1Title, body: c.evAct1Body },
    { no: "02", title: c.evAct2Title, body: c.evAct2Body },
    { no: "03", title: c.evAct3Title, body: c.evAct3Body },
    { no: "04", title: c.evAct4Title, body: c.evAct4Body },
    { no: "05", title: c.evAct5Title, body: c.evAct5Body },
  ] as const;

  return (
    <main>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-white">
        <MagicBackground />
        <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-24 md:pt-40 md:pb-32 text-center">
          <Reveal as="p" className="mb-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--kf-accent)]">
            <span aria-hidden>◆</span>
            {c.evHeroEyebrow[lang]}
          </Reveal>
          <Reveal as="h1" delay={80} className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05]">
            {c.evHeroTitle[lang]}
          </Reveal>
          <Reveal as="p" delay={180} className="mt-4 text-lg md:text-2xl text-[color:var(--kf-accent)] font-medium">
            {c.evHeroTagline[lang]}
          </Reveal>
          <Reveal as="p" delay={280} className="mt-8 text-lg md:text-xl text-[color:var(--kf-muted)] max-w-2xl mx-auto">
            {c.evHeroSub1[lang]}
            <br className="hidden md:block" />
            {c.evHeroSub2[lang]}
          </Reveal>
        </div>
      </section>

      {/* 2. Event Info */}
      <section className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              {c.evAtGlanceEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold">
              {c.evAtGlanceTitle[lang]}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {eventInfo.map((info, i) => (
              <Reveal
                key={info.label.en}
                delay={120 * i}
                className="rounded-3xl bg-white p-8 md:p-10 border border-[color:var(--kf-divider)] text-center"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)] mb-3">
                  {info.label[lang]}
                </div>
                <div className="text-2xl md:text-3xl font-semibold mb-2">
                  {info.value[lang]}
                </div>
                <div className="text-[color:var(--kf-muted)]">
                  {info.detail[lang]}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. What You'll Do */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              {c.evWhatEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5">
              {c.evWhatTitle[lang]}
            </h2>
            <p className="text-lg text-[color:var(--kf-muted)] max-w-2xl mx-auto">
              {c.evWhatSub[lang]}
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
                    {a.title[lang]}
                  </h3>
                </div>
                <p className="text-[color:var(--kf-fg-soft)] text-base md:text-lg">
                  {a.body[lang]}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-10 text-center text-sm text-[color:var(--kf-muted)]">
            {c.evActFootnote[lang]}
          </Reveal>
        </div>
      </section>

      {/* 4. Partners */}
      <section className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <Reveal className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--kf-muted)] mb-3">
              {c.evTogetherEyebrow[lang]}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-5">
              {c.evTogetherTitle[lang]}
            </h2>
          </Reveal>

          <Reveal className="rounded-3xl bg-white border border-[color:var(--kf-divider)] p-10 md:p-14">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)] mb-3">
                  {c.evHostLabel[lang]}
                </div>
                <div className="text-2xl font-semibold mb-2">
                  {c.evHostName[lang]}
                </div>
                <p className="text-[color:var(--kf-muted)]">
                  {c.evHostDesc[lang]}
                </p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)] mb-3">
                  {c.evVenueLabel[lang]}
                </div>
                <div className="text-2xl font-semibold mb-2">
                  {c.evVenueName[lang]}
                </div>
                <p className="text-[color:var(--kf-muted)]">
                  {c.evVenueDesc[lang]}
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
            {c.evClosingTitle[lang]}
          </Reveal>
          <Reveal as="p" delay={120} className="text-lg text-[color:var(--kf-muted)] mb-10">
            {c.evClosingSub[lang]}
          </Reveal>
          <Reveal delay={240} className="inline-block">
            <Link
              href="/kids-edu/projects"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--kf-fg)] hover:bg-[color:var(--kf-fg-soft)] px-7 py-3.5 text-base font-medium text-white transition-colors"
            >
              {c.evClosingButton[lang]}
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
