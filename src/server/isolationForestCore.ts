/**
 * The trained pipeline, re-implemented over the exported arrays.
 *
 * `scripts/export_model_artifacts.py` flattens Pipeline(SimpleImputer, RobustScaler,
 * IsolationForest) into medians, scaler parameters and split arrays. What follows walks
 * those arrays exactly the way scikit-learn does, so the score this file returns is the
 * score the notebook measured — no Python process, no model server, no external API.
 *
 * Nothing here imports the artifact: every function takes it as an argument, which is
 * what lets `scripts/verify_model_parity.mts` replay scikit-learn's own output through
 * this exact code under plain Node.
 */

/** scikit-learn marks a leaf by setting both children to -1. */
const TREE_LEAF = -1;

const EULER_GAMMA = 0.5772156649015329;

export interface TreeArrays {
  feature: number[];
  threshold: number[];
  left: number[];
  right: number[];
  count: number[];
}

export interface ForestArtifact {
  featureNames: string[];
  imputerMedians: number[];
  scalerCenter: number[];
  scalerScale: number[];
  maxSamples: number;
  offset: number;
  trees: TreeArrays[];
}

export type FeatureRow = readonly (number | null | undefined)[];

/**
 * Expected path length of an unsuccessful BST search over `n` points.
 *
 * This is the correction Isolation Forest applies at a leaf that was not split down to a
 * single point, and it is also what normalises the averaged depth. Same closed form as
 * sklearn.ensemble._iforest._average_path_length.
 */
export function averagePathLength(n: number): number {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  return 2 * (Math.log(n - 1) + EULER_GAMMA) - (2 * (n - 1)) / n;
}

/**
 * Impute missing values with the training median, then centre and scale.
 *
 * The scaler parameters already have scikit-learn's zero handling applied at export time,
 * so a constant column arrives here with a scale of 1 rather than 0.
 */
function preprocess(artifact: ForestArtifact, row: FeatureRow): Float64Array {
  const out = new Float64Array(artifact.featureNames.length);
  for (let index = 0; index < out.length; index += 1) {
    const raw = row[index];
    const value =
      raw === null || raw === undefined || !Number.isFinite(raw)
        ? artifact.imputerMedians[index]
        : (raw as number);
    out[index] = (value - artifact.scalerCenter[index]) / artifact.scalerScale[index];
  }
  return out;
}

/** Depth in edges at which one tree isolates the sample, plus the leaf correction. */
function treeDepth(tree: TreeArrays, sample: Float64Array): number {
  let node = 0;
  let depth = 0;
  while (tree.left[node] !== TREE_LEAF) {
    node = sample[tree.feature[node]] <= tree.threshold[node] ? tree.left[node] : tree.right[node];
    depth += 1;
  }
  return depth + averagePathLength(tree.count[node]);
}

/**
 * The negated, normalised mean isolation depth — scikit-learn's `score_samples`.
 * Values run from -1 (most anomalous) upward toward 0.
 */
export function scoreSamples(artifact: ForestArtifact, row: FeatureRow): number {
  const sample = preprocess(artifact, row);
  let depths = 0;
  for (const tree of artifact.trees) {
    depths += treeDepth(tree, sample);
  }
  const denominator = artifact.trees.length * averagePathLength(artifact.maxSamples);
  return -Math.pow(2, -depths / denominator);
}

/** `score_samples` shifted by the fitted offset: negative means the forest flags the row. */
export function decisionFunction(artifact: ForestArtifact, row: FeatureRow): number {
  return scoreSamples(artifact, row) - artifact.offset;
}

/** -1 for an outlier, 1 otherwise — scikit-learn's `predict`. */
export function predict(artifact: ForestArtifact, row: FeatureRow): -1 | 1 {
  return decisionFunction(artifact, row) < 0 ? -1 : 1;
}
