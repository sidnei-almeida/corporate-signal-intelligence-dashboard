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
  Critical: { level: "critical", value: 95, label: "Critical" },
  High: { level: "high", value: 70, label: "High" },
  Medium: { level: "medium", value: 45, label: "Medium" },
  Low: { level: "low", value: 20, label: "Low" },
};

export const SEVERITY_METER_BY_RISK_TIER: Record<RiskTier, SeverityMeterConfig> =
  {
    High: { level: "critical", value: 95, label: "High" },
    Elevated: { level: "high", value: 70, label: "Elevated" },
    Moderate: { level: "medium", value: 45, label: "Moderate" },
    Low: { level: "low", value: 20, label: "Low" },
  };
