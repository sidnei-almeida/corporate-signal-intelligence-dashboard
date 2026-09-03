import { errorResponse, json } from "@/server/http";
import {
  RESERVED_ANOMALY_SEGMENTS,
  getCompanyAnomalies,
  isPlausibleTicker,
  normalizeTicker,
  tickerExists,
  withSeverity,
} from "@/server/panel";

/** Every flagged day for one issuer, oldest first. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;

  // Next matches the static routes case-sensitively, so a request for /anomalies/QUEUE
  // lands here rather than on the queue. Name the real resources instead of calling it
  // an unknown ticker.
  if (RESERVED_ANOMALY_SEGMENTS.has(normalizeTicker(ticker))) {
    return errorResponse(
      404,
      `Unknown anomalies resource '${ticker}'. Use /anomalies/queue, /anomalies/budget, ` +
        "/anomalies/top, /anomalies/summary, or /anomalies/types.",
    );
  }
  if (!isPlausibleTicker(ticker)) {
    return errorResponse(404, `Invalid ticker '${ticker}'.`);
  }

  const normalized = normalizeTicker(ticker);
  if (!tickerExists(normalized)) {
    return errorResponse(404, `Ticker '${normalized}' not found.`);
  }

  const records = withSeverity(getCompanyAnomalies(normalized));
  return json({ count: records.length, budget: null, records });
}
