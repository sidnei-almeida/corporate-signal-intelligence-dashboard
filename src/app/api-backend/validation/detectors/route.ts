import { errorResponse, json } from "@/server/http";
import { getArtifact } from "@/server/validation";

/** The benchmark: every detector's discrimination, precision at budget and rank. */
export function GET() {
  const records = getArtifact("detectors");
  if (records.length === 0) {
    return errorResponse(503, "Detector benchmark not available.");
  }
  return json({ count: records.length, records });
}
