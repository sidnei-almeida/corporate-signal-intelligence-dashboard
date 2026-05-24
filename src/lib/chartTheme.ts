/** Shared Recharts styling for dark dashboard charts */

export const chartAxisTick = { fill: "#94a3b8", fontSize: 11 };
export const chartAxisTickEmphasis = {
  fill: "#e2e8f0",
  fontSize: 11,
  fontWeight: 500 as const,
};
export const chartAxisLine = { stroke: "rgba(255,255,255,0.12)" };
export const chartGridStroke = "rgba(255,255,255,0.08)";

export const chartTooltipContentStyle = {
  backgroundColor: "#18181b",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#e2e8f0",
  boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
};

export const chartTooltipLabelStyle = {
  color: "#f1f5f9",
  fontWeight: 600,
  marginBottom: 4,
};

export const chartTooltipItemStyle = {
  color: "#cbd5e1",
};

export const chartTooltipCursor = {
  fill: "rgba(255,255,255,0.04)",
  stroke: "rgba(255,255,255,0.08)",
};
