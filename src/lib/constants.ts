export const APP_NAME = "Corporate Signal Intelligence";
export const APP_TAGLINE =
  "Anomaly detection and AI briefings for public company monitoring.";
export const APP_BOOT_FOOTER =
  "This may take a few seconds while the backend wakes up.";

export const SIDEBAR_FOOTER_SOURCES = "Stooq · SEC EDGAR";
export const SIDEBAR_FOOTER_STACK = "Isolation Forest · AI Briefings";

export const ANOMALY_TYPE_ORDER = [
  "revenue_shift",
  "filing_activity",
  "high_volatility",
  "volume_spike",
  "negative_margin",
  "price_spike",
  "price_drop",
  "combined_signal",
] as const;

export const ANOMALY_TYPE_LABELS: Record<string, string> = {
  revenue_shift: "Revenue Shift",
  filing_activity: "Filing Activity",
  high_volatility: "High Volatility",
  volume_spike: "Volume Spike",
  negative_margin: "Negative Margin",
  price_spike: "Price Spike",
  price_drop: "Price Drop",
  combined_signal: "Combined Signal",
};

/** Shorter labels for horizontal bar chart axis (avoids awkward wrapping). */
export const ANOMALY_TYPE_CHART_LABELS: Record<string, string> = {
  revenue_shift: "Revenue Shift",
  filing_activity: "Filing Activity",
  high_volatility: "High Volatility",
  volume_spike: "Volume Spike",
  negative_margin: "Neg. Margin",
  price_spike: "Price Spike",
  price_drop: "Price Drop",
  combined_signal: "Combined",
};

export const DASHBOARD_NAV = [
  { label: "Overview", href: "/" },
  { label: "Anomalies", href: "/anomalies" },
  { label: "Companies", href: "/companies" },
  { label: "AI Briefings", href: "/briefings" },
] as const;

export const ROUTE_META: Record<
  string,
  { title: string; subtitle: string; context: readonly string[] }
> = {
  "/": {
    title: "Market Anomaly Overview",
    subtitle:
      "AI-assisted monitoring for public companies, unusual market behavior, and briefing-ready risk signals.",
    context: [
      "Executive snapshot",
      "Anomaly detection",
      "Issuer risk ranking",
      "Briefing readiness",
    ],
  },
  "/anomalies": {
    title: "Anomaly Signal Investigation",
    subtitle:
      "Deep-dive into abnormal market events, signal drivers, and briefing-ready anomaly records.",
    context: [
      "Event explorer",
      "Signal drivers",
      "Severity ranking",
      "Briefing prep",
    ],
  },
  "/companies": {
    title: "Issuer Intelligence Profile",
    subtitle:
      "Company-level anomaly history, signal composition, and cross-event risk context.",
    context: [
      "Issuer profiles",
      "Event timeline",
      "Signal breakdown",
      "Risk posture",
    ],
  },
  "/briefings": {
    title: "Executive Briefing Studio",
    subtitle:
      "Analyst-style narratives generated from selected anomaly context and issuer signals.",
    context: [
      "AI narratives",
      "Anomaly context",
      "Executive tone",
      "Export ready",
    ],
  },
};

export const BRIEFING_DISCLAIMER =
  "AI-generated briefing is for analytical monitoring only and is not financial advice.";
