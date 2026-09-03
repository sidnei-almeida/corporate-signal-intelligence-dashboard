import { errorResponse, json, limitParam, numberParam } from "@/server/http";
import { normalizeTicker, queryByBudget, tickerExists, withSeverity } from "@/server/panel";

/**
 * The alert queue at a given budget.
 *
 * The budget is the operating control: it says what share of issuer-days may raise an
 * alert, and the score threshold follows from it.
 */
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

  const { records, budget } = queryByBudget({
    budgetPct: numberParam(params, "budget_pct", 1),
    ticker,
    limit: limitParam(params, 100, 500),
  });

  const withTier = withSeverity(records);
  return json({ count: withTier.length, budget, records: withTier });
}
