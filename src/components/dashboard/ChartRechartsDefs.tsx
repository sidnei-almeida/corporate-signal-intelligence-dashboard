import { chartAreaGradientStops } from "@/lib/chartTheme";

interface ChartRechartsDefsProps {
  areaGradientId: string;
}

/** Subtle area fill gradient for timeline charts */
export function ChartRechartsDefs({ areaGradientId }: ChartRechartsDefsProps) {
  return (
    <defs>
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
    </defs>
  );
}
