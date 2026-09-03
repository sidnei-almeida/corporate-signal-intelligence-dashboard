import { errorResponse, json, limitParam } from "@/server/http";
import {
  SCORE_SORT_ASCENDING,
  normalizeTicker,
  queryAnomalies,
  tickerExists,
  withSeverity,
} from "@/server/panel";

/** Filtered issuer-days, most deviant first. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const rawTicker = params.get("ticker");
  let ticker: string | undefined;
  if (rawTicker) {
    ticker = normalizeTicker(rawTicker);
    if (!tickerExists(ticker)) {
      return errorResponse(404, `Ticker '${ticker}' not found.`);
    }
  }

  const records = withSeverity(
    queryAnomalies({
      ticker,
      limit: limitParam(params, 100),
      onlyAnomalies: params.get("only_anomalies") !== "false",
      sortBy: params.get("sort_by") ?? "anomaly_score",
      ascending: params.get("ascending") === "true" ? true : SCORE_SORT_ASCENDING,
    }),
  );

  return json({ count: records.length, budget: null, records });
}
