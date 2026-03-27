"use client";

import { useEffect, useState } from "react";

interface ConfidenceMeterProps {
  value: number;
  size?: number;
}

export function ConfidenceMeter({ value, size = 120 }: ConfidenceMeterProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    // Animate number counting up
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const color =
    value < 80
      ? "stroke-amber-500"
      : value < 95
        ? "stroke-primary"
        : "stroke-green-500";

  const bgColor =
    value < 80
      ? "text-amber-500"
      : value < 95
        ? "text-primary"
        : "text-green-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.5s ease-out",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-2xl font-bold ${bgColor}`}>{displayed}%</span>
        <span className="text-[10px] text-muted-foreground">Confidence</span>
      </div>
    </div>
  );
}
