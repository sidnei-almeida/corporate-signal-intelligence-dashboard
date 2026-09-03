import { GroqNotConfiguredError, GROQ_MODEL, generateExecutiveBriefing } from "@/server/briefings";
import { errorResponse, json } from "@/server/http";

interface BriefingFromRecordRequest {
  record?: Record<string, unknown>;
  company_context?: Record<string, unknown> | null;
}

/** Generate a briefing from a record the client already holds, severity included. */
export async function POST(request: Request) {
  let body: BriefingFromRecordRequest;
  try {
    body = (await request.json()) as BriefingFromRecordRequest;
  } catch {
    return errorResponse(422, "Request body must be JSON.");
  }

  const record = body.record;
  if (!record || typeof record !== "object") {
    return errorResponse(422, "Body must contain a 'record' object.");
  }

  try {
    const briefing = await generateExecutiveBriefing(record, body.company_context);
    const date = record.date ? String(record.date).slice(0, 10) : null;
    return json({
      briefing,
      model_used: GROQ_MODEL,
      ticker: (record.ticker as string) ?? null,
      date,
      source_record: record,
    });
  } catch (error) {
    if (error instanceof GroqNotConfiguredError) return errorResponse(503, error.message);
    return errorResponse(500, "Failed to generate executive briefing.");
  }
}
