/** Chart palette — cyan / deep blue only (no warm chart colors) */

import type { AnomalySeverity } from "@/lib/types";

/** Data visualization colors — not used for severity badges */
export const CHART_CYAN = "#00D4FF";
export const CHART_BLUE = "#0066FF";
export const CHART_SURFACE_STROKE = "#050507";

export const CHART_BAR_GRADIENT_SUFFIX = "chartGradientPrimary";
export const CHART_AREA_GRADIENT_SUFFIX = "areaGradient";

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

/** Uniform bar gradient fill for every cell */
export function chartBarCellFill(_index: number, gradientId: string): string {
  return chartBarGradientUrl(gradientId);
}

export const chartBarFill = chartBarGradientUrl(CHART_BAR_GRADIENT_SUFFIX);
export const chartBarHover = CHART_CYAN;
export const chartBarStroke = "rgba(0, 212, 255, 0.2)";

export const chartLineStroke = CHART_CYAN;
export const chartPointHighlightFill = CHART_CYAN;
export const chartPointHighlightStroke = CHART_SURFACE_STROKE;
export const chartPointUnselectedStroke = "transparent";

export const chartGridStroke = "rgba(0, 212, 255, 0.06)";
export const chartAxisLine = { stroke: "rgba(0, 212, 255, 0.08)" };
export const chartTickLineStroke = "rgba(0, 212, 255, 0.06)";

const chartTickFont =
  'var(--font-mono), "JetBrains Mono", ui-monospace, monospace';

export const chartAxisTick = {
  fill: "rgba(232, 237, 245, 0.28)",
  fontSize: 10,
  fontFamily: chartTickFont,
  fontWeight: 400 as const,
};

export const chartAxisTickEmphasis = {
  fill: "rgba(232, 237, 245, 0.55)",
  fontSize: 11,
  fontWeight: 500 as const,
  fontFamily: chartTickFont,
};

export const chartAreaGradientStops = [
  { offset: "0%", color: CHART_CYAN, opacity: 0.3 },
  { offset: "100%", color: CHART_CYAN, opacity: 0 },
] as const;

export const chartTooltipContentStyle = {
  backgroundColor: "rgba(10, 10, 15, 0.95)",
  border: "1px solid rgba(0, 212, 255, 0.15)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#E8EDF5",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(12px)",
};

export const chartTooltipLabelStyle = {
  color: "rgba(232, 237, 245, 0.55)",
  fontWeight: 600,
  marginBottom: 4,
  fontSize: "11px",
  fontFamily: 'var(--font-display), "Syne", sans-serif',
};

export const chartTooltipItemStyle = {
  color: "#E8EDF5",
  fontFamily: chartTickFont,
};

export const chartTooltipValueStyle = {
  color: CHART_CYAN,
  fontWeight: 500,
};

export const chartTooltipItemStyleAccent = {
  ...chartTooltipItemStyle,
  ...chartTooltipValueStyle,
};

export const chartTooltipCursor = {
  fill: "rgba(0, 212, 255, 0.06)",
  stroke: "rgba(0, 212, 255, 0.12)",
};

export const chartPlotBg = "transparent";

export const chartActiveBar = {
  fill: CHART_CYAN,
  fillOpacity: 0.95,
  stroke: chartBarStroke,
};

export const chartActiveDot = {
  r: 4,
  fill: CHART_CYAN,
  stroke: CHART_SURFACE_STROKE,
  strokeWidth: 1.5,
};

/** Severity scatter/legend — intentional badge palette, not chart series colors */
export const chartSeverityFill: Record<AnomalySeverity, string> = {
  Critical: "#FF4560",
  High: "#FFB627",
  Medium: "#00E5A0",
  Low: "#00E5A0",
};

export const chartSeverityLegend = chartSeverityFill;

/** @deprecated use chartBarCellFill */
export function chartBarFillByRank(index: number, gradientId: string): string {
  return chartBarCellFill(index, gradientId);
}

/** @deprecated warm chart accents removed */
export const chartAccentAlert = CHART_CYAN;
export const chartAccentAmber = CHART_CYAN;
export const chartAccentOrange = CHART_CYAN;
export const chartAmberPrimary = CHART_CYAN;
export const chartAmberLight = CHART_CYAN;
