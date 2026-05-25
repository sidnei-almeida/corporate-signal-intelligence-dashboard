"use client";

import { useId, useMemo } from "react";
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
import { MetricCell } from "@/components/ui/MetricCell";
import { ChartRechartsDefs } from "@/components/dashboard/ChartRechartsDefs";
import { ANOMALY_TYPE_LABELS } from "@/lib/constants";
import { CARD_DIVIDER, INLINE_TEXT_TAG, SECTION_LABEL } from "@/lib/cardVisuals";
import { TYPE_DATA_ACCENT } from "@/lib/typography";
import type { AnomalyRecord } from "@/lib/types";
import {
  countAnomalyTypesByRecord,
  formatDate,
  formatTicker,
  getAnomalySeverity,
  primaryAnomalyType,
} from "@/lib/formatters";
import {
  chartActiveBar,
  chartAxisLine,
  chartAxisTick,
  chartAxisTickEmphasis,
  chartBarGradientUrl,
  chartGradientIds,
  chartGridStroke,
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipItemStyleAccent,
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
  const instanceId = useId();
  const gradients = chartGradientIds(instanceId);
  const barGradientFill = chartBarGradientUrl(gradients.bar);

  const body = (
    <>
      {loading && (
        <p className="text-sm text-[var(--text-muted)]">Loading signal breakdown…</p>
      )}

      {!loading && !ticker && (
        <div
          className={`flex flex-1 flex-col items-center justify-center text-center ${
            fillHeight ? "min-h-[280px]" : "py-12"
          }`}
        >
          <p className="text-sm text-[var(--text-muted)]">
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
          <p className="max-w-xs text-sm text-[var(--text-muted)]">
            No anomaly signals available for this company.
          </p>
        </div>
      )}

      {!loading && hasSignals && (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex min-h-0 flex-[1.2] flex-col">
            <div className="mb-3 flex shrink-0 flex-wrap gap-2">
              {chartData.slice(0, 4).map((d) => (
                <span key={d.type} className={INLINE_TEXT_TAG}>
                  {d.type}{" "}
                  <span className={`${TYPE_DATA_ACCENT} ml-0.5`}>{d.count}</span>
                </span>
              ))}
            </div>
            <div
              className="chart-embedded min-h-[200px] w-full flex-1"
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
                  <ChartRechartsDefs barGradientId={gradients.bar} />
                  <Tooltip
                    cursor={chartTooltipCursor}
                    contentStyle={chartTooltipContentStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyleAccent}
                  />
                  <Bar
                    dataKey="count"
                    fill={barGradientFill}
                    radius={[0, 3, 3, 0]}
                    maxBarSize={22}
                    activeBar={chartActiveBar}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`shrink-0 border-t pt-4 ${CARD_DIVIDER}`}>
            <h3 className={SECTION_LABEL}>Signal Profile</h3>
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <MetricCell label="Dominant Signal" value={insights.dominant} />
              <MetricCell
                label="Signal Diversity"
                value={`${insights.diversity} unique types`}
              />
              <MetricCell
                label="Critical Events"
                value={insights.criticalCount}
              />
              <MetricCell label="Latest Signal" value={insights.latestSignal} />
            </dl>
          </div>
        </div>
      )}

      <p
        className={`shrink-0 border-t pt-3 text-xs leading-relaxed text-[var(--text-muted)] ${CARD_DIVIDER} ${
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
