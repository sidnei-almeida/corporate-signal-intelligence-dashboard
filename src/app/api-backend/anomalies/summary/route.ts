import { json } from "@/server/http";
import { getAnomalySummary } from "@/server/panel";

/** Per-issuer descriptive counts. */
export function GET() {
  return json(getAnomalySummary());
}
