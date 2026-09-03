import { json } from "@/server/http";
import { getAnomalyTypes } from "@/server/panel";

/** How often each alert label occurs across the flagged days. */
export function GET() {
  return json(getAnomalyTypes());
}
