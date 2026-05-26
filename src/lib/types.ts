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

export interface AnomalyRecord {
  ticker?: string;
  date?: string;
  anomaly_score?: ApiNumber;
  is_anomaly?: boolean;
  anomaly_type?: string;
  daily_return?: ApiNumber;
  volume_zscore_30d?: ApiNumber;
  return_zscore_30d?: ApiNumber;
  volatility_30d?: ApiNumber;
  filing_count_30d?: ApiNumber;
  form_8k_count_30d?: ApiNumber;
  revenue_growth_qoq?: ApiNumber | null;
  net_margin?: ApiNumber | null;
  operating_margin?: ApiNumber | null;
  [key: string]: unknown;
}

export interface AnomalyListResponse {
  count: number;
  records: AnomalyRecord[];
}

export interface AnomalySummary {
  ticker: string;
  rows: number;
  anomalies: number;
  anomaly_rate: ApiNumber;
  min_score?: ApiNumber;
  avg_score?: ApiNumber;
  max_score?: ApiNumber;
}

export interface AnomalyTypeCount {
  anomaly_type: string;
  count: number;
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
}

export interface ModelInfo {
  model_path?: string;
  model_exists: boolean;
  model_type?: string | null;
  expected_feature_count?: number | null;
  feature_names?: string[];
  artifact_status?: string;
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

export type AnomalySeverity = "Critical" | "High" | "Medium" | "Low";
