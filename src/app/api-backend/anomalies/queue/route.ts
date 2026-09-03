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
    // The whole queue at the chosen budget, not a ranked head: the page filters by
    // ticker and severity client-side, and a truncated head is all-critical by
    // construction, so those filters would silently return nothing. 8000 clears the
    // widest budget the export covers.
    limit: limitParam(params, 100, 8000),
  });

  const withTier = withSeverity(records);
  return json({ count: withTier.length, budget, records: withTier });
}
