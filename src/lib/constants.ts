export const APP_NAME = "Corporate Signal Intelligence";
export const APP_TAGLINE =
  "AI-powered anomaly monitoring for public companies";

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
  { label: "Briefings", href: "/briefings" },
] as const;

export const ROUTE_META: Record<
  string,
  { title: string; subtitle: string }
> = {
  "/": {
    title: "Overview",
    subtitle: "Executive snapshot · system health · highest-risk signals",
  },
  "/anomalies": {
    title: "Anomaly Investigation",
    subtitle: "Explore critical events · filter · inspect signal context",
  },
  "/companies": {
    title: "Company Intelligence",
    subtitle: "Issuer-level anomaly profile · timeline · event history",
  },
  "/briefings": {
    title: "Executive Briefings",
    subtitle: "AI-generated narrative from selected anomaly context",
  },
};

export const BRIEFING_DISCLAIMER =
  "Generated briefing is for analytical monitoring only and is not financial advice.";
