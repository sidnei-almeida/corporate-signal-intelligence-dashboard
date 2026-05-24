"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import type { AnomalySummary } from "@/lib/types";
import {
  formatAnomalyRate,
  formatTicker,
  toFiniteNumber,
} from "@/lib/formatters";
import {
  chartAxisLine,
  chartAxisTick,
  chartAxisTickEmphasis,
  chartGridStroke,
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipItemStyle,
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
      className="w-full"
    >
      {data.length === 0 ? (
        <p className="text-sm text-slate-500">No company summary data available.</p>
      ) : (
        <div className="h-[280px] w-full md:h-[320px] 2xl:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
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
                tick={chartAxisTick}
                axisLine={chartAxisLine}
                tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              />
              <YAxis
                type="category"
                dataKey="ticker"
                width={56}
                tick={chartAxisTickEmphasis}
                axisLine={chartAxisLine}
                tickLine={false}
              />
              <Tooltip
                cursor={chartTooltipCursor}
                contentStyle={chartTooltipContentStyle}
                labelStyle={chartTooltipLabelStyle}
                itemStyle={chartTooltipItemStyle}
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
              <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {data.map((entry) => (
                  <Cell
                    key={entry.ticker}
                    fill="rgba(34, 211, 238, 0.55)"
                    stroke="rgba(34, 211, 238, 0.25)"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
