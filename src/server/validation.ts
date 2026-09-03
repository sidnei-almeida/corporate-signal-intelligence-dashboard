/**
 * The evidence the evaluation notebook produced, served from the build-time export.
 *
 * These artifacts are what separates the tool from a generic anomaly dashboard: the
 * benchmark that put ten detectors under one protocol, the prospective criterion they
 * were scored against, and the walk-forward and attribution results. They are exported
 * from the notebook's own CSVs rather than restated in code, so the numbers served are
 * the ones the last run measured.
 */

import validationArtifact from "@/data/generated/validation.json";
import type { ValidationProtocol } from "@/lib/types";

interface ValidationArtifact {
  artifacts: Record<string, Record<string, unknown>[]>;
  summary: Record<string, unknown>;
  trainingMetrics: Record<string, unknown>;
  featureSchema: {
    features?: { name: string; block: string }[];
    n_features?: number;
    primary_score?: Record<string, unknown>;
    secondary_score?: Record<string, unknown>;
  };
}

const validation = validationArtifact as unknown as ValidationArtifact;

export function getArtifact(name: string): Record<string, unknown>[] {
  return validation.artifacts[name] ?? [];
}

export function isKnownArtifact(name: string): boolean {
  return name in validation.artifacts;
}

export function availableArtifacts(): string[] {
  return Object.keys(validation.artifacts)
    .filter((name) => validation.artifacts[name].length > 0)
    .sort();
}

export function getTrainingMetrics(): Record<string, unknown> {
  return validation.trainingMetrics;
}

export function getFeatureNames(): string[] {
  return (validation.featureSchema.features ?? []).map((feature) => feature.name);
}

export function getFeatureSchema(): ValidationArtifact["featureSchema"] {
  return validation.featureSchema;
}

/** The headline claim, assembled from the summary and the selected-score metrics. */
export function getProtocol(): ValidationProtocol {
  const summary = validation.summary as Record<string, never>;
  const metrics = validation.trainingMetrics as Record<string, never>;
  return {
    criterion: summary.criterion,
    forward_horizon: summary.forward_horizon,
    stress_multiple: summary.stress_multiple,
    alert_budget: summary.alert_budget,
    base_rate: summary.base_rate,
    test_window: summary.test_window,
    universe: summary.universe ?? [],
    primary_score: metrics.primary_score,
    secondary_score: metrics.secondary_score,
    friedman: summary.friedman ?? {},
    walk_forward: summary.walk_forward ?? {},
    calm_market: summary.calm_market ?? {},
    alerts: summary.alerts ?? {},
  };
}
