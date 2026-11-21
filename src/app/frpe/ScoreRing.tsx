"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  cls: string;
}

function getColor(cls: string): string {
  const colors: Record<string, string> = {
    CRITICAL: "#DC2626",
    HIGH: "#EA580C",
    MEDIUM: "#D97706",
    NORMAL: "#16A34A",
    OVERDUE: "#9CA3AF",
  };
  return colors[cls] ?? "#16A34A";
}

const CIRCUMFERENCE = 2 * Math.PI * 28; // ~175.93

export default function ScoreRing({ score, cls }: ScoreRingProps) {
  const [offset, setOffset] = useState(CIRCUMFERENCE);
  const color = getColor(cls);

  useEffect(() => {
    // Small delay so the transition animates from 0 → score
    const raf = requestAnimationFrame(() => {
      setOffset(CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE);
    });
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        {/* Background track */}
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="7"
        />
        {/* Foreground arc */}
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        {/* Score label */}
        <text
          x="36"
          y="41"
          textAnchor="middle"
          fill={color}
          fontSize="16"
          fontWeight="900"
          fontFamily="inherit"
        >
          {Math.round(score)}
        </text>
      </svg>
      <span
        className="text-[10px] font-black tracking-wide uppercase"
        style={{ color }}
      >
        {cls}
      </span>
    </div>
  );
}
