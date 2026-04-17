"use client";

export function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const clr =
    score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : score >= 30 ? "#fb923c" : "#f87171";

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1e2a" strokeWidth={4.5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={clr}
        strokeWidth={4.5}
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-600"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={size > 50 ? 15 : 13}
        fontWeight={900}
        className="rotate-90 origin-center"
      >
        {score}
      </text>
    </svg>
  );
}
