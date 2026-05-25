import type { AnomalySeverity } from "@/lib/types";
import { BADGE_BASE, SEVERITY_BADGE_CLASS } from "@/lib/badgeStyles";

interface SeverityIndicatorProps {
  severity: AnomalySeverity;
  className?: string;
}

export function SeverityIndicator({ severity, className = "" }: SeverityIndicatorProps) {
  return (
    <span
      className={`${BADGE_BASE} ${SEVERITY_BADGE_CLASS[severity]} ${className}`}
    >
      {severity}
    </span>
  );
}
