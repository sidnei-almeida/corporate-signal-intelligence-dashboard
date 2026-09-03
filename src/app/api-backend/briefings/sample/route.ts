import { GroqNotConfiguredError, GROQ_MODEL, generateExecutiveBriefing } from "@/server/briefings";
import { errorResponse, json } from "@/server/http";
import { getCompanyProfile, getTopAnomalies, withSeverity } from "@/server/panel";

/** Generate a briefing for the current top anomaly. */
export async function GET() {
  const top = withSeverity(getTopAnomalies(1));
  if (top.length === 0) {
    return errorResponse(404, "No anomaly records available.");
  }

  const record = top[0];
  const ticker = record.ticker ? String(record.ticker) : "";
  try {
    const briefing = await generateExecutiveBriefing(
      record as Record<string, unknown>,
      ticker
        ? ((getCompanyProfile(ticker) ?? undefined) as Record<string, unknown> | undefined)
        : undefined,
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
