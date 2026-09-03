import { json, limitParam } from "@/server/http";
import { getTopAnomalies, withSeverity } from "@/server/panel";

/** The most deviant issuer-days in the panel. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const records = withSeverity(getTopAnomalies(limitParam(params, 20, 500)));
  // `budget` is null rather than absent: the client's response type expects the key on
  // every list response, and only the queue fills it in.
  return json({ count: records.length, budget: null, records });
}
