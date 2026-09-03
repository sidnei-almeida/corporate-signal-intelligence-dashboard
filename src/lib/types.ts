export interface Company {
  ticker: string;
  company_name?: string;
  row_count?: number;
  first_date?: string;
  last_date?: string;
  anomaly_count?: number;
  anomaly_rate?: ApiNumber;
  total_anomalies?: number;
}

export interface CompanyProfile {
  ticker: string;
  row_count: number;
  first_date?: string;
  last_date?: string;
  anomaly_count: number;
  anomaly_rate: ApiNumber;
  latest_anomaly?: AnomalyRecord;
}

/** FastAPI/Postgres DECIMAL fields often serialize as strings in JSON. */
export type ApiNumber = number | string;

/**
 * One issuer-day.
 *
 * `anomaly_score` is the conditional deviation score: the largest of the three
 * standardised deviations below, measured against the issuer's own trailing 21-session
 * behaviour. Higher is more deviant — the opposite of the Isolation Forest score this
 * field used to carry. Whichever of the three z-scores is largest in absolute value *is*
 * the score, which is why an alert needs no separate explanation.
 */
export interface AnomalyRecord {
  ticker?: string;
  date?: string;
  anomaly_score?: ApiNumber;
  is_anomaly?: boolean;
  anomaly_type?: string;
  anomaly_label?: number;
  severity?: AnomalySeverity;

  /** Isolation Forest over the wider feature set: context only, raises no alerts. */
  structural_score?: ApiNumber;
  is_structural_outlier?: boolean;

  /** The three deviations the score is the maximum of. */
  return_zscore_21d?: ApiNumber;
  volume_zscore_21d?: ApiNumber;
  range_zscore_21d?: ApiNumber;

  /** Market context for the same session. */
  log_return?: ApiNumber;
  realised_volatility_21d?: ApiNumber;
  market_return?: ApiNumber;
  idiosyncratic_zscore?: ApiNumber;

  /** Disclosure activity inside the two-session reaction window. */
  filed_8k_2d?: ApiNumber;
  filed_10q_2d?: ApiNumber;
  filed_10k_2d?: ApiNumber;
  in_earnings_window?: ApiNumber;
  days_since_8k?: ApiNumber;

  [key: string]: unknown;
}

/**
 * The operating control of the tool: the share of issuer-days allowed to raise an alert.
 * The threshold follows from the budget, not the other way round.
 */
export interface AlertBudget {
  budget_pct: number;
  threshold?: ApiNumber | null;
  alerts: number;
  rows: number;
  alerts_per_year?: number | null;
}

export interface AnomalyListResponse {
  count: number;
  budget?: AlertBudget | null;
  records: AnomalyRecord[];
}

export interface AnomalySummary {
  ticker: string;
  rows: number;
  anomalies: number;
  /**
   * Descriptive only. The score is self-normalising, so under a fixed budget every
   * issuer converges on roughly the same rate — do not rank issuers by it.
   */
  anomaly_rate: ApiNumber;
  avg_score?: ApiNumber;
  max_score?: ApiNumber;
  latest_alert_date?: string | null;
}

export interface AnomalyTypeCount {
  anomaly_type: string;
  count: number;
  share_pct?: number;
}

export interface HealthResponse {
  status: string;
  service?: string;
  environment?: string;
  data_source?: string;
  database_configured?: boolean;
  database_connected?: boolean;
  database_populated?: boolean;
  model_available?: boolean;
  /** False when GROQ_API_KEY is unset: every other page works, briefings return 503. */
  briefings_available?: boolean;
  rows?: number;
  tickers?: number;
}

export interface ScoreInfo {
  name: string;
  definition?: string | null;
  role?: string | null;
  requires_fitting?: boolean | null;
  threshold?: number | null;
  roc_auc?: number | null;
  precision_at_budget?: number | null;
  precision_lift_over_base_rate?: number | null;
  /** Restricted to the quietest 80% of sessions, where triage is hardest. */
  precision_at_budget_calm_market?: number | null;
  precision_lift_calm_market?: number | null;
}

/**
 * The joblib artifact backs the *secondary* score only. The score that raises alerts is
 * a parameter-free rule, so `model_exists: false` does not mean the tool is down.
 */
export interface ModelInfo {
  model_path?: string;
  model_exists: boolean;
  model_type?: string | null;
  expected_feature_count?: number | null;
  feature_names?: string[];
  artifact_status?: string;
  primary_score?: ScoreInfo | null;
  secondary_score?: ScoreInfo | null;
}

/** The evaluation protocol behind the score, served by /validation/protocol. */
export interface ValidationProtocol {
  criterion?: string;
  forward_horizon?: number;
  stress_multiple?: number;
  alert_budget?: number;
  base_rate?: number;
  test_window?: [string, string];
  universe?: string[];
  primary_score?: ScoreInfo;
  secondary_score?: ScoreInfo;
  friedman?: {
    statistic?: number;
    p_value?: number;
    blocks?: number;
    significant_pairs_after_holm?: number;
    total_pairs?: number;
    significant_pairs_involving_best?: number;
    pairs_involving_best?: number;
  };
  walk_forward?: {
    mean_roc_auc?: number;
    min_roc_auc?: number;
    max_roc_auc?: number;
    years?: number[];
    pooled_precision_at_budget?: number;
    pooled_base_rate?: number;
  };
  calm_market?: {
    threshold_abs_market_return?: number;
    days?: number;
    base_rate?: number;
  };
  alerts?: {
    total?: number;
    per_year?: number;
    share_in_disclosure_window_pct?: number;
  };
}

export interface DetectorMetric {
  model: string;
  roc_auc: number;
  pr_auc?: number;
  lift?: number;
  precision_at_budget: number;
  recall_at_budget?: number;
  precision_lift: number;
  ci_low?: number;
  ci_high?: number;
  roc_auc_calm?: number;
  precision_calm?: number;
  precision_lift_calm?: number;
  average_rank?: number;
}

export interface WalkForwardYear {
  year: number;
  train_rows?: number;
  test_rows?: number;
  base_rate?: number;
  roc_auc: number;
}

export interface ShapAttribution {
  feature: string;
  block?: string;
  mean_abs_shap_all_days: number;
  mean_abs_shap_flagged: number;
}

export interface RegimeBehaviour {
  model: string;
  overall_pct?: number;
  "COVID shock"?: number;
  "2022 drawdown"?: number;
  calm_pct?: number;
  stress_multiple?: number;
}

export interface ValidationTableResponse<T> {
  artifact?: string;
  count?: number;
  records: T[];
}

export interface BriefingRequest {
  ticker: string;
  date: string;
}

export interface BriefingFromRecordRequest {
  record: Record<string, unknown>;
  company_context?: Record<string, unknown> | null;
}

export interface BriefingResponse {
  briefing: string;
  model_used?: string;
  ticker?: string | null;
  date?: string | null;
  source_record?: AnomalyRecord | null;
}

/**
 * Severity is the tightest alert budget a day would still survive, not an invented score
 * cutoff: "critical" means the day stays flagged even at a 0.1% budget. The API computes
 * it from the score distribution and returns it on every record.
 */
export type AnomalySeverity =
  | "critical"
  | "high"
  | "moderate"
  | "watch"
  | "below budget";
