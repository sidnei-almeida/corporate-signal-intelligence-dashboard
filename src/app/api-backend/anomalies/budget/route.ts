import { json, numberParam } from "@/server/http";
import { resolveBudget } from "@/server/panel";

/** The threshold and alert volume a budget implies, without fetching the rows. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return json(resolveBudget(numberParam(params, "budget_pct", 1)));
}
