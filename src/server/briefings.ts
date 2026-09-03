/**
 * Executive briefings, generated from a Next route handler.
 *
 * The prompt is the one the Python service shipped, moved here verbatim: the wording is
 * what keeps the model from reading the alert as a forecast, so it is not something to
 * paraphrase while porting. The Groq call goes out from the server, which is the only
 * reason the key can stay off the client.
 */

import { severityThresholds, severityTier } from "@/server/panel";

/** Overridable so the request path can be exercised against a stub in tests. */
const GROQ_BASE_URL = process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";
const GROQ_URL = `${GROQ_BASE_URL.replace(/\/$/, "")}/chat/completions`;

export const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export const SYSTEM_PROMPT = `You are a senior analyst on a corporate monitoring desk.
You write short briefings that explain why a specific trading day was put in front of a
human for review.

## What the alert is, and is not

The system ranks issuer-days by a conditional deviation score: the largest of three
standardised deviations measured against the issuer's own trailing 21-session behaviour —
log return, log volume, and intraday range. A day is flagged when that score exceeds the
cutoff set by the alert budget.

Two consequences you must respect:

1. **The score is its own explanation.** Whichever of \`return_zscore_21d\`,
   \`volume_zscore_21d\` and \`range_zscore_21d\` has the largest absolute value *is*
   \`anomaly_score\`, and is the reason the day was flagged. Identify it and lead with it.
2. **This is a triage instrument, not a forecast.** It prioritises attention. It does not
   predict direction, and the underlying study found direction is not predictable from
   disclosures. Never imply the alert says which way the price will go.

\`structural_score\` is a secondary Isolation Forest reading over the wider feature set. It
was not validated as an early-warning signal and raises no alerts. Mention it only as
corroborating context, never as the reason.

## Rules (strict)
- Ground every claim in the provided data. If a metric is missing, say "not provided" —
  never invent filings, prices, or percentages.
- Interpret z-scores in plain language (e.g., "volume ~3.8σ above its own 21-day norm").
  Always say "against its own recent behaviour", because the scale is issuer-relative.
- Severity comes from \`severity_tier\` in the payload. Do not invent your own cutoffs.
- Disclosure context: \`filed_8k_2d\`, \`filed_10q_2d\` and \`filed_10k_2d\` mean a filing of
  that type landed within the two-session reaction window. \`in_earnings_window\` marks a
  scheduled reporting window. Treat these as co-occurrence, not causation.
- If \`market_return\` is large in the same direction, say so: the move may be market-wide
  rather than issuer-specific. \`idiosyncratic_zscore\` is the issuer-specific residual.
- This is NOT financial advice. No buy/sell/hold, price targets, or trading
  recommendations.
- Tone: calm, precise, neutral. No hype, no alarmism, no marketing language.
- Write in English.

## Required output format (use these exact section headings)

**Executive Summary**
2–3 sentences: which issuer and date, which deviation triggered the alert, how large it
was against that issuer's own recent norm, and the severity tier.

**What Triggered This**
Bullet facts only — the dominant deviation and its value, the other two for comparison,
the day's log return, and any filing inside the two-session window.

**Reading the Signal**
Markdown table with columns: Deviation | Value (σ) | Dominant? | Reading.
One row each for return, volume and range.

**Context**
2–4 sentences: was the move issuer-specific or market-wide, was it near a disclosure or
an earnings window, and what the secondary structural score adds, if anything.

**What to Check**
3–5 numbered, concrete follow-ups: the specific filing to open, the metric to compare,
the window to watch. Each must be something a person can actually do.

**Limits of This Alert**
2–3 sentences: what this score cannot tell the reader. Be specific — the score is
self-normalising, so it is robust to changing volatility regimes but blind to the regime
itself; and a flagged day is a candidate for review, not a finding.

**Disclaimer**
One line: attention prioritisation for analytical monitoring only; not investment advice,
not a legal or accounting opinion on any filing.
`;

// Fields prioritised in the condensed signal block sent to the model. These mirror what
// the conditional score is actually built from; the quarterly fundamental block is absent
// because the benchmark measured it as not carrying its cost.
const SIGNAL_FIELDS = [
  "ticker",
  "date",
  "anomaly_score",
  "anomaly_type",
  "is_anomaly",
  "return_zscore_21d",
  "volume_zscore_21d",
  "range_zscore_21d",
  "log_return",
  "realised_volatility_21d",
  "market_return",
  "idiosyncratic_zscore",
  "filed_8k_2d",
  "filed_10q_2d",
  "filed_10k_2d",
  "in_earnings_window",
  "days_since_8k",
  "structural_score",
  "is_structural_outlier",
] as const;

/** The three deviations the score is the maximum of. */
const DEVIATIONS: Record<string, string> = {
  return_zscore_21d: "price move",
  volume_zscore_21d: "volume spike",
  range_zscore_21d: "range expansion",
};

// anomaly_rate is deliberately withheld. The score is self-normalising, so under a fixed
// budget every issuer lands near the same rate: handing it to the model invites a
// comparison between issuers that the number cannot support.
const COMPANY_FIELDS = ["ticker", "row_count", "first_date", "last_date", "anomaly_count"];

export class GroqNotConfiguredError extends Error {
  constructor() {
    super("GROQ_API_KEY is not configured. Briefings are unavailable.");
    this.name = "GroqNotConfiguredError";
  }
}

function formatJson(payload: unknown): string {
  return JSON.stringify(payload, null, 2);
}

/** Identify which of the three deviations the score came from. */
function dominantDeviation(record: Record<string, unknown>) {
  const readings = Object.keys(DEVIATIONS)
    .map((field) => [field, Math.abs(Number(record[field]))] as const)
    .filter(([, value]) => Number.isFinite(value));
  if (readings.length === 0) return null;

  const [field, absolute] = readings.reduce((best, current) =>
    current[1] > best[1] ? current : best,
  );
  return {
    field,
    label: DEVIATIONS[field],
    value: record[field],
    absolute: Number(absolute.toFixed(4)),
  };
}

function signalSummary(record: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const key of SIGNAL_FIELDS) {
    if (record[key] !== undefined && record[key] !== null) summary[key] = record[key];
  }

  // Resolve the two things the model must not guess at: which deviation drove the score,
  // and how severe the day is on the desk's own scale.
  const dominant = dominantDeviation(record);
  if (dominant) summary.dominant_deviation = dominant;

  const score = Number(record.anomaly_score);
  if (Number.isFinite(score)) {
    summary.severity_tier = severityTier(score);
    summary.severity_scale = severityThresholds().map(({ tier, threshold }) => ({
      tier,
      score_at_or_above: Number(threshold.toFixed(4)),
    }));
  }
  return summary;
}

function companySummary(
  context: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!context) return null;
  const summary: Record<string, unknown> = {};
  for (const key of COMPANY_FIELDS) {
    if (key in context) summary[key] = context[key];
  }
  return Object.keys(summary).length > 0 ? summary : null;
}

function buildUserPrompt(
  record: Record<string, unknown>,
  companyContext?: Record<string, unknown> | null,
): string {
  const parts = [
    "Produce the executive briefing for the anomaly below.",
    "",
    "## Primary signal summary (use these metrics first)",
    formatJson(signalSummary(record)),
  ];

  const company = companySummary(companyContext);
  if (company) {
    parts.push("", "## Company historical context", formatJson(company));
  }

  parts.push(
    "",
    "## Full anomaly record (reference only — do not repeat every field)",
    formatJson(record),
  );

  return parts.join("\n");
}

/** Generate an executive briefing for an anomaly record using Groq. */
export async function generateExecutiveBriefing(
  record: Record<string, unknown>,
  companyContext?: Record<string, unknown> | null,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new GroqNotConfiguredError();

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 1100,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(record, companyContext) },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${detail.slice(0, 400)}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned an empty briefing.");
  return content;
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}
