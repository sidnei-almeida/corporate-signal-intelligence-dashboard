import type {
  AlertBudget,
  AnomalyListResponse,
  AnomalyRecord,
  AnomalySummary,
  AnomalyTypeCount,
  BriefingFromRecordRequest,
  BriefingResponse,
  Company,
  CompanyProfile,
  DetectorMetric,
  HealthResponse,
  ModelInfo,
  RegimeBehaviour,
  ShapAttribution,
  ValidationProtocol,
  ValidationTableResponse,
  WalkForwardYear,
} from "./types";
import {
  buildBriefingCompanyContext,
  buildBriefingRecordPayload,
} from "@/lib/briefingPayload";

/** Same-origin proxy in dev/production — avoids browser CORS to Render. */
const API_BASE_URL = "/api-backend";

const REMOTE_API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://corporate-signal-intelligence.onrender.com";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public path: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Unable to reach the Corporate Anomaly Monitor API. Check your connection or try again after the Render instance wakes up.",
      0,
      path,
    );
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(detail, response.status, path);
  }

  return response.json() as Promise<T>;
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

export function getCompanies(): Promise<Company[]> {
  return apiFetch<Company[]>("/companies");
}

export function getCompanyProfile(ticker: string): Promise<CompanyProfile> {
  return apiFetch<CompanyProfile>(
    `/companies/${encodeURIComponent(ticker.trim().toUpperCase())}`,
  );
}

export function getTopAnomalies(limit = 20): Promise<AnomalyListResponse> {
  return apiFetch<AnomalyListResponse>(`/anomalies/top?limit=${limit}`);
}

/**
 * The alert queue at a given budget.
 *
 * The budget is the operating control: it says what share of issuer-days may raise an
 * alert, and the score threshold follows from it. Ten issuers at 1% is roughly twenty
 * alerts a year for the whole book.
 */
export function getAlertQueue(
  options: { budgetPct?: number; ticker?: string; limit?: number } = {},
): Promise<AnomalyListResponse> {
  const { budgetPct = 1, ticker, limit = 100 } = options;
  const params = new URLSearchParams({
    budget_pct: String(budgetPct),
    limit: String(limit),
  });
  if (ticker) params.set("ticker", ticker.trim().toUpperCase());
  return apiFetch<AnomalyListResponse>(`/anomalies/queue?${params}`);
}

/** Threshold and alert volume a budget implies, without fetching the rows. */
export function getAlertBudget(budgetPct = 1): Promise<AlertBudget> {
  return apiFetch<AlertBudget>(`/anomalies/budget?budget_pct=${budgetPct}`);
}

// --- Validation protocol ---------------------------------------------------------

export function getValidationProtocol(): Promise<ValidationProtocol> {
  return apiFetch<ValidationProtocol>("/validation/protocol");
}

export function getDetectorBenchmark(): Promise<
  ValidationTableResponse<DetectorMetric>
> {
  return apiFetch<ValidationTableResponse<DetectorMetric>>("/validation/detectors");
}

export function getWalkForward(): Promise<ValidationTableResponse<WalkForwardYear>> {
  return apiFetch<ValidationTableResponse<WalkForwardYear>>("/validation/walk-forward");
}

export function getAttribution(): Promise<{
  features: ShapAttribution[];
  drivers: { driver: string; share_pct: number }[];
}> {
  return apiFetch("/validation/attribution");
}

export function getRegimeBehaviour(): Promise<
  ValidationTableResponse<RegimeBehaviour>
> {
  return apiFetch<ValidationTableResponse<RegimeBehaviour>>(
    "/validation/regime_behaviour",
  );
}

export function getValidationArtifact<T>(
  name: string,
): Promise<ValidationTableResponse<T>> {
  return apiFetch<ValidationTableResponse<T>>(
    `/validation/${encodeURIComponent(name)}`,
  );
}

export function getAnomalySummary(): Promise<AnomalySummary[]> {
  return apiFetch<AnomalySummary[]>("/anomalies/summary");
}

export function getAnomalyTypes(): Promise<AnomalyTypeCount[]> {
  return apiFetch<AnomalyTypeCount[]>("/anomalies/types");
}

export function getTickerAnomalies(ticker: string): Promise<AnomalyListResponse> {
  return apiFetch<AnomalyListResponse>(
    `/anomalies/${encodeURIComponent(ticker.trim().toUpperCase())}`,
  );
}

export function getModelInfo(): Promise<ModelInfo> {
  return apiFetch<ModelInfo>("/model/info");
}

/** @deprecated Prefer generateBriefingFromRecord — sends severity + anomaly types */
export function generateBriefing(
  ticker: string,
  date: string,
): Promise<BriefingResponse> {
  return apiFetch<BriefingResponse>("/briefings/generate", {
    method: "POST",
    body: JSON.stringify({
      ticker: ticker.trim().toUpperCase(),
      date: date.slice(0, 10),
    }),
  });
}

/** Sends full anomaly context so the model receives severity and signal types */
export function generateBriefingFromRecord(
  record: AnomalyRecord,
  company?: Company | null,
): Promise<BriefingResponse> {
  const payload: BriefingFromRecordRequest = {
    record: buildBriefingRecordPayload(record),
    company_context: buildBriefingCompanyContext(record, company),
  };

  return apiFetch<BriefingResponse>("/briefings/generate-from-record", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export { API_BASE_URL, REMOTE_API_URL };
