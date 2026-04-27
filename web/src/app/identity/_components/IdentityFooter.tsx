"use client";

import Link from "next/link";
import { useIdentityLang, c } from "../_i18n/content";

export function IdentityFooter() {
  const lang = useIdentityLang();

  return (
    <footer className="border-t border-[color:var(--kf-divider)] py-10">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--kf-muted)] hover:text-[color:var(--kf-fg)] transition-colors"
        >
          <span aria-hidden>←</span>
          <span>{c.backHome[lang]}</span>
        </Link>
      </div>
    </footer>
  );
}
