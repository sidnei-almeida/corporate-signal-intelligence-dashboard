import type { AnomalyRecord, AnomalySeverity, Company } from "@/lib/types";
import {
  formatAnomalyTypeLabel,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  splitAnomalyTypes,
} from "@/lib/formatters";

/**
 * Severity tiers, expressed as the tightest alert budget a day would still survive.
 * Higher score = larger deviation, so these are minimums, not maximums.
 */
export const ANOMALY_SEVERITY_THRESHOLDS: Record<
  AnomalySeverity,
  { minScore: number; budgetPct: number; description: string }
> = {
  critical: {
    minScore: 10.676,
    budgetPct: 0.1,
    description: "Still flagged at a tenth of the standard budget",
  },
  high: {
    minScore: 8.158,
    budgetPct: 0.25,
    description: "Still flagged at a quarter of the standard budget",
  },
  moderate: {
    minScore: 6.729,
    budgetPct: 0.5,
    description: "Still flagged at half the standard budget",
  },
  watch: {
    minScore: 5.463,
    budgetPct: 1,
    description: "Flagged at the standard 1% budget",
  },
  "below budget": {
    minScore: 0,
    budgetPct: 100,
    description: "Below the alert threshold",
  },
};

export function buildBriefingRecordPayload(
  record: AnomalyRecord,
): Record<string, unknown> {
  const severity = getAnomalySeverity(record.anomaly_score);
  const typesRaw = splitAnomalyTypes(String(record.anomaly_type ?? ""));
  const typeLabels = typesRaw.map(formatAnomalyTypeLabel);

  return {
    ...record,
    ticker: formatTicker(String(record.ticker ?? "")),
    date: String(record.date ?? "").slice(0, 10),
    severity,
    risk_severity: severity,
    anomaly_severity: severity,
    event_severity: severity,
    anomaly_score_display: formatScore(record.anomaly_score),
    anomaly_types: typesRaw,
    anomaly_type_labels: typeLabels,
    primary_anomaly_type: typeLabels[0] ?? null,
    severity_thresholds: ANOMALY_SEVERITY_THRESHOLDS,
    severity_instructions:
      "Use severity / risk_severity / event_severity exactly as provided. " +
      "Do NOT downgrade to Moderate or Low unless that is the classified value. " +
      "Lower anomaly_score means higher risk.",
  };
}

export function buildBriefingCompanyContext(
  record: AnomalyRecord,
  company?: Company | null,
): Record<string, unknown> {
  const severity = getAnomalySeverity(record.anomaly_score);
  const typeLabels = splitAnomalyTypes(String(record.anomaly_type ?? "")).map(
    formatAnomalyTypeLabel,
  );

  return {
    company_name: company?.company_name ?? null,
    ticker: formatTicker(String(record.ticker ?? "")),
    classified_event_severity: severity,
    classified_anomaly_types: typeLabels,
    anomaly_score: formatScore(record.anomaly_score),
    briefing_must_state_severity: severity,
    briefing_must_mention_types: typeLabels,
    analyst_instruction:
      `The monitoring dashboard classifies this event as ${severity} severity ` +
      `(anomaly_score ${formatScore(record.anomaly_score)}). ` +
      `Signal drivers: ${typeLabels.length > 0 ? typeLabels.join(", ") : "see anomaly_type"}. ` +
      `The executive memo must use ${severity} — not Moderate — when describing event severity.`,
    severity_thresholds: ANOMALY_SEVERITY_THRESHOLDS,
  };
}
