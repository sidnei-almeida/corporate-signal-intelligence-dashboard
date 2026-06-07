"use client";

import Link from "next/link";
import { MobileAnomalyEventList } from "@/components/dashboard/MobileAnomalyEventList";
import { IconArrowRight } from "@/components/icons";
import { CompanyTickerCell } from "@/components/company-icons";
import { Card } from "@/components/ui/Card";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { CARD_DIVIDER, metricValueClass } from "@/lib/cardVisuals";
import type { AnomalyRecord } from "@/lib/types";
import {
  formatAnomalyTypeLabel,
  formatDate,
  formatScore,
  getAnomalySeverity,
  primaryAnomalyType,
  splitAnomalyTypes,
  toFiniteNumber,
} from "@/lib/formatters";

interface TopAnomaliesPreviewProps {
  records: AnomalyRecord[];
  limit?: number;
}

const thClass =
  "table-head-cell pb-3 pt-1 text-left";
const tdClass =
  "py-2.5 pr-4 text-xs leading-normal text-[var(--text-secondary)] 2xl:py-3 2xl:text-sm";

export function TopAnomaliesPreview({
  records,
  limit = 12,
}: TopAnomaliesPreviewProps) {
  const sorted = [...records]
    .sort(
      (a, b) =>
        (toFiniteNumber(a.anomaly_score) ?? 0) -
        (toFiniteNumber(b.anomaly_score) ?? 0),
    )
    .slice(0, limit);

  return (
    <Card
      title="Top 12 Anomaly Events"
      subtitle="Highest-risk signals ranked by anomaly score"
      action={
        <Link
          href="/anomalies"
          className="view-all see-all flex items-center gap-1 text-xs font-medium link-accent transition hover:text-[var(--accent-primary)] 2xl:text-sm"
        >
          View all
          <IconArrowRight size={16} />
        </Link>
      }
      fillHeight
      className="anomaly-table events-table h-full w-full"
      data-component="events-table"
    >
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No anomaly events available.</p>
      ) : (
        <>
          <div className="events-table-desktop -mx-1 flex min-h-0 flex-1 flex-col px-1">
            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[var(--bg-surface)]">
                <tr className={`border-b ${CARD_DIVIDER}`}>
                  <th className={thClass}>Ticker</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Score</th>
                  <th className={thClass}>Severity</th>
                  <th className={thClass}>Type</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((record, index) => {
                  const severity = getAnomalySeverity(record.anomaly_score);
                  const types = splitAnomalyTypes(
                    String(record.anomaly_type ?? ""),
                  );
                  const typeLabel =
                    types.length > 0
                      ? formatAnomalyTypeLabel(types[0])
                      : formatAnomalyTypeLabel(primaryAnomalyType(record.anomaly_type));

                  return (
                    <tr
                      key={`${record.ticker}-${record.date}-${index}`}
                      className={`border-b table-row-hover ${CARD_DIVIDER}`}
                    >
                      <td className={tdClass}>
                        <Link
                          href="/anomalies"
                          className="block hover:opacity-90"
                        >
                          <CompanyTickerCell ticker={String(record.ticker)} />
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <Link href="/anomalies" className="block">
                          {formatDate(String(record.date))}
                        </Link>
                      </td>
                      <td className={`${tdClass} ${metricValueClass(severity)}`}>
                        <Link href="/anomalies" className="block">
                          {formatScore(record.anomaly_score)}
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <Link href="/anomalies" className="block">
                          <SeverityIndicator severity={severity} compact />
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <Link
                          href="/anomalies"
                          className="block max-w-[200px] truncate text-[var(--text-secondary)]"
                          title={typeLabel}
                        >
                          {typeLabel}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
          <MobileAnomalyEventList records={sorted} />
        </>
      )}
    </Card>
  );
}
