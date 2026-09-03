import { GroqNotConfiguredError, GROQ_MODEL, generateExecutiveBriefing } from "@/server/briefings";
import { errorResponse, json } from "@/server/http";
import { findAnomalyRecord, getCompanyProfile, withSeverity } from "@/server/panel";

/** @deprecated Prefer /briefings/generate-from-record, which carries the full context. */
export async function POST(request: Request) {
  let body: { ticker?: string; date?: string };
  try {
    body = (await request.json()) as { ticker?: string; date?: string };
  } catch {
    return errorResponse(422, "Request body must be JSON.");
  }

  const ticker = body.ticker?.trim().toUpperCase();
  const date = body.date?.slice(0, 10);
  if (!ticker || !date) {
    return errorResponse(422, "Both 'ticker' and 'date' are required.");
  }

  const found = findAnomalyRecord(ticker, date);
  if (!found) {
    return errorResponse(404, `No anomaly record found for ${ticker} on ${date}.`);
  }

  const [record] = withSeverity([found]);
  try {
    const briefing = await generateExecutiveBriefing(
      record as Record<string, unknown>,
      (getCompanyProfile(ticker) ?? undefined) as Record<string, unknown> | undefined,
    );
    return json({
      briefing,
      model_used: GROQ_MODEL,
      ticker: record.ticker ?? null,
      date: record.date ?? null,
      source_record: record,
    });
  } catch (error) {
    if (error instanceof GroqNotConfiguredError) return errorResponse(503, error.message);
    return errorResponse(500, "Failed to generate executive briefing.");
  }
}
