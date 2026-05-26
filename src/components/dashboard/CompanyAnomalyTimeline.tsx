"use client";

import { useId } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { ChartRechartsDefs } from "@/components/dashboard/ChartRechartsDefs";
import type { AnomalyRecord, AnomalySeverity } from "@/lib/types";
import {
  anomalyRecordsMatch,
  formatDate,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  severityChartFill,
  toFiniteNumber,
} from "@/lib/formatters";
import {
  chartActiveDot,
  chartAxisLine,
  chartAxisTick,
  chartGradientIds,
  chartGridStroke,
  chartLineStroke,
  chartPointHighlightFill,
  chartPointHighlightStroke,
  chartPointUnselectedStroke,
  chartSeverityLegend,
  chartTickLineStroke,
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipItemStyleAccent,
  chartTooltipLabelStyle,
} from "@/lib/chartTheme";

interface CompanyAnomalyTimelineProps {
  ticker: string;
  records: AnomalyRecord[];
  selectedRecord: AnomalyRecord | null;
  onSelect: (record: AnomalyRecord) => void;
  loading?: boolean;
  fillHeight?: boolean;
}

interface TimelinePoint {
  date: string;
  score: number;
  severity: AnomalySeverity;
  record: AnomalyRecord;
}

export function CompanyAnomalyTimeline({
  ticker,
  records,
  selectedRecord,
  onSelect,
  loading,
  fillHeight = false,
}: CompanyAnomalyTimelineProps) {
  const instanceId = useId();
  const gradients = chartGradientIds(instanceId);

  const points: TimelinePoint[] = [...records]
    .filter((r) => r.is_anomaly !== false)
    .map((record) => {
      const score = toFiniteNumber(record.anomaly_score);
      if (score === undefined) return null;
      return {
        date: String(record.date ?? "").slice(0, 10),
        score,
        severity: getAnomalySeverity(record.anomaly_score),
        record,
      };
    })
    .filter((p): p is TimelinePoint => p !== null && Boolean(p.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  const renderDot = (props: {
    cx?: number;
    cy?: number;
    payload?: TimelinePoint;
  }) => {
    const { cx = 0, cy = 0, payload } = props;
    if (!payload) return null;
    const selected = anomalyRecordsMatch(payload.record, selectedRecord);
    if (!selected) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill={severityChartFill(payload.severity)}
          fillOpacity={0.85}
          stroke={chartPointUnselectedStroke}
          strokeWidth={0}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(payload.record);
          }}
        />
      );
    }
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4.5}
        fill={chartPointHighlightFill}
        stroke={chartPointHighlightStroke}
        strokeWidth={1.5}
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(payload.record);
        }}
      />
    );
  };

  const chartHeightClass = fillHeight
    ? "min-h-[280px] md:min-h-[320px] 2xl:min-h-[360px]"
    : "h-[280px] md:h-[320px] 2xl:h-[360px]";

  return (
    <Card
      title={`${formatTicker(ticker) || "—"} Anomaly Timeline`}
      subtitle="Anomaly score over time · click a point to select for AI briefing · lower = higher risk"
      fillHeight={fillHeight}
      className={fillHeight ? "h-full w-full" : "w-full"}
    >
      {loading && (
        <p className="text-sm text-[var(--text-muted)]">Loading anomaly history…</p>
      )}
      {!loading && !ticker && (
        <p className="text-sm text-[var(--text-muted)]">Select a company to view its anomaly timeline.</p>
      )}
      {!loading && ticker && points.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No anomaly events for this ticker.</p>
      )}
      {!loading && points.length > 0 && (
        <div className={fillHeight ? "flex min-h-0 flex-1 flex-col" : ""}>
          <div className={`chart-embedded w-full flex-1 ${chartHeightClass}`}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={points}
                margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
              >
                <ChartRechartsDefs areaGradientId={gradients.area} />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartGridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ ...chartAxisTick, fontSize: 10 }}
                  axisLine={chartAxisLine}
                  tickLine={{ stroke: chartTickLineStroke }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  dataKey="score"
                  tick={chartAxisTick}
                  axisLine={chartAxisLine}
                  tickLine={{ stroke: chartTickLineStroke }}
                  tickFormatter={(v) => Number(v).toFixed(3)}
                  width={48}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip
                  cursor={chartTooltipCursor}
                  contentStyle={chartTooltipContentStyle}
                  labelStyle={chartTooltipLabelStyle}
                  itemStyle={chartTooltipItemStyleAccent}
                  formatter={(value, _name, item) => {
                    const payload = item?.payload as TimelinePoint | undefined;
                    if (!payload) return [value, "Score"];
                    return [
                      `${formatScore(payload.score)} · ${payload.severity}`,
                      formatDate(payload.date),
                    ];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  fill={`url(#${gradients.area})`}
                  stroke="none"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={chartLineStroke}
                  strokeWidth={1.75}
                  dot={false}
                  activeDot={chartActiveDot}
                  isAnimationActive={false}
                />
                <Scatter
                  dataKey="score"
                  shape={renderDot}
                  onClick={(state) => {
                    const payload = (state as { payload?: TimelinePoint })
                      ?.payload;
                    if (payload?.record) onSelect(payload.record);
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex shrink-0 flex-wrap gap-3 text-[10px] text-[var(--text-muted)]">
            {(
              [
                ["Critical", chartSeverityLegend.Critical],
                ["High", chartSeverityLegend.High],
                ["Medium", chartSeverityLegend.Medium],
                ["Low", chartSeverityLegend.Low],
              ] as const
            ).map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />{" "}
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
