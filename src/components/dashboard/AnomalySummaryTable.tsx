"use client";

import { useState } from "react";
import { IconChevronDown } from "@/components/icons";
import { CompanyTickerCell } from "@/components/company-icons";
import { Card } from "@/components/ui/Card";
import { CARD_DIVIDER, INLINE_TEXT_TAG } from "@/lib/cardVisuals";
import { TYPE_DATA_ACCENT } from "@/lib/typography";
import type { AnomalySummary } from "@/lib/types";
import {
  formatAnomalyRate,
  formatScore,
  toFiniteNumber,
} from "@/lib/formatters";

interface AnomalySummaryTableProps {
  summaries: AnomalySummary[];
  defaultCollapsed?: boolean;
}

export function AnomalySummaryTable({
  summaries,
  defaultCollapsed = true,
}: AnomalySummaryTableProps) {
  const [open, setOpen] = useState(!defaultCollapsed);

  const sorted = [...summaries].sort(
    (a, b) =>
      (toFiniteNumber(b.anomaly_rate) ?? 0) -
      (toFiniteNumber(a.anomaly_rate) ?? 0),
  );

  return (
    <Card
      title="Company Anomaly Summary"
      subtitle="Secondary data table · full issuer metrics"
      className="w-full"
      action={
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1 px-3 py-1.5 transition hover:border-[var(--border-default)] hover:text-[var(--text-primary)] ${INLINE_TEXT_TAG}`}
        >
          {open ? "Collapse" : "Expand"}
          <IconChevronDown
            size={14}
            className={`transition ${open ? "rotate-180" : ""}`}
          />
        </button>
      }
    >
      {!open && (
        <p className="text-sm text-[var(--text-muted)]">
          {sorted.length} companies tracked · use the risk ranking chart above for
          primary visual analysis.
        </p>
      )}
      {open && (
        <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5 2xl:-mx-6 2xl:px-6">
          <table className="w-full min-w-[640px] text-left text-xs 2xl:text-sm">
            <thead>
              <tr className={`border-b ${CARD_DIVIDER}`}>
                <th className="table-head-cell pb-2 pr-3 text-left">Ticker</th>
                <th className="table-head-cell pb-2 pr-3 text-left">Rows</th>
                <th className="table-head-cell pb-2 pr-3 text-left">Anomalies</th>
                <th className="table-head-cell pb-2 pr-3 text-left">Rate</th>
                <th className="table-head-cell pb-2 pr-3 text-left">Min</th>
                <th className="table-head-cell pb-2 pr-3 text-left">Avg</th>
                <th className="table-head-cell pb-2 text-left">Max</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.ticker}
                  className={`border-b text-[var(--text-secondary)] ${CARD_DIVIDER}`}
                >
                  <td className="py-2 pr-3">
                    <CompanyTickerCell ticker={row.ticker} />
                  </td>
                  <td className="py-2 pr-3 font-data">{row.rows.toLocaleString()}</td>
                  <td className="py-2 pr-3 font-data">{row.anomalies}</td>
                  <td className={`py-2 pr-3 ${TYPE_DATA_ACCENT}`}>
                    {formatAnomalyRate(row.anomaly_rate)}
                  </td>
                  <td className="py-2 pr-3 font-data text-xs">
                    {formatScore(row.min_score)}
                  </td>
                  <td className="py-2 pr-3 font-data text-xs">
                    {formatScore(row.avg_score)}
                  </td>
                  <td className="py-2 font-data text-xs">
                    {formatScore(row.max_score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
