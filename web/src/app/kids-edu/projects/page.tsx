import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../_components/Reveal";

export const metadata: Metadata = {
  title: "Projects — Future AI Leader's Academy",
  description:
    "Future AI Leader's Academy 참가 팀들이 만든 프로젝트 아카이브.",
};

export default function KidsEduProjectsPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 pt-28 pb-16 md:pt-40 md:pb-20 text-center">
          <Reveal as="p" className="mb-5 text-xs uppercase tracking-[0.2em] text-[color:var(--kf-muted)]">
            Archive
          </Reveal>
          <Reveal as="h1" delay={80} className="text-4xl md:text-6xl font-semibold leading-[1.08]">
            Projects by <br className="md:hidden" />
            Future AI Leaders
          </Reveal>
          <Reveal as="p" delay={200} className="mt-8 text-lg md:text-xl text-[color:var(--kf-muted)] max-w-2xl mx-auto">
            부모와 자녀가 한 팀이 되어, AI를 지휘하며 만들어낸 결과물들이
            여기에 모입니다.
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
              첫 기수 프로젝트 공개를 준비 중입니다
            </h2>
            <p className="text-[color:var(--kf-muted)] max-w-md mx-auto mb-10">
              프로그램이 종료되는 대로, 참가 팀이 직접 만든 게임·도구·웹앱들을
              이곳에서 소개합니다.
            </p>
            <Link
              href="/kids-edu"
              className="inline-flex items-center gap-1.5 text-[color:var(--kf-accent)] hover:underline font-medium"
            >
              <span aria-hidden>←</span>
              프로그램 소개로 돌아가기
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
