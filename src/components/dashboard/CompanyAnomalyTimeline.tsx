"use client";

import {
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
  chartAxisLine,
  chartAxisTick,
  chartGridStroke,
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipItemStyle,
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
    return (
      <circle
        cx={cx}
        cy={cy}
        r={selected ? 7 : 5}
        fill={severityChartFill(payload.severity)}
        stroke={selected ? "#22d3ee" : "rgba(15,23,42,0.9)"}
        strokeWidth={selected ? 2 : 1}
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(payload.record);
        }}
      />
    );
  };

  return (
    <Card
      title={`${formatTicker(ticker) || "—"} Anomaly Timeline`}
      subtitle="Anomaly score over time · click a point to select for briefing · lower = higher risk"
      fillHeight={fillHeight}
      className={fillHeight ? "h-full w-full" : "w-full"}
    >
      {loading && (
        <p className="text-sm text-slate-500">Loading anomaly history…</p>
      )}
      {!loading && !ticker && (
        <p className="text-sm text-slate-500">Select a company to view its anomaly timeline.</p>
      )}
      {!loading && ticker && points.length === 0 && (
        <p className="text-sm text-slate-500">No anomaly events for this ticker.</p>
      )}
      {!loading && points.length > 0 && (
        <div className={fillHeight ? "flex min-h-0 flex-1 flex-col" : ""}>
          <div
            className={`w-full flex-1 ${
              fillHeight
                ? "min-h-[280px] md:min-h-[320px] 2xl:min-h-[360px]"
                : "h-[280px] md:h-[320px] 2xl:h-[360px]"
            }`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={points}
                margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartGridStroke}
                />
                <XAxis
                  dataKey="date"
                  tick={{ ...chartAxisTick, fontSize: 10 }}
                  axisLine={chartAxisLine}
                  tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  dataKey="score"
                  tick={chartAxisTick}
                  axisLine={chartAxisLine}
                  tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickFormatter={(v) => Number(v).toFixed(3)}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={chartTooltipCursor}
                  contentStyle={chartTooltipContentStyle}
                  labelStyle={chartTooltipLabelStyle}
                  itemStyle={chartTooltipItemStyle}
                  formatter={(value, _name, item) => {
                    const payload = item?.payload as TimelinePoint | undefined;
                    if (!payload) return [value, "Score"];
                    return [
                      `${formatScore(payload.score)} · ${payload.severity}`,
                      formatDate(payload.date),
                    ];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="rgba(34, 211, 238, 0.3)"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Scatter
                  dataKey="score"
                  shape={renderDot}
                  onClick={(state) => {
                    const payload = (state as { payload?: TimelinePoint })?.payload;
                    if (payload?.record) onSelect(payload.record);
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex shrink-0 flex-wrap gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400/90" /> Critical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400/85" /> High
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400/75" /> Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-500/70" /> Low
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
