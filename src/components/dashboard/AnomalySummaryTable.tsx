"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { AnomalySummary } from "@/lib/types";
import {
  formatAnomalyRate,
  formatScore,
  formatTicker,
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
          className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-slate-200"
        >
          {open ? "Collapse" : "Expand"}
          <ChevronDown
            className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
          />
        </button>
      }
    >
      {!open && (
        <p className="text-sm text-slate-500">
          {sorted.length} companies tracked · use the risk ranking chart above for
          primary visual analysis.
        </p>
      )}
      {open && (
        <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5 2xl:-mx-6 2xl:px-6">
          <table className="w-full min-w-[640px] text-left text-xs 2xl:text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-3 font-semibold">Ticker</th>
                <th className="pb-2 pr-3 font-semibold">Rows</th>
                <th className="pb-2 pr-3 font-semibold">Anomalies</th>
                <th className="pb-2 pr-3 font-semibold">Rate</th>
                <th className="pb-2 pr-3 font-semibold">Min</th>
                <th className="pb-2 pr-3 font-semibold">Avg</th>
                <th className="pb-2 font-semibold">Max</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.ticker}
                  className="border-b border-white/5 text-slate-300"
                >
                  <td className="py-2 pr-3 font-medium text-slate-100">
                    {formatTicker(row.ticker)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">{row.rows.toLocaleString()}</td>
                  <td className="py-2 pr-3 tabular-nums">{row.anomalies}</td>
                  <td className="py-2 pr-3 text-cyan-300">
                    {formatAnomalyRate(row.anomaly_rate)}
                  </td>
                  <td className="py-2 pr-3 font-mono text-[11px]">
                    {formatScore(row.min_score)}
                  </td>
                  <td className="py-2 pr-3 font-mono text-[11px]">
                    {formatScore(row.avg_score)}
                  </td>
                  <td className="py-2 font-mono text-[11px]">
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
