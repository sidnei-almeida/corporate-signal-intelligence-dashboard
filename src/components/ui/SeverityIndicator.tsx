import type { AnomalySeverity } from "@/lib/types";
import { SEVERITY_METER_BY_SEVERITY } from "@/lib/severityMeter";
import { SeverityMeter } from "@/components/ui/SeverityMeter";

interface SeverityIndicatorProps {
  severity: AnomalySeverity;
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
}

export function SeverityIndicator({
  severity,
  className = "",
  compact = false,
  showLabel = true,
}: SeverityIndicatorProps) {
  return (
    <SeverityMeter
      config={SEVERITY_METER_BY_SEVERITY[severity]}
      className={className}
      compact={compact}
      showLabel={showLabel}
    />
  );
}
