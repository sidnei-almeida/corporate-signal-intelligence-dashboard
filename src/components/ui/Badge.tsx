import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/** Minimal inline label wrapper for rare legacy uses */
export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      {children}
    </span>
  );
}
