import { errorResponse, json } from "@/server/http";
import { availableArtifacts, getArtifact, isKnownArtifact } from "@/server/validation";

/** Serve any exported validation table by name. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ artifact: string }> },
) {
  const { artifact } = await params;
  if (!isKnownArtifact(artifact)) {
    return errorResponse(
      404,
      `Unknown validation artifact '${artifact}'. Available: ${availableArtifacts().join(", ")}.`,
    );
  }

  const records = getArtifact(artifact);
  if (records.length === 0) {
    return errorResponse(503, `Artifact '${artifact}' is not available.`);
  }
  return json({ artifact, count: records.length, records });
}
