/**
 * The serving layer, reading build-time exports instead of a Python API.
 *
 * `scripts/export_model_artifacts.py` reduces the 63k-row panel to the three slices the
 * old FastAPI service ever returned — the per-issuer aggregates, every row the alert
 * queue can reach at the maximum budget, and the flagged days — plus the budget-to-
 * threshold grid the request path used to recompute from the full score distribution.
 * That means no request here touches more than a few thousand rows.
 *
 * The definitions below mirror `app/services/data_service.py`; where a number is a
 * judgement call rather than arithmetic, the reasoning travels with it.
 */

import alertsArtifact from "@/data/generated/alerts.json";
import anomaliesArtifact from "@/data/generated/anomalies.json";
import panelArtifact from "@/data/generated/panel.json";
import type {
  AlertBudget,
  AnomalyRecord,
  AnomalySeverity,
  AnomalySummary,
  AnomalyTypeCount,
  Company,
  CompanyProfile,
} from "@/lib/types";

interface PanelArtifact {
  totalRows: number;
  scoredRows: number;
  panelSpanYears: number | null;
  companies: Company[];
  summary: AnomalySummary[];
  profiles: Record<string, CompanyProfile>;
  topAnomalies: AnomalyRecord[];
  anomalyTypes: AnomalyTypeCount[];
  budgetThresholds: Record<string, number>;
  severityThresholds: { tier: AnomalySeverity; threshold: number }[];
}

const panel = panelArtifact as unknown as PanelArtifact;

/** Already ranked most deviant first by the export script. */
const queueRecords = (alertsArtifact as { records: AnomalyRecord[] }).records;
const flaggedRecords = (anomaliesArtifact as { records: AnomalyRecord[] }).records;

// The conditional score runs the opposite way to the Isolation Forest decision function
// it replaced: a larger value is a larger deviation, so every ordering here is descending.
export const SCORE_SORT_ASCENDING = false;

export const MIN_BUDGET_PCT = 0.1;
export const MAX_BUDGET_PCT = 10.0;

/** Step of the exported budget grid, in percentage points. */
const BUDGET_STEP = 0.05;

export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

/** URL segments that name a static route and must never be read as a ticker. */
export const RESERVED_ANOMALY_SEGMENTS = new Set([
  "TOP",
  "SUMMARY",
  "TYPES",
  "QUEUE",
  "BUDGET",
]);

export function isPlausibleTicker(ticker: string): boolean {
  const normalized = normalizeTicker(ticker);
  if (!normalized || RESERVED_ANOMALY_SEGMENTS.has(normalized)) return false;
  return /^[A-Z0-9.\-]+$/.test(normalized) && /[A-Z0-9]/.test(normalized);
}

// --- severity -------------------------------------------------------------------

/**
 * Severity is expressed as the tightest budget a day would still survive, which keeps the
 * tiers on the same footing as the operating control instead of inventing score cutoffs:
 * "critical" means the day would still be flagged if the analyst had a tenth the attention.
 */
export function severityTier(score: number | null | undefined): AnomalySeverity | null {
  if (score === null || score === undefined || !Number.isFinite(score)) return null;
  for (const { tier, threshold } of panel.severityThresholds) {
    if (score >= threshold) return tier;
  }
  return "below budget";
}

export function severityThresholds(): { tier: AnomalySeverity; threshold: number }[] {
  return panel.severityThresholds;
}

/** Attach the severity tier so every consumer reads one definition of it. */
export function withSeverity(records: AnomalyRecord[]): AnomalyRecord[] {
  return records.map((record) => {
    const score = record.anomaly_score;
    return {
      ...record,
      severity: severityTier(typeof score === "number" ? score : Number(score)) ?? undefined,
    };
  });
}

// --- alert budget ---------------------------------------------------------------

function clampBudget(budgetPct: number): number {
  if (!Number.isFinite(budgetPct)) return 1;
  return Math.max(MIN_BUDGET_PCT, Math.min(MAX_BUDGET_PCT, budgetPct));
}

/**
 * The score cutoff a budget implies.
 *
 * Thresholds were taken as exact quantiles over the full score distribution at export
 * time; a budget between two grid points snaps to the nearest one, which moves the cutoff
 * by at most a twentieth of a percentage point of issuer-days.
 */
function thresholdForBudget(budgetPct: number): number | null {
  const snapped = Math.round(budgetPct / BUDGET_STEP) * BUDGET_STEP;
  const key = clampBudget(snapped).toFixed(2);
  const threshold = panel.budgetThresholds[key];
  return threshold === undefined ? null : threshold;
}

/**
 * Translate an alert budget into the threshold and the volume it implies.
 *
 * The operating model is a fixed share of issuer-days that may raise an alert, not a
 * fixed score cutoff. An analyst has a certain amount of attention; the budget converts
 * it into a threshold. Because the score is self-normalising, that threshold is stable
 * across regimes, which is exactly why the budget is the control worth exposing.
 */
export function resolveBudget(budgetPct: number): AlertBudget {
  const budget = clampBudget(budgetPct);
  const threshold = thresholdForBudget(budget);
  const rows = panel.scoredRows;
  const alerts = Math.round((rows * budget) / 100);
  const years = panel.panelSpanYears;

  return {
    budget_pct: Number(budget.toFixed(3)),
    threshold,
    alerts,
    rows,
    alerts_per_year: years ? Number((alerts / years).toFixed(1)) : null,
  };
}

// --- queries --------------------------------------------------------------------

function scoreOf(record: AnomalyRecord): number {
  const value = record.anomaly_score;
  const score = typeof value === "number" ? value : Number(value);
  return Number.isFinite(score) ? score : Number.NEGATIVE_INFINITY;
}

export function getCompanies(): Company[] {
  return panel.companies;
}

export function getCompanyProfile(ticker: string): CompanyProfile | null {
  return panel.profiles[normalizeTicker(ticker)] ?? null;
}

export function tickerExists(ticker: string): boolean {
  return normalizeTicker(ticker) in panel.profiles;
}

export function getAnomalySummary(): AnomalySummary[] {
  return panel.summary;
}

export function getAnomalyTypes(): AnomalyTypeCount[] {
  return panel.anomalyTypes;
}

export function getTopAnomalies(limit = 20): AnomalyRecord[] {
  return panel.topAnomalies.slice(0, Math.max(0, limit));
}

/** The flagged days for one issuer, oldest first — the shape `/anomalies/{ticker}` returns. */
export function getCompanyAnomalies(ticker: string): AnomalyRecord[] {
  const normalized = normalizeTicker(ticker);
  return flaggedRecords.filter((record) => record.ticker === normalized);
}

export function findAnomalyRecord(ticker: string, date: string): AnomalyRecord | null {
  const normalized = normalizeTicker(ticker);
  const day = date.slice(0, 10);
  return (
    flaggedRecords.find((record) => record.ticker === normalized && record.date === day) ??
    queueRecords.find((record) => record.ticker === normalized && record.date === day) ??
    null
  );
}

/** The alert queue at a given budget, most deviant first. */
export function queryByBudget(options: {
  budgetPct?: number;
  ticker?: string;
  limit?: number;
}): { records: AnomalyRecord[]; budget: AlertBudget } {
  const { budgetPct = 1, ticker, limit = 100 } = options;
  const budget = resolveBudget(budgetPct);
  if (budget.threshold === null || budget.threshold === undefined) {
    return { records: [], budget };
  }

  const cutoff = Number(budget.threshold);
  const normalized = ticker ? normalizeTicker(ticker) : null;
  const matches: AnomalyRecord[] = [];
  for (const record of queueRecords) {
    if (scoreOf(record) < cutoff) break; // queueRecords is sorted descending
    if (normalized && record.ticker !== normalized) continue;
    matches.push(record);
    if (matches.length >= limit) break;
  }
  return { records: matches, budget };
}

/**
 * Ranked issuer-days, optionally narrowed to one issuer.
 *
 * The export keeps every row down to roughly the 11th percentile of the score, which is
 * past the widest budget the queue accepts, so any ranked head this returns is complete.
 */
export function queryAnomalies(options: {
  ticker?: string;
  limit?: number;
  onlyAnomalies?: boolean;
  sortBy?: string;
  ascending?: boolean;
}): AnomalyRecord[] {
  const {
    ticker,
    limit = 100,
    onlyAnomalies = true,
    sortBy = "anomaly_score",
    ascending = SCORE_SORT_ASCENDING,
  } = options;

  const normalized = ticker ? normalizeTicker(ticker) : null;
  const source = onlyAnomalies ? flaggedRecords : queueRecords;

  let rows = normalized ? source.filter((record) => record.ticker === normalized) : [...source];

  const key = sortBy in (rows[0] ?? {}) ? sortBy : "anomaly_score";
  rows = [...rows].sort((left, right) => {
    const a = Number(left[key] ?? Number.NEGATIVE_INFINITY);
    const b = Number(right[key] ?? Number.NEGATIVE_INFINITY);
    if (Number.isNaN(a) && Number.isNaN(b)) return 0;
    if (Number.isNaN(a)) return 1;
    if (Number.isNaN(b)) return -1;
    return ascending ? a - b : b - a;
  });

  return rows.slice(0, Math.max(0, limit));
}

export const PANEL_STATS = {
  totalRows: panel.totalRows,
  scoredRows: panel.scoredRows,
  panelSpanYears: panel.panelSpanYears,
  tickers: Object.keys(panel.profiles).sort(),
};
