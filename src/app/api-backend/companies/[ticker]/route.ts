import { errorResponse, json } from "@/server/http";
import { getCompanyProfile, isPlausibleTicker, normalizeTicker } from "@/server/panel";

/** Profile details for one issuer, including its most recent flagged day. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  if (!isPlausibleTicker(ticker)) {
    return errorResponse(404, `Invalid ticker '${ticker}'.`);
  }

  const normalized = normalizeTicker(ticker);
  const profile = getCompanyProfile(normalized);
  if (!profile) {
    return errorResponse(404, `Ticker '${normalized}' not found.`);
  }
  return json(profile);
}
