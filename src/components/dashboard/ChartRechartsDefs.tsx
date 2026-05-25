import { chartAreaGradientStops, CHART_BLUE, CHART_CYAN } from "@/lib/chartTheme";

interface ChartRechartsDefsProps {
  barGradientId: string;
  areaGradientId?: string;
  includeArea?: boolean;
}

/**
 * Shared SVG gradients for Recharts — cyan primary bar gradient + optional area fill.
 * Use unique ids per chart instance (via useId) when multiple charts render on one page.
 */
export function ChartRechartsDefs({
  barGradientId,
  areaGradientId,
  includeArea = false,
}: ChartRechartsDefsProps) {
  return (
    <defs>
      <linearGradient id={barGradientId} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stopColor={CHART_CYAN} stopOpacity={0.9} />
        <stop offset="100%" stopColor={CHART_BLUE} stopOpacity={0.6} />
      </linearGradient>
      {includeArea && areaGradientId ? (
        <linearGradient id={areaGradientId} x1="0" x2="0" y1="0" y2="1">
          {chartAreaGradientStops.map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>
      ) : null}
    </defs>
  );
}
