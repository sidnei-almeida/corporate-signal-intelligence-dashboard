"use client";

import { Card } from "@/components/ui/Card";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { AnomalyTypeTags } from "@/components/ui/AnomalyTypeTags";
import { CARD_DIVIDER, metricValueClass } from "@/lib/cardVisuals";
import type { AnomalyRecord } from "@/lib/types";
import {
  anomalyRecordsMatch,
  formatDate,
  formatNumber,
  formatPercent,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  primaryAnomalyType,
  splitAnomalyTypes,
  toFiniteNumber,
} from "@/lib/formatters";

interface TopAnomaliesTableProps {
  records: AnomalyRecord[];
  selectedRecord: AnomalyRecord | null;
  onSelect: (record: AnomalyRecord) => void;
}

function rowKey(record: AnomalyRecord, index: number): string {
  return `${record.ticker ?? "x"}-${record.date ?? index}`;
}

export function TopAnomaliesTable({
  records,
  selectedRecord,
  onSelect,
}: TopAnomaliesTableProps) {
  const sorted = [...records].sort(
    (a, b) =>
      (toFiniteNumber(a.anomaly_score) ?? 0) -
      (toFiniteNumber(b.anomaly_score) ?? 0),
  );

  return (
    <Card
      title="Top Anomaly Events"
      subtitle="Critical signals across the universe · click a row for details and AI briefing"
      className="w-full overflow-hidden"
    >
      <div className="-mx-4 max-h-[min(420px,55vh)] overflow-auto px-4 sm:-mx-5 sm:px-5 2xl:-mx-6 2xl:max-h-[480px] 2xl:px-6">
        <table className="w-full min-w-[880px] text-left text-xs leading-normal 2xl:text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--bg-surface)] backdrop-blur-sm">
            <tr className={`border-b ${CARD_DIVIDER}`}>
              <th className="table-head-cell bg-[var(--bg-surface)] pb-3 pr-4 pt-1">Ticker</th>
              <th className="table-head-cell bg-[var(--bg-surface)] pb-3 pr-4 pt-1">Date</th>
              <th className="table-head-cell bg-[var(--bg-surface)] pb-3 pr-4 pt-1">Score</th>
              <th className="table-head-cell bg-[var(--bg-surface)] pb-3 pr-4 pt-1">Severity</th>
              <th className="table-head-cell bg-[var(--bg-surface)] pb-3 pr-4 pt-1">Type</th>
              <th className="table-head-cell bg-[var(--bg-surface)] pb-3 pr-4 pt-1">Return</th>
              <th className="table-head-cell bg-[var(--bg-surface)] pb-3 pr-4 pt-1">Vol Z</th>
              <th className="table-head-cell bg-[var(--bg-surface)] pb-3 pt-1">Filings 30d</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((record, index) => {
              const severity = getAnomalySeverity(record.anomaly_score);
              const isSelected = anomalyRecordsMatch(record, selectedRecord);
              return (
                <tr
                  key={rowKey(record, index)}
                  onClick={() => onSelect(record)}
                  className={`cursor-pointer border-b table-row-hover ${CARD_DIVIDER} ${
                    isSelected ? "row-selected border-transparent" : ""
                  }`}
                >
                  <td className="py-2.5 pr-4 font-data font-semibold text-[var(--text-primary)]">
                    {formatTicker(record.ticker)}
                  </td>
                  <td className="py-2.5 pr-4 font-data text-[var(--text-secondary)]">
                    {formatDate(String(record.date))}
                  </td>
                  <td className={`py-2.5 pr-4 text-xs ${metricValueClass(severity)}`}>
                    {formatScore(record.anomaly_score)}
                  </td>
                  <td className="py-2.5 pr-4">
                    <SeverityIndicator severity={severity} />
                  </td>
                  <td className="py-2.5 pr-4">
                    <AnomalyTypeTags
                      types={
                        splitAnomalyTypes(record.anomaly_type).length > 0
                          ? splitAnomalyTypes(record.anomaly_type)
                          : [primaryAnomalyType(record.anomaly_type)]
                      }
                      maxItems={2}
                    />
                  </td>
                  <td className="py-2.5 pr-4 text-[var(--text-secondary)]">
                    {formatPercent(record.daily_return)}
                  </td>
                  <td className="py-2.5 pr-4 font-data text-[var(--text-secondary)]">
                    {formatNumber(record.volume_zscore_30d, 2)}
                  </td>
                  <td className="py-2.5 font-data text-[var(--text-secondary)]">
                    {formatNumber(record.filing_count_30d, 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
