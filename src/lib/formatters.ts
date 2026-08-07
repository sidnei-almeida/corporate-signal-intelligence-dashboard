import type { AnomalyRecord, AnomalySeverity, AnomalySummary } from "./types";
import { ANOMALY_TYPE_LABELS } from "./constants";
import { chartSeverityFill } from "./chartTheme";

export type RiskTier = "High" | "Elevated" | "Moderate" | "Low";

export type NumericInput = number | string | null | undefined;

/** API often returns DECIMAL columns as JSON strings. */
export function toFiniteNumber(value: NumericInput): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formatNumber(value: NumericInput, decimals = 2): string {
  const n = toFiniteNumber(value);
  if (n === undefined) {
    return "—";
  }
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: NumericInput, decimals = 2): string {
  const n = toFiniteNumber(value);
  if (n === undefined) {
    return "—";
  }
  const pct = Math.abs(n) <= 1 ? n * 100 : n;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${formatNumber(pct, decimals)}%`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const raw = String(value).slice(0, 10);
  const parsed = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** The conditional score is a number of standard deviations, so it reads in sigma. */
export function formatScore(value: NumericInput): string {
  const n = toFiniteNumber(value);
  if (n === undefined) {
    return "—";
  }
  return n.toFixed(2);
}

export function formatSigma(value: NumericInput): string {
  const n = toFiniteNumber(value);
  if (n === undefined) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}σ`;
}

export function formatTicker(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

/**
 * Score cutoffs per severity tier, as served by the API.
 *
 * These are quantiles of the conditional score, not fixed constants: "critical" is the
 * 0.1% budget cutoff, "high" the 0.25%, "moderate" the 0.5% and "watch" the 1%. The
 * defaults below match the shipped panel and are only a fallback — prefer the `severity`
 * field the API attaches to every record.
 */
export const SEVERITY_THRESHOLDS: [AnomalySeverity, number][] = [
  ["critical", 10.676],
  ["high", 8.158],
  ["moderate", 6.729],
  ["watch", 5.463],
];

export function getAnomalySeverity(score: NumericInput): AnomalySeverity {
  const n = toFiniteNumber(score);
  if (n === undefined) {
    return "below budget";
  }
  for (const [tier, threshold] of SEVERITY_THRESHOLDS) {
    if (n >= threshold) return tier;
  }
  return "below budget";
}

/** Prefer the tier the API computed; fall back to the local cutoffs. */
export function severityOf(record: AnomalyRecord): AnomalySeverity {
  return (record.severity as AnomalySeverity) ?? getAnomalySeverity(record.anomaly_score);
}

export const SEVERITY_LABELS: Record<AnomalySeverity, string> = {
  critical: "Critical",
  high: "High",
  moderate: "Moderate",
  watch: "Watch",
  "below budget": "Below budget",
};

export function formatSeverity(severity: AnomalySeverity | null | undefined): string {
  return severity ? (SEVERITY_LABELS[severity] ?? severity) : "—";
}

/**
 * Which of the three conditional deviations produced the score. The largest absolute
 * value *is* the score, so this is the reason the day was flagged rather than a guess.
 */
export const DEVIATION_FIELDS = [
  ["return_zscore_21d", "Price move"],
  ["volume_zscore_21d", "Volume spike"],
  ["range_zscore_21d", "Range expansion"],
] as const;

export function dominantDeviation(
  record: AnomalyRecord,
): { field: string; label: string; value: number } | null {
  let best: { field: string; label: string; value: number } | null = null;
  for (const [field, label] of DEVIATION_FIELDS) {
    const value = toFiniteNumber(record[field] as NumericInput);
    if (value === undefined) continue;
    if (!best || Math.abs(value) > Math.abs(best.value)) {
      best = { field, label, value };
    }
  }
  return best;
}

/** True when a filing landed inside the two-session reaction window. */
export function hasDisclosure(record: AnomalyRecord): boolean {
  return (
    (toFiniteNumber(record.filed_8k_2d) ?? 0) > 0 ||
    (toFiniteNumber(record.filed_10q_2d) ?? 0) > 0 ||
    (toFiniteNumber(record.filed_10k_2d) ?? 0) > 0
  );
}

export function formatAnomalyTypeLabel(type: string): string {
  const key = type.trim().toLowerCase();
  const raw = ANOMALY_TYPE_LABELS[key] ?? type.replace(/_/g, " ");
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length === 0) return type;
  return words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase(),
    )
    .join(" ");
}

export function formatAnomalyRate(rate: NumericInput): string {
  const n = toFiniteNumber(rate);
  if (n === undefined) return "—";
  return `${(n * 100).toFixed(2)}%`;
}

/**
 * The pipeline emits one label per alert ("range expansion with disclosure"), not the
 * comma-joined lists the earlier rule-based version produced. Kept as an array for the
 * call sites that map over it.
 */
export function splitAnomalyTypes(type: string | null | undefined): string[] {
  const label = type?.trim();
  return label && label !== "normal" ? [label] : [];
}

export function primaryAnomalyType(type: string | null | undefined): string {
  const parts = splitAnomalyTypes(type);
  return parts[0] ?? "unknown";
}

export function anomalyRecordsMatch(
  a: AnomalyRecord | null | undefined,
  b: AnomalyRecord | null | undefined,
): boolean {
  if (!a || !b) return false;
  return (
    formatTicker(String(a.ticker ?? "")) === formatTicker(String(b.ticker ?? "")) &&
    String(a.date ?? "").slice(0, 10) === String(b.date ?? "").slice(0, 10)
  );
}

export function getRiskTier(rate: NumericInput): RiskTier {
  const n = toFiniteNumber(rate);
  if (n === undefined) return "Low";
  if (n >= 0.05) return "High";
  if (n >= 0.03) return "Elevated";
  if (n >= 0.01) return "Moderate";
  return "Low";
}

export function getCompanyRiskRank(
  summaries: AnomalySummary[],
  ticker: string,
): number | null {
  const sorted = [...summaries].sort(
    (a, b) => (toFiniteNumber(b.anomaly_rate) ?? 0) - (toFiniteNumber(a.anomaly_rate) ?? 0),
  );
  const index = sorted.findIndex(
    (s) => formatTicker(s.ticker) === formatTicker(ticker),
  );
  return index >= 0 ? index + 1 : null;
}

export function countAnomalyTypesByRecord(
  records: AnomalyRecord[],
): { type: string; label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const record of records) {
    if (record.is_anomaly === false) continue;
    for (const t of splitAnomalyTypes(String(record.anomaly_type ?? ""))) {
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([type, count]) => ({
      type,
      label: formatAnomalyTypeLabel(type),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function severityChartFill(severity: AnomalySeverity): string {
  return chartSeverityFill[severity] ?? chartSeverityFill["below budget"];
}
