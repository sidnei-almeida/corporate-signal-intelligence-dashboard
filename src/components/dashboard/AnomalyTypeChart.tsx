"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartViewport } from "@/components/charts/ChartViewport";
import { Card } from "@/components/ui/Card";
import {
  ANOMALY_TYPE_CHART_LABELS,
  ANOMALY_TYPE_LABELS,
  ANOMALY_TYPE_ORDER,
} from "@/lib/constants";
import type { AnomalyTypeCount } from "@/lib/types";
import {
  chartActiveBar,
  chartAxisLine,
  chartAxisTick,
  chartAxisTickEmphasis,
  chartBarCellFill,
  chartGridStroke,
  chartTickLineStroke,
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipItemStyleAccent,
  chartTooltipLabelStyle,
} from "@/lib/chartTheme";

interface AnomalyTypeChartProps {
  types: AnomalyTypeCount[];
  fillHeight?: boolean;
}

function chartLabel(key: string): string {
  return ANOMALY_TYPE_CHART_LABELS[key] ?? ANOMALY_TYPE_LABELS[key] ?? key;
}

export function AnomalyTypeChart({
  types,
  fillHeight = false,
}: AnomalyTypeChartProps) {
  const countMap = Object.fromEntries(
    types.map((t) => [t.anomaly_type, t.count]),
  );

  const chartData = ANOMALY_TYPE_ORDER.map((key) => ({
    type: chartLabel(key),
    key,
    count: countMap[key] ?? 0,
  })).filter((d) => d.count > 0);

  const extras = types
    .filter(
      (t) =>
        !ANOMALY_TYPE_ORDER.includes(
          t.anomaly_type as (typeof ANOMALY_TYPE_ORDER)[number],
        ),
    )
    .map((t) => ({
      type: chartLabel(t.anomaly_type),
      key: t.anomaly_type,
      count: t.count,
    }));

  const data = [...chartData, ...extras].sort((a, b) => b.count - a.count);
  const barCount = Math.max(data.length, 4);

  return (
    <Card
      title="Anomaly Type Distribution"
      subtitle="Rule-based classification counts"
      fillHeight={fillHeight}
      className={fillHeight ? "chart-card anomaly-type-chart h-full w-full" : "chart-card anomaly-type-chart w-full"}
    >
      <ChartViewport mobileHeight={240}>
        {({ yAxisWidth, tickFontSize }) => (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 12, right: 24, left: 4, bottom: 12 }}
            barCategoryGap={barCount > 6 ? "18%" : "24%"}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartGridStroke}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ ...chartAxisTick, fontSize: tickFontSize(11, 8) }}
              axisLine={chartAxisLine}
              tickLine={{ stroke: chartTickLineStroke }}
            />
            <YAxis
              type="category"
              dataKey="type"
              width={yAxisWidth(132, 90)}
              tick={{
                ...chartAxisTickEmphasis,
                fontSize: tickFontSize(11, 9),
              }}
              axisLine={chartAxisLine}
              tickLine={false}
              interval={0}
            />
            <Tooltip
              cursor={chartTooltipCursor}
              contentStyle={chartTooltipContentStyle}
              labelStyle={chartTooltipLabelStyle}
              itemStyle={chartTooltipItemStyleAccent}
            />
            <Bar
              dataKey="count"
              radius={[0, 3, 3, 0]}
              maxBarSize={36}
              activeBar={chartActiveBar}
            >
              {data.map((entry, index) => (
                <Cell key={entry.key} fill={chartBarCellFill(index)} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ChartViewport>
    </Card>
  );
}
