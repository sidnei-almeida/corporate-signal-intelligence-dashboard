import { json } from "@/server/http";
import { availableArtifacts } from "@/server/validation";

/** The exported validation tables the build shipped. */
export function GET() {
  return json({ artifacts: availableArtifacts() });
}
