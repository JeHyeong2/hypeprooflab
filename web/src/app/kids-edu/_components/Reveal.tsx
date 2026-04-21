"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode, CSSProperties } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
  /** IntersectionObserver threshold. Default 0.15. */
  threshold?: number;
  /** Negative bottom rootMargin to trigger slightly before element fully enters. */
  rootMargin?: string;
  style?: CSSProperties;
};

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  threshold = 0.15,
  rootMargin = "0px 0px -8% 0px",
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={`kids-edu-reveal${shown ? " is-in" : ""}${className ? " " + className : ""}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}
