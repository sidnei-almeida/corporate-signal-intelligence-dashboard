import type { RiskTier } from "@/lib/formatters";
import { BADGE_BASE, RISK_TIER_BADGE_CLASS } from "@/lib/badgeStyles";

interface RiskTierIndicatorProps {
  tier: RiskTier;
  suffix?: string;
  className?: string;
}

export function RiskTierIndicator({
  tier,
  suffix,
  className = "",
}: RiskTierIndicatorProps) {
  return (
    <span className={`${BADGE_BASE} ${RISK_TIER_BADGE_CLASS[tier]} ${className}`}>
      {tier}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}
