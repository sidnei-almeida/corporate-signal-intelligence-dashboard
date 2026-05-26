/** Chart palette — enterprise dark (graphite + single warm accent) */

import type { AnomalySeverity } from "@/lib/types";

/** Neutral series colors */
export const CHART_GRAPHITE = "#49515D";
export const CHART_SLATE = "#596273";
export const CHART_ACCENT = "#D97A2B";
export const CHART_SURFACE_STROKE = "#040506";

export const CHART_BAR_GRADIENT_SUFFIX = "chartGradientPrimary";
export const CHART_AREA_GRADIENT_SUFFIX = "areaGradient";

/** @deprecated gradients replaced by solid fills; kept for area charts */
export const CHART_STEEL = CHART_SLATE;
export const CHART_BLUE = CHART_GRAPHITE;

export function chartGradientIds(instanceId: string) {
  const prefix = instanceId.replace(/:/g, "");
  return {
    bar: `${prefix}-${CHART_BAR_GRADIENT_SUFFIX}`,
    area: `${prefix}-${CHART_AREA_GRADIENT_SUFFIX}`,
  };
}

export function chartBarGradientUrl(gradientId: string): string {
  return `url(#${gradientId})`;
}

/** Top-ranked bar: warm accent; all others: neutral graphite */
export function chartBarCellFill(index: number): string {
  if (index === 0) return CHART_ACCENT;
  return CHART_GRAPHITE;
}

export const chartBarFill = CHART_GRAPHITE;
export const chartBarHover = "rgba(217, 122, 43, 0.22)";
export const chartBarStroke = "rgba(255, 255, 255, 0.05)";

export const chartLineStroke = CHART_SLATE;
export const chartPointHighlightFill = CHART_ACCENT;
export const chartPointHighlightStroke = CHART_SURFACE_STROKE;
export const chartPointUnselectedStroke = "transparent";

export const chartGridStroke = "rgba(255, 255, 255, 0.04)";
export const chartAxisLine = { stroke: "rgba(255, 255, 255, 0.05)" };
export const chartTickLineStroke = "rgba(255, 255, 255, 0.04)";

const chartTickFont =
  'var(--font-mono), "JetBrains Mono", ui-monospace, monospace';

export const chartAxisTick = {
  fill: "rgba(245, 243, 238, 0.32)",
  fontSize: 10,
  fontFamily: chartTickFont,
  fontWeight: 400 as const,
};

export const chartAxisTickEmphasis = {
  fill: "rgba(245, 243, 238, 0.55)",
  fontSize: 11,
  fontWeight: 500 as const,
  fontFamily: chartTickFont,
};

export const chartAreaGradientStops = [
  { offset: "0%", color: CHART_SLATE, opacity: 0.06 },
  { offset: "100%", color: CHART_SLATE, opacity: 0 },
] as const;

export const chartTooltipContentStyle = {
  backgroundColor: "#0b0e11",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#F5F3EE",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
};

export const chartTooltipLabelStyle = {
  color: "rgba(245, 243, 238, 0.55)",
  fontWeight: 600,
  marginBottom: 4,
  fontSize: "11px",
  fontFamily: 'var(--font-display), "Manrope", sans-serif',
};

export const chartTooltipItemStyle = {
  color: "#F5F3EE",
  fontFamily: chartTickFont,
};

export const chartTooltipValueStyle = {
  color: CHART_ACCENT,
  fontWeight: 500,
};

export const chartTooltipItemStyleAccent = {
  ...chartTooltipItemStyle,
  ...chartTooltipValueStyle,
};

export const chartTooltipCursor = {
  fill: "rgba(255, 255, 255, 0.02)",
  stroke: "rgba(255, 255, 255, 0.05)",
};

export const chartPlotBg = "transparent";

export const chartActiveBar = {
  fill: CHART_ACCENT,
  fillOpacity: 0.9,
  stroke: chartBarStroke,
};

export const chartActiveDot = {
  r: 4,
  fill: CHART_ACCENT,
  stroke: CHART_SURFACE_STROKE,
  strokeWidth: 1.5,
};

/** Severity scatter/legend — aligned with risk meter palette */
export const chartSeverityFill: Record<AnomalySeverity, string> = {
  Critical: "#a85834",
  High: "#b5763a",
  Medium: "#8a7a52",
  Low: "#646c78",
};

export const chartSeverityLegend = chartSeverityFill;

/** @deprecated use chartBarCellFill */
export function chartBarFillByRank(index: number): string {
  return chartBarCellFill(index);
}

/** @deprecated */
export const chartAccentAlert = CHART_ACCENT;
export const chartAccentAmber = CHART_ACCENT;
export const chartAccentOrange = CHART_ACCENT;
export const chartAmberPrimary = CHART_ACCENT;
export const chartAmberLight = CHART_ACCENT;
