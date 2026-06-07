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
import type { AnomalySummary } from "@/lib/types";
import {
  formatAnomalyRate,
  formatTicker,
  toFiniteNumber,
} from "@/lib/formatters";
import {
  chartActiveBar,
  chartBarCellFill,
  chartBarStroke,
  chartAxisLine,
  chartAxisTick,
  chartAxisTickEmphasis,
  chartGridStroke,
  chartTickLineStroke,
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipItemStyleAccent,
  chartTooltipLabelStyle,
} from "@/lib/chartTheme";

interface CompanyRiskRankingChartProps {
  summaries: AnomalySummary[];
  limit?: number;
}

export function CompanyRiskRankingChart({
  summaries,
  limit = 15,
}: CompanyRiskRankingChartProps) {
  const data = [...summaries]
    .sort(
      (a, b) =>
        (toFiniteNumber(b.anomaly_rate) ?? 0) -
        (toFiniteNumber(a.anomaly_rate) ?? 0),
    )
    .slice(0, limit)
    .map((row) => {
      const rate = toFiniteNumber(row.anomaly_rate) ?? 0;
      return {
        ticker: formatTicker(row.ticker),
        rate,
        rateLabel: formatAnomalyRate(row.anomaly_rate),
        anomalies: row.anomalies,
      };
    });

  const barCount = Math.max(data.length, 1);

  return (
    <Card
      title="Company Risk Ranking"
      subtitle={`Top ${limit} issuers by anomaly rate · lower scores in timeline = higher event risk`}
      className="chart-card company-risk-chart w-full"
    >
      {data.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No company summary data available.</p>
      ) : (
        <ChartViewport mobileHeight={280}>
          {({ yAxisWidth, tickFontSize }) => (
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 48, left: 4, bottom: 8 }}
              barCategoryGap={barCount > 8 ? "14%" : "22%"}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartGridStroke}
                horizontal={false}
              />
              <XAxis
                type="number"
                tickFormatter={(v) => `${(Number(v) * 100).toFixed(1)}%`}
                tick={{ ...chartAxisTick, fontSize: tickFontSize(11, 8) }}
                axisLine={chartAxisLine}
                tickLine={{ stroke: chartTickLineStroke }}
              />
              <YAxis
                type="category"
                dataKey="ticker"
                width={yAxisWidth(56, 52)}
                tick={{
                  ...chartAxisTickEmphasis,
                  fontSize: tickFontSize(11, 9),
                }}
                axisLine={chartAxisLine}
                tickLine={false}
              />
              <Tooltip
                cursor={chartTooltipCursor}
                contentStyle={chartTooltipContentStyle}
                labelStyle={chartTooltipLabelStyle}
                itemStyle={chartTooltipItemStyleAccent}
                formatter={(value, _name, item) => {
                  const payload = item?.payload as {
                    rateLabel?: string;
                    anomalies?: number;
                  };
                  return [
                    `${payload?.rateLabel ?? value} · ${payload?.anomalies ?? 0} anomalies`,
                    "Anomaly rate",
                  ];
                }}
              />
              <Bar
                dataKey="rate"
                radius={[0, 3, 3, 0]}
                maxBarSize={28}
                activeBar={chartActiveBar}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.ticker}
                    fill={chartBarCellFill(index)}
                    stroke={chartBarStroke}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ChartViewport>
      )}
    </Card>
  );
}
