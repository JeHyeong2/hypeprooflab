"use client";

import { useI18n } from "@/contexts/I18nContext";

// kids-edu 우측 상단 고정 언어 토글. 기존 전역 I18nContext의 setLocale을 그대로 호출 →
// 다른 페이지(/columns, /novels 등)와 언어 상태 동기화됨.
export function LangSwitch() {
  const { locale, setLocale } = useI18n();
  const activeClass =
    "bg-[color:var(--kf-fg)] text-white";
  const inactiveClass =
    "text-[color:var(--kf-muted)] hover:text-[color:var(--kf-fg)]";

  return (
    <div className="fixed top-5 right-5 md:top-6 md:right-6 z-50 flex items-center gap-0.5 rounded-full bg-white/75 backdrop-blur-md border border-[color:var(--kf-divider)] shadow-sm p-1">
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-label="Switch to English"
        aria-pressed={locale === "en"}
        lang="en"
        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
          locale === "en" ? activeClass : inactiveClass
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("ko")}
        aria-label="한국어로 전환"
        aria-pressed={locale === "ko"}
        lang="ko"
        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
          locale === "ko" ? activeClass : inactiveClass
        }`}
      >
        KO
      </button>
    </div>
  );
}
