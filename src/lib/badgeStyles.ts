import type { AnomalySeverity } from "@/lib/types";
import type { RiskTier } from "@/lib/formatters";
import { INLINE_TEXT_TAG, STATUS_PILL_OK } from "@/lib/cardVisuals";

export const SEVERITY_BADGE_CLASS: Record<AnomalySeverity, string> = {
  Critical: "severity-badge severity-badge-critical",
  High: "severity-badge severity-badge-high",
  Medium: "severity-badge severity-badge-moderate",
  Low: "severity-badge severity-badge-moderate",
};

export const RISK_TIER_BADGE_CLASS: Record<RiskTier, string> = {
  High: SEVERITY_BADGE_CLASS.Critical,
  Elevated: SEVERITY_BADGE_CLASS.High,
  Moderate: SEVERITY_BADGE_CLASS.Medium,
  Low: SEVERITY_BADGE_CLASS.Low,
};

export const BADGE_BASE = "severity-badge";

export const ANOMALY_TYPE_CHIP = INLINE_TEXT_TAG;

export const STATUS_BADGE =
  "inline-flex items-center gap-1.5 rounded-[20px] border border-[rgba(0,212,255,0.08)] bg-[rgba(255,255,255,0.03)] px-[10px] py-[2px] font-display text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]";

export const STATUS_BADGE_OK = STATUS_PILL_OK;
