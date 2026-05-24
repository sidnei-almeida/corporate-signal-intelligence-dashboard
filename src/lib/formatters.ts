import type { AnomalyRecord, AnomalySeverity, AnomalySummary } from "./types";

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

export function formatScore(value: NumericInput): string {
  const n = toFiniteNumber(value);
  if (n === undefined) {
    return "—";
  }
  return n.toFixed(4);
}

export function formatTicker(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

export function getAnomalySeverity(score: NumericInput): AnomalySeverity {
  const n = toFiniteNumber(score);
  if (n === undefined) {
    return "Low";
  }
  if (n <= -0.1) return "Critical";
  if (n <= -0.07) return "High";
  if (n <= -0.04) return "Medium";
  return "Low";
}

export function severityStyles(severity: AnomalySeverity): string {
  switch (severity) {
    case "Critical":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    case "High":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "Medium":
      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-white/10";
  }
}

export function formatAnomalyRate(rate: NumericInput): string {
  const n = toFiniteNumber(rate);
  if (n === undefined) return "—";
  return `${(n * 100).toFixed(2)}%`;
}

export function splitAnomalyTypes(type: string | null | undefined): string[] {
  if (!type) return [];
  return type
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
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

export function riskTierStyles(tier: RiskTier): string {
  switch (tier) {
    case "High":
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";
    case "Elevated":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "Moderate":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-400";
  }
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
      label: type.replace(/_/g, " "),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function severityChartFill(severity: AnomalySeverity): string {
  switch (severity) {
    case "Critical":
      return "rgba(244, 63, 94, 0.9)";
    case "High":
      return "rgba(245, 158, 11, 0.85)";
    case "Medium":
      return "rgba(34, 211, 238, 0.75)";
    default:
      return "rgba(100, 116, 139, 0.7)";
  }
}
