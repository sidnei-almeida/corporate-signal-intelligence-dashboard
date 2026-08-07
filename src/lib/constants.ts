export const APP_NAME = "Corporate Signal Intelligence";
export const APP_TAGLINE =
  "Attention prioritisation for public company monitoring — validated against a prospective criterion.";
export const APP_BOOT_FOOTER =
  "This may take a few seconds while the backend wakes up.";

export const SIDEBAR_FOOTER_SOURCES = "Stooq · SEC EDGAR";
export const SIDEBAR_FOOTER_STACK = "Conditional score · AI Briefings";

/**
 * The alert types the pipeline emits.
 *
 * Each is the deviation that produced the score, optionally suffixed when a filing
 * landed inside the two-session reaction window. There is no fundamentals-derived type:
 * the benchmark measured that block as not carrying its cost.
 */
export const ANOMALY_TYPE_ORDER = [
  "range expansion",
  "range expansion with disclosure",
  "price move",
  "price move with disclosure",
  "volume spike",
  "volume spike with disclosure",
] as const;

export const ANOMALY_TYPE_LABELS: Record<string, string> = {
  "range expansion": "Range Expansion",
  "range expansion with disclosure": "Range Expansion + Filing",
  "price move": "Price Move",
  "price move with disclosure": "Price Move + Filing",
  "volume spike": "Volume Spike",
  "volume spike with disclosure": "Volume Spike + Filing",
};

/** Shorter labels for horizontal bar chart axis (avoids awkward wrapping). */
export const ANOMALY_TYPE_CHART_LABELS: Record<string, string> = {
  "range expansion": "Range Exp.",
  "range expansion with disclosure": "Range Exp. + Filing",
  "price move": "Price Move",
  "price move with disclosure": "Price Move + Filing",
  "volume spike": "Volume Spike",
  "volume spike with disclosure": "Volume + Filing",
};

/** What the score is, in one sentence, for tooltips and empty states. */
export const SCORE_DEFINITION =
  "The largest of three standardised deviations — log return, log volume and intraday range — measured against the issuer's own trailing 21 sessions.";

export const BUDGET_EXPLAINER =
  "The alert budget is the share of issuer-days allowed to raise an alert. The score threshold follows from it, not the other way round.";

export const DASHBOARD_NAV = [
  { label: "Overview", href: "/" },
  { label: "Alert Queue", href: "/anomalies" },
  { label: "Companies", href: "/companies" },
  { label: "AI Briefings", href: "/briefings" },
  { label: "Validation", href: "/validation" },
] as const;

export const ROUTE_META: Record<
  string,
  { title: string; subtitle: string; context: readonly string[] }
> = {
  "/": {
    title: "Monitoring Overview",
    subtitle:
      "What the alert budget buys: precision against the prospective criterion, the alert mix, and the state of the pipeline.",
    context: [
      "Precision vs base rate",
      "Alert budget",
      "Signal mix",
      "Pipeline status",
    ],
  },
  "/anomalies": {
    title: "Alert Queue",
    subtitle:
      "Issuer-days ranked by conditional deviation, under a budget you control. Each alert carries the deviation that produced it.",
    context: [
      "Budget control",
      "Deviation drivers",
      "Disclosure context",
      "Briefing prep",
    ],
  },
  "/companies": {
    title: "Issuer History",
    subtitle:
      "Alert history and signal composition per issuer. The score is issuer-relative, so these are histories, not a ranking.",
    context: [
      "Alert history",
      "Event timeline",
      "Signal breakdown",
      "Disclosure overlap",
    ],
  },
  "/briefings": {
    title: "Executive Briefing Studio",
    subtitle:
      "Analyst-style narratives grounded in the deviation that triggered the alert and the filings around it.",
    context: [
      "AI narratives",
      "Deviation context",
      "Executive tone",
      "Export ready",
    ],
  },
  "/validation": {
    title: "Validation Protocol",
    subtitle:
      "Ten detectors under one protocol, scored against a criterion built only from information after the scoring date.",
    context: [
      "Detector benchmark",
      "Significance testing",
      "Walk-forward",
      "Attribution",
    ],
  },
};

export const BRIEFING_DISCLAIMER =
  "AI-generated briefing is for analytical monitoring only. This tool prioritises attention; it is not investment advice and makes no claim about price direction.";

/** Stated wherever a score or ranking is shown, per the scope the study set. */
export const SCOPE_DISCLAIMER =
  "A flagged day is a candidate for review, not a finding. The score anticipates movement, not direction.";
