import { errorResponse, json } from "@/server/http";
import { MissingFeaturesError, conditionalScore, predictSingle } from "@/server/model";

interface PredictRequest {
  features?: Record<string, number | null>;
}

/**
 * Score one issuer-day.
 *
 * Both scores come back: the conditional deviation rule that actually raises alerts, and
 * the Isolation Forest reading that travels alongside it as context. The forest runs in
 * this process — the request never leaves the deployment.
 */
export async function POST(request: Request) {
  let body: PredictRequest;
  try {
    body = (await request.json()) as PredictRequest;
  } catch {
    return errorResponse(422, "Request body must be JSON.");
  }

  const features = body.features;
  if (!features || typeof features !== "object") {
    return errorResponse(422, "Body must contain a 'features' object.");
  }

  try {
    const prediction = predictSingle(features);
    const conditional = conditionalScore(features);
    return json({
      ...prediction,
      conditional_score: conditional.score,
      dominant_deviation: conditional.dominant,
    });
  } catch (error) {
    if (error instanceof MissingFeaturesError) {
      return errorResponse(422, error.message);
    }
    return errorResponse(500, "Model inference failed.");
  }
}
