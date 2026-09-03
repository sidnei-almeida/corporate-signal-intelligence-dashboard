"use client";

import { Card } from "@/components/ui/Card";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { AnomalyTypeTags } from "@/components/ui/AnomalyTypeTags";
import { metricValueClass } from "@/lib/cardVisuals";
import type { AnomalyRecord } from "@/lib/types";
import {
  anomalyRecordsMatch,
  formatDate,
  formatNumber,
  formatPercent,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  splitAnomalyTypes,
  toFiniteNumber,
} from "@/lib/formatters";

interface TopCompanyEventsProps {
  ticker: string;
  records: AnomalyRecord[];
  selectedRecord: AnomalyRecord | null;
  onSelect: (record: AnomalyRecord) => void;
  loading?: boolean;
}

export function TopCompanyEvents({
  ticker,
  records,
  selectedRecord,
  onSelect,
  loading,
}: TopCompanyEventsProps) {
  const sorted = [...records]
    .filter((r) => r.is_anomaly !== false)
    .sort(
      (a, b) =>
        (toFiniteNumber(b.anomaly_score) ?? 0) -
        (toFiniteNumber(a.anomaly_score) ?? 0),
    );

  return (
    <Card
      title="Top Company Events"
      subtitle={
        ticker
          ? `${formatTicker(ticker)} · ranked by anomaly score`
          : "Select a company"
      }
      className="w-full 2xl:min-h-[37.75rem]"
    >
      {loading && (
        <p className="text-sm text-[var(--text-muted)]">Loading company events…</p>
      )}
      {!loading && !ticker && (
        <p className="text-sm text-[var(--text-muted)]">Select a company to view events.</p>
      )}
      {!loading && ticker && sorted.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No anomaly events for this ticker.</p>
      )}
      {!loading && sorted.length > 0 && (
        <div className="max-h-[min(420px,55vh)] overflow-y-auto 2xl:min-h-[29.75rem] 2xl:max-h-[29.75rem]">
          <ul className="divide-y divide-[var(--border-subtle)]">
            {sorted.map((record, index) => {
              const severity = getAnomalySeverity(record.anomaly_score);
              const isSelected = anomalyRecordsMatch(record, selectedRecord);
              const types = splitAnomalyTypes(String(record.anomaly_type ?? ""));

              return (
                <li key={`${record.ticker}-${record.date}-${index}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(record)}
                    className={`w-full px-1 py-3 text-left table-row-hover ${
                      isSelected ? "row-selected border-transparent" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {formatDate(String(record.date))}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs 2xl:text-sm ${metricValueClass(severity)}`}>
                          {formatScore(record.anomaly_score)}
                        </span>
                        <SeverityIndicator severity={severity} />
                      </div>
                    </div>
                    {types.length > 0 && (
                      <div className="mt-2">
                        <AnomalyTypeTags types={types} maxItems={3} />
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--text-muted)] 2xl:text-sm">
                      <span>Return {formatPercent(record.log_return)}</span>
                      <span>Vol Z {formatNumber(record.volume_zscore_21d, 2)}</span>
                      <span>Range Z {formatNumber(record.range_zscore_21d, 2)}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
