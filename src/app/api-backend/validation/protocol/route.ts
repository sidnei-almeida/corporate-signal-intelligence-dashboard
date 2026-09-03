import { errorResponse, json } from "@/server/http";
import { getProtocol } from "@/server/validation";

/** The evaluation criterion, the selected score, and the headline evidence. */
export function GET() {
  const protocol = getProtocol();
  if (!protocol.criterion) {
    return errorResponse(503, "Validation artifacts are not available.");
  }
  return json(protocol);
}
