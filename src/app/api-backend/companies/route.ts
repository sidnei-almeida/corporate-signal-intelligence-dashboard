import { json } from "@/server/http";
import { getCompanies } from "@/server/panel";

/** Available tickers and their panel coverage. */
export function GET() {
  return json(getCompanies());
}
