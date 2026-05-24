"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { ANOMALY_TYPE_LABELS } from "@/lib/constants";
import type { AnomalyRecord } from "@/lib/types";
import {
  countAnomalyTypesByRecord,
  formatDate,
  formatTicker,
  getAnomalySeverity,
  primaryAnomalyType,
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

interface CompanySignalBreakdownProps {
  ticker: string;
  records: AnomalyRecord[];
  loading?: boolean;
  fillHeight?: boolean;
}

function labelForType(type: string): string {
  return ANOMALY_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-zinc-900/50 px-3 py-2.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-100">{value}</dd>
    </div>
  );
}

export function CompanySignalBreakdown({
  ticker,
  records,
  loading,
  fillHeight = false,
}: CompanySignalBreakdownProps) {
  const anomalyRecords = useMemo(
    () => records.filter((r) => r.is_anomaly !== false),
    [records],
  );

  const typeCounts = useMemo(
    () => countAnomalyTypesByRecord(records),
    [records],
  );

  const chartData = useMemo(
    () =>
      typeCounts.slice(0, 8).map((d) => ({
        type: labelForType(d.type),
        count: d.count,
      })),
    [typeCounts],
  );

  const insights = useMemo(() => {
    const dominant = typeCounts[0];
    const criticalCount = anomalyRecords.filter(
      (r) => getAnomalySeverity(r.anomaly_score) === "Critical",
    ).length;

    const latest = [...anomalyRecords].sort((a, b) => {
      const da = String(a.date ?? "");
      const db = String(b.date ?? "");
      return db.localeCompare(da);
    })[0];

    const latestType = latest
      ? labelForType(primaryAnomalyType(String(latest.anomaly_type ?? "")))
      : "—";
    const latestDate = latest ? formatDate(String(latest.date)) : "—";

    return {
      dominant: dominant ? labelForType(dominant.type) : "—",
      diversity: String(typeCounts.length),
      criticalCount: String(criticalCount),
      latestSignal:
        latest && latestType !== "—"
          ? `${latestType} · ${latestDate}`
          : "—",
    };
  }, [typeCounts, anomalyRecords]);

  const chartMinHeight = Math.max(200, chartData.length * 36);
  const hasSignals = Boolean(ticker) && chartData.length > 0;

  const body = (
    <>
      {loading && (
        <p className="text-sm text-slate-500">Loading signal breakdown…</p>
      )}

      {!loading && !ticker && (
        <div
          className={`flex flex-1 flex-col items-center justify-center text-center ${
            fillHeight ? "min-h-[280px]" : "py-12"
          }`}
        >
          <p className="text-sm text-slate-500">
            Select a company to view signal mix.
          </p>
        </div>
      )}

      {!loading && ticker && !hasSignals && (
        <div
          className={`flex flex-1 flex-col items-center justify-center text-center ${
            fillHeight ? "min-h-[280px]" : "py-12"
          }`}
        >
          <p className="max-w-xs text-sm text-slate-500">
            No anomaly signals available for this company.
          </p>
        </div>
      )}

      {!loading && hasSignals && (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex min-h-0 flex-[1.2] flex-col">
            <div className="mb-3 flex shrink-0 flex-wrap gap-2">
              {chartData.slice(0, 4).map((d) => (
                <span
                  key={d.type}
                  className="rounded-md border border-white/10 bg-zinc-900/60 px-2 py-1 text-xs text-slate-400"
                >
                  {d.type}{" "}
                  <span className="font-mono text-cyan-300/90">{d.count}</span>
                </span>
              ))}
            </div>
            <div
              className="min-h-[200px] w-full flex-1"
              style={{ minHeight: chartMinHeight }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartGridStroke}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={chartAxisTick}
                    axisLine={chartAxisLine}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="type"
                    width={110}
                    tick={chartAxisTickEmphasis}
                    axisLine={chartAxisLine}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={chartTooltipCursor}
                    contentStyle={chartTooltipContentStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyle}
                  />
                  <Bar
                    dataKey="count"
                    fill="rgba(34, 211, 238, 0.5)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="shrink-0 border-t border-white/5 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Signal Profile
            </h3>
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InsightRow label="Dominant Signal" value={insights.dominant} />
              <InsightRow
                label="Signal Diversity"
                value={`${insights.diversity} unique types`}
              />
              <InsightRow
                label="Critical Events"
                value={insights.criticalCount}
              />
              <InsightRow label="Latest Signal" value={insights.latestSignal} />
            </dl>
          </div>
        </div>
      )}

      <p
        className={`shrink-0 border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-500 ${
          fillHeight ? "mt-auto" : hasSignals || (!loading && ticker) ? "mt-4" : ""
        }`}
      >
        Signal mix shows which drivers most often explain abnormal behavior for
        this issuer.
      </p>
    </>
  );

  return (
    <Card
      title="Company Signal Breakdown"
      subtitle={
        ticker
          ? `${formatTicker(ticker)} · anomaly type frequency`
          : "Select a company"
      }
      fillHeight={fillHeight}
      className={fillHeight ? "h-full w-full" : "w-full"}
    >
      {fillHeight ? (
        <div className="flex min-h-0 flex-1 flex-col">{body}</div>
      ) : (
        body
      )}
    </Card>
  );
}
