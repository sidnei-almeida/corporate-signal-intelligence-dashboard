import { json } from "@/server/http";
import { getArtifact } from "@/server/validation";

/** Which features drive the score, and what dominates on flagged days. */
export function GET() {
  return json({
    features: getArtifact("shap_attribution"),
    drivers: getArtifact("alert_drivers"),
  });
}
