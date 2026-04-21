"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LayoutFooter() {
  const pathname = usePathname();
  const isMainLanding = pathname === "/kids-edu";

  const href = isMainLanding ? "/" : "/kids-edu";
  const label = isMainLanding
    ? "HypeProof 홈으로"
    : "Future AI Leader's Academy 소개로";

  return (
    <footer className="border-t border-[color:var(--kf-divider)] py-10">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--kf-muted)] hover:text-[color:var(--kf-fg)] transition-colors"
        >
          <span aria-hidden>←</span>
          <span>{label}</span>
        </Link>
      </div>
    </footer>
  );
}
