import { Progress } from "@/components/ui/Progress";
import type { SeverityMeterConfig } from "@/lib/severityMeter";

interface SeverityMeterProps {
  config: SeverityMeterConfig;
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
}

/** Institutional risk meter — segmented progress pill + muted label */
export function SeverityMeter({
  config,
  className = "",
  compact = false,
  showLabel = true,
}: SeverityMeterProps) {
  const { level, value, label } = config;

  return (
    <div
      className={`risk-meter risk-meter--${level} ${
        compact ? "risk-meter--compact" : ""
      } ${className}`.trim()}
      role="group"
      aria-label={`Risk level: ${label}`}
    >
      <Progress
        value={value}
        size={compact ? "sm" : "md"}
        aria-label={label}
        className="risk-meter-progress"
      />
      {showLabel ? (
        <span className="risk-meter-label">{label}</span>
      ) : null}
    </div>
  );
}
