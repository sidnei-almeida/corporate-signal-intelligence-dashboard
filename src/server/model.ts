/**
 * Model metadata and single-row inference, both running inside the dashboard.
 *
 * The joblib artifact is no longer fetched from a model server: `isolationForest` walks
 * the exported trees in this process, so `/model/predict` is a pure function of the
 * request body.
 */

import {
  FEATURE_NAMES,
  MODEL_NAME,
  STRUCTURAL_THRESHOLD,
  decisionFunction,
  missingFeatures,
  predict,
  structuralScore,
  toFeatureRow,
} from "@/server/isolationForest";
import { getTrainingMetrics } from "@/server/validation";
import type { ModelInfo, ScoreInfo } from "@/lib/types";

/** Project the notebook's training metrics onto the response shape. */
function scoreInfo(payload: Record<string, unknown> | undefined): ScoreInfo | null {
  if (!payload) return null;
  return {
    name: (payload.name as string) ?? "unknown",
    definition: (payload.definition as string) ?? null,
    role: ((payload.role ?? payload.selected_because) as string) ?? null,
    requires_fitting: (payload.requires_fitting as boolean) ?? null,
    threshold: (payload.threshold as number) ?? null,
    roc_auc: (payload.roc_auc as number) ?? null,
    precision_at_budget: (payload.precision_at_budget as number) ?? null,
    precision_lift_over_base_rate: (payload.precision_lift_over_base_rate as number) ?? null,
    precision_at_budget_calm_market: (payload.precision_at_budget_calm_market as number) ?? null,
    precision_lift_calm_market: (payload.precision_lift_calm_market as number) ?? null,
  };
}

export function getModelInfo(): ModelInfo {
  const metrics = getTrainingMetrics();
  return {
    model_path: MODEL_NAME,
    model_exists: true,
    model_type: "Pipeline",
    expected_feature_count: FEATURE_NAMES.length,
    feature_names: [...FEATURE_NAMES],
    // The trees ship with the deployment rather than sitting behind a service call, and
    // the card reads this string straight through.
    artifact_status: "embedded",
    primary_score: scoreInfo(metrics.primary_score as Record<string, unknown>),
    secondary_score: scoreInfo(metrics.secondary_score as Record<string, unknown>),
  };
}

export class MissingFeaturesError extends Error {
  constructor(public features: string[]) {
    super(`Missing features: ${features.join(", ")}`);
    this.name = "MissingFeaturesError";
  }
}

export interface ModelPrediction {
  anomaly_label: "anomaly" | "normal";
  is_anomaly: boolean;
  anomaly_score: number;
  structural_score: number;
  structural_threshold: number;
  model_name: string;
}

/**
 * Score one issuer-day with the Isolation Forest.
 *
 * `anomaly_score` here is the decision function, matching what the Python endpoint
 * returned. `structural_score` is the same reading in the orientation the panel stores —
 * negated, so larger is more unusual — which is what the interface compares against the
 * exported threshold.
 */
export function predictSingle(
  features: Record<string, number | null | undefined>,
): ModelPrediction {
  const missing = missingFeatures(features);
  if (missing.length > 0) throw new MissingFeaturesError(missing);

  const row = toFeatureRow(features);
  const label = predict(row);
  return {
    anomaly_label: label === -1 ? "anomaly" : "normal",
    is_anomaly: label === -1,
    anomaly_score: decisionFunction(row),
    structural_score: structuralScore(row),
    structural_threshold: STRUCTURAL_THRESHOLD,
    model_name: MODEL_NAME,
  };
}

/**
 * The score that actually raises alerts: the largest of the three standardised
 * deviations, measured against the issuer's own trailing 21-session behaviour.
 *
 * It has no fitted parameters, which is why the benchmark selected it over the forest —
 * and why whichever deviation is largest *is* the explanation of the alert.
 */
export function conditionalScore(features: {
  return_zscore_21d?: number | null;
  volume_zscore_21d?: number | null;
  range_zscore_21d?: number | null;
}): { score: number | null; dominant: string | null } {
  const readings: [string, number][] = (
    ["return_zscore_21d", "volume_zscore_21d", "range_zscore_21d"] as const
  )
    .map((name) => [name, Math.abs(Number(features[name]))] as [string, number])
    .filter(([, value]) => Number.isFinite(value));

  if (readings.length === 0) return { score: null, dominant: null };
  const [dominant, score] = readings.reduce((best, current) =>
    current[1] > best[1] ? current : best,
  );
  return { score, dominant };
}
