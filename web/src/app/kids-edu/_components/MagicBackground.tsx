const SPARKLES = [
  { top: "12%", left: "8%", delay: "0s", size: 14, color: "#fbbf24" },
  { top: "22%", left: "86%", delay: "0.6s", size: 10, color: "#93c5fd" },
  { top: "40%", left: "18%", delay: "1.1s", size: 12, color: "#c4b5fd" },
  { top: "62%", left: "78%", delay: "1.7s", size: 16, color: "#f9a8d4" },
  { top: "72%", left: "14%", delay: "2.2s", size: 10, color: "#fbbf24" },
  { top: "82%", left: "92%", delay: "2.7s", size: 14, color: "#93c5fd" },
  { top: "8%", left: "52%", delay: "3.1s", size: 8, color: "#c4b5fd" },
  { top: "55%", left: "46%", delay: "0.3s", size: 11, color: "#fbbf24" },
  { top: "88%", left: "50%", delay: "1.9s", size: 13, color: "#93c5fd" },
  { top: "30%", left: "66%", delay: "2.5s", size: 14, color: "#f9a8d4" },
  { top: "48%", left: "4%", delay: "0.9s", size: 10, color: "#c4b5fd" },
  { top: "18%", left: "36%", delay: "3.0s", size: 12, color: "#fbbf24" },
];

type MagicBackgroundProps = {
  /** Render the floating gradient orbs. Default: true. Turn off for tight surfaces (cards). */
  orbs?: boolean;
};

export function MagicBackground({ orbs = true }: MagicBackgroundProps = {}) {
  return (
    <div
      aria-hidden
      className="magic-bg pointer-events-none absolute inset-0 overflow-hidden"
    >
      {orbs && (
        <>
          <div className="magic-orb magic-orb-1" />
          <div className="magic-orb magic-orb-2" />
          <div className="magic-orb magic-orb-3" />
        </>
      )}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="magic-sparkle"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            fontSize: `${s.size}px`,
            color: s.color,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
