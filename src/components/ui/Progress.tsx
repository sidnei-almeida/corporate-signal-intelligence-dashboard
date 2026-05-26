"use client";

import type { HTMLAttributes } from "react";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Fill amount 0–100 */
  value: number;
  max?: number;
  size?: "sm" | "md";
  indicatorClassName?: string;
}

export function Progress({
  value,
  max = 100,
  size = "md",
  className = "",
  indicatorClassName = "",
  ...props
}: ProgressProps) {
  const clamped = Math.min(max, Math.max(0, value));
  const percent = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(clamped)}
      className={`progress-track progress-track--${size} ${className}`.trim()}
      {...props}
    >
      <div
        className={`progress-indicator ${indicatorClassName}`.trim()}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
