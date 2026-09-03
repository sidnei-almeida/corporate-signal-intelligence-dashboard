/**
 * The exported Isolation Forest, bound to the artifact the build ships.
 *
 * The maths lives in `isolationForestCore` so the parity check can run it under plain
 * Node; this module is the part the route handlers talk to.
 */

import forestArtifact from "@/data/generated/isolation-forest.json";
import {
  decisionFunction as coreDecisionFunction,
  predict as corePredict,
  scoreSamples as coreScoreSamples,
  type FeatureRow,
  type ForestArtifact,
} from "@/server/isolationForestCore";

const forest = forestArtifact as ForestArtifact;

export const FEATURE_NAMES: readonly string[] = forest.featureNames;

/** File name the trained artifact was exported from, echoed in `/model` responses. */
export const MODEL_NAME = "isolation_forest_anomaly_pipeline.joblib";

/**
 * The structural score as the panel stores it: `score_samples` negated, so a larger
 * reading means a more unusual combination of features. It crosses `STRUCTURAL_THRESHOLD`
 * at exactly the point `decision_function` turns negative.
 */
export function structuralScore(row: FeatureRow): number {
  return -coreScoreSamples(forest, row);
}

export function scoreSamples(row: FeatureRow): number {
  return coreScoreSamples(forest, row);
}

export function decisionFunction(row: FeatureRow): number {
  return coreDecisionFunction(forest, row);
}

export function predict(row: FeatureRow): -1 | 1 {
  return corePredict(forest, row);
}

export const STRUCTURAL_THRESHOLD = -forest.offset;

/** Order a feature map into the column order the trees were fitted on. */
export function toFeatureRow(
  features: Record<string, number | null | undefined>,
): (number | null | undefined)[] {
  return forest.featureNames.map((name) => features[name]);
}

/** Feature names the caller left out — the request is rejected rather than imputed. */
export function missingFeatures(features: Record<string, unknown>): string[] {
  return forest.featureNames.filter((name) => !(name in features));
}
