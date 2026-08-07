import type { AnomalySeverity } from "@/lib/types";
import type { RiskTier } from "@/lib/formatters";

export type SeverityMeterLevel = "critical" | "high" | "medium" | "low";

export interface SeverityMeterConfig {
  level: SeverityMeterLevel;
  /** Fill percentage 0–100 for the risk meter pill */
  value: number;
  label: string;
}

export const SEVERITY_METER_BY_SEVERITY: Record<
  AnomalySeverity,
  SeverityMeterConfig
> = {
  critical: { level: "critical", value: 95, label: "Critical" },
  high: { level: "high", value: 70, label: "High" },
  moderate: { level: "medium", value: 45, label: "Moderate" },
  watch: { level: "low", value: 20, label: "Watch" },
  "below budget": { level: "low", value: 8, label: "Below budget" },
};

export const SEVERITY_METER_BY_RISK_TIER: Record<RiskTier, SeverityMeterConfig> =
  {
    High: { level: "critical", value: 95, label: "High" },
    Elevated: { level: "high", value: 70, label: "Elevated" },
    Moderate: { level: "medium", value: 45, label: "Moderate" },
    Low: { level: "low", value: 20, label: "Low" },
  };
