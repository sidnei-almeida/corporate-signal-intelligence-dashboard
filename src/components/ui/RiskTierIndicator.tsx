import type { RiskTier } from "@/lib/formatters";
import { SEVERITY_METER_BY_RISK_TIER } from "@/lib/severityMeter";
import { SeverityMeter } from "@/components/ui/SeverityMeter";

interface RiskTierIndicatorProps {
  tier: RiskTier;
  suffix?: string;
  className?: string;
  compact?: boolean;
}

export function RiskTierIndicator({
  tier,
  suffix,
  className = "",
  compact = false,
}: RiskTierIndicatorProps) {
  const config = SEVERITY_METER_BY_RISK_TIER[tier];
  const label = suffix ? `${config.label} ${suffix}` : config.label;

  return (
    <SeverityMeter
      config={{ ...config, label }}
      className={className}
      compact={compact}
    />
  );
}
