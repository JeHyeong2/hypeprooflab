"use client";

import Link from "next/link";
import { Reveal } from "../_components/Reveal";
import { c, useKidsLang } from "../_i18n/content";

export function ProjectsContent() {
  const lang = useKidsLang();

  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 pt-28 pb-16 md:pt-40 md:pb-20 text-center">
          <Reveal as="p" className="mb-5 text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)]">
            {c.projEyebrow[lang]}
          </Reveal>
          <Reveal as="h1" delay={80} className="text-4xl md:text-6xl font-semibold leading-[1.08]">
            {c.projTitleLine1[lang]}{" "}
            <br className="md:hidden" />
            {c.projTitleLine2[lang]}
          </Reveal>
          <Reveal as="p" delay={200} className="mt-8 text-lg md:text-xl text-[color:var(--kf-muted)] max-w-2xl mx-auto">
            {c.projSub[lang]}
          </Reveal>
        </div>
      </section>

      <section className="bg-[color:var(--kf-bg)]">
        <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
          <Reveal className="rounded-3xl bg-white border border-[color:var(--kf-divider)] p-12 md:p-16 text-center">
            <div
              aria-hidden
              className="mx-auto mb-6 w-14 h-14 rounded-full bg-[color:var(--kf-bg)] border border-[color:var(--kf-divider)] flex items-center justify-center"
            >
              <span className="w-2 h-2 rounded-full bg-[color:var(--kf-accent)] animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              {c.projComingTitle[lang]}
            </h2>
            <p className="text-[color:var(--kf-muted)] max-w-md mx-auto mb-10">
              {c.projComingBody[lang]}
            </p>
            <Link
              href="/kids-edu"
              className="inline-flex items-center gap-1.5 text-[color:var(--kf-accent)] hover:underline font-medium"
            >
              <span aria-hidden>←</span>
              {c.projBack[lang]}
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
