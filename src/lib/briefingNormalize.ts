import type { AnomalySeverity } from "@/lib/types";
import { formatScore } from "@/lib/formatters";

/**
 * Backend briefing prompts sometimes downplay severity (e.g. "moderate" for Critical).
 * Prepends authoritative classification and corrects common mismatches.
 */
export function normalizeBriefingMarkdown(
  briefing: string,
  severity: AnomalySeverity,
  typeLabels: string[],
  anomalyScore?: string,
): string {
  const typesLine =
    typeLabels.length > 0 ? typeLabels.join(" · ") : "See signal metrics";
  const scoreLine = anomalyScore ? ` · Score ${anomalyScore}` : "";

  const header = [
    "> **Event classification (monitoring system):**",
    `> **${severity}** severity · ${typesLine}${scoreLine}`,
    ">",
    "> Lower anomaly score = higher risk. Use this tier when describing event severity.",
    "",
  ].join("\n");

  let body = briefing.trim();

  if (severity === "Critical" || severity === "High") {
    const replacements: [RegExp, string][] = [
      [/\bmoderate severity(?:\s+rating)?\b/gi, `${severity} severity`],
      [/\bmoderate to elevated risk\b/gi, `${severity} risk`],
      [/\bmoderate(?:\s+|\/)elevated\b/gi, severity],
      [
        /\bcarries a moderate severity\b/gi,
        `is classified as ${severity} severity`,
      ],
      [
        /\bindicates a moderate(?:\s+to\s+elevated)? risk\b/gi,
        `indicates ${severity} risk`,
      ],
      [
        /\bclassified as moderate\b/gi,
        `classified as ${severity}`,
      ],
    ];
    for (const [pattern, replacement] of replacements) {
      body = body.replace(pattern, replacement);
    }
  }

  if (body.startsWith("> **Event classification")) {
    return body;
  }

  return `${header}${body}`;
}

export function briefingScoreDisplay(
  score: Parameters<typeof formatScore>[0],
): string {
  return formatScore(score);
}
