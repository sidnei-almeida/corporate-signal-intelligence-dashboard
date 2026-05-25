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
  { title: string; subtitle: string }
> = {
  "/": {
    title: "Overview",
    subtitle:
      "Executive snapshot · anomaly detection · AI briefing readiness",
  },
  "/anomalies": {
    title: "Anomaly Investigation",
    subtitle:
      "Explore abnormal events, inspect signal drivers, and prepare AI briefings.",
  },
  "/companies": {
    title: "Company Intelligence",
    subtitle:
      "Issuer-level anomaly profile, event history, and signal breakdown.",
  },
  "/briefings": {
    title: "AI Executive Briefings",
    subtitle:
      "Generate analyst-style narratives from selected anomaly context.",
  },
};

export const BRIEFING_DISCLAIMER =
  "AI-generated briefing is for analytical monitoring only and is not financial advice.";
