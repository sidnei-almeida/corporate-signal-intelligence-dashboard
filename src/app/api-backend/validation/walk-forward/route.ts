import { json } from "@/server/http";
import { getArtifact } from "@/server/validation";

/** Year-by-year performance under annual refitting on an expanding window. */
export function GET() {
  return json({ records: getArtifact("walk_forward") });
}
