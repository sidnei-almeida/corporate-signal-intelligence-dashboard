/**
 * Replay scikit-learn's own output through the TypeScript scorer.
 *
 * The dashboard no longer calls a Python service, so the only thing standing between a
 * retrained pipeline and silently wrong scores is this check. It reads the fixture
 * `scripts/export_model_artifacts.py` froze — real panel rows plus the scores, decisions
 * and labels scikit-learn produced for them — and fails if the port has drifted.
 *
 *     npm run verify:model
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  decisionFunction,
  predict,
  scoreSamples,
  type ForestArtifact,
} from "../src/server/isolationForestCore.ts";

const here = dirname(fileURLToPath(import.meta.url));

const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(resolve(here, path), "utf8")) as T;

const forest = readJson<ForestArtifact>("../src/data/generated/isolation-forest.json");
const fixture = readJson<{
  featureNames: string[];
  rows: (number | null)[][];
  scoreSamples: number[];
  decisionFunction: number[];
  predictions: number[];
}>("./fixtures/inference-parity.json");

if (fixture.featureNames.join("|") !== forest.featureNames.join("|")) {
  console.error("Fixture and model disagree on feature order. Re-run the export script.");
  process.exit(1);
}

// Double arithmetic in two languages will not agree bit for bit. A part in a trillion is
// tight enough that any real change in the traversal or the path-length correction shows
// up, and loose enough that summation order does not.
const TOLERANCE = 1e-12;

let worstScore = 0;
let worstDecision = 0;
let labelMismatches = 0;

fixture.rows.forEach((row, index) => {
  worstScore = Math.max(worstScore, Math.abs(scoreSamples(forest, row) - fixture.scoreSamples[index]));
  worstDecision = Math.max(
    worstDecision,
    Math.abs(decisionFunction(forest, row) - fixture.decisionFunction[index]),
  );
  if (predict(forest, row) !== fixture.predictions[index]) labelMismatches += 1;
});

console.log(`rows checked            ${fixture.rows.length}`);
console.log(`max |score_samples| gap ${worstScore.toExponential(3)}`);
console.log(`max |decision| gap      ${worstDecision.toExponential(3)}`);
console.log(`label mismatches        ${labelMismatches}`);

if (worstScore > TOLERANCE || worstDecision > TOLERANCE || labelMismatches > 0) {
  console.error("\nParity check FAILED — the TypeScript scorer no longer matches scikit-learn.");
  process.exit(1);
}

console.log("\nParity check passed.");
