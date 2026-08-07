import { Card } from "@/components/ui/Card";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { METRIC_CELL, metricValueClass } from "@/lib/cardVisuals";
import type { AnomalyRecord } from "@/lib/types";
import {
  anomalyRecordsMatch,
  formatDate,
  formatPercent,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  primaryAnomalyType,
  formatAnomalyTypeLabel,
  toFiniteNumber,
} from "@/lib/formatters";

interface TickerAnomalyPanelProps {
  ticker: string;
  records: AnomalyRecord[];
  selectedRecord: AnomalyRecord | null;
  onSelect: (record: AnomalyRecord) => void;
  loading?: boolean;
}

export function TickerAnomalyPanel({
  ticker,
  records,
  selectedRecord,
  onSelect,
  loading,
}: TickerAnomalyPanelProps) {
  const sorted = [...records]
    .filter((r) => r.is_anomaly !== false)
    .sort(
      (a, b) =>
        (toFiniteNumber(a.anomaly_score) ?? 0) -
        (toFiniteNumber(b.anomaly_score) ?? 0),
    )
    .slice(0, 12);

  return (
    <Card
      title={`${formatTicker(ticker)} Anomalies`}
      subtitle="Select a date for AI briefing generation"
    >
      {loading && (
        <p className="text-sm text-[var(--text-muted)]">Loading ticker anomalies…</p>
      )}
      {!loading && sorted.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No anomaly records for this ticker.</p>
      )}
      {!loading && sorted.length > 0 && (
        <ul className="flex flex-col gap-2">
          {sorted.map((record) => {
            const isSelected = anomalyRecordsMatch(record, selectedRecord);
            const severity = getAnomalySeverity(record.anomaly_score);
            const scoreClass = metricValueClass(severity);

            return (
              <li key={`${record.ticker}-${record.date}`}>
                <button
                  type="button"
                  onClick={() => onSelect(record)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "row-selected border"
                      : `${METRIC_CELL} hover:bg-[rgba(255,255,255,0.04)] hover:border-[var(--border-default)]`
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {formatDate(String(record.date))}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${scoreClass}`}>
                        {formatScore(record.anomaly_score)}
                      </span>
                      <SeverityIndicator severity={severity} compact />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {formatAnomalyTypeLabel(primaryAnomalyType(record.anomaly_type))} ·{" "}
                    {formatPercent(record.log_return)} return
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
