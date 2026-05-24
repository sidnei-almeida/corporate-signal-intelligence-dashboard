"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
  severityStyles,
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
      subtitle="Critical signals across the universe · click a row for details and executive briefing"
      className="w-full overflow-hidden"
    >
      <div className="-mx-4 max-h-[min(420px,55vh)] overflow-auto px-4 sm:-mx-5 sm:px-5 2xl:-mx-6 2xl:max-h-[480px] 2xl:px-6">
        <table className="w-full min-w-[880px] text-left text-xs 2xl:text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm">
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="bg-zinc-950/95 pb-3 pr-4 pt-1 font-semibold">Ticker</th>
              <th className="bg-zinc-950/95 pb-3 pr-4 pt-1 font-semibold">Date</th>
              <th className="bg-zinc-950/95 pb-3 pr-4 pt-1 font-semibold">Score</th>
              <th className="bg-zinc-950/95 pb-3 pr-4 pt-1 font-semibold">Severity</th>
              <th className="bg-zinc-950/95 pb-3 pr-4 pt-1 font-semibold">Type</th>
              <th className="bg-zinc-950/95 pb-3 pr-4 pt-1 font-semibold">Return</th>
              <th className="bg-zinc-950/95 pb-3 pr-4 pt-1 font-semibold">Vol Z</th>
              <th className="bg-zinc-950/95 pb-3 pt-1 font-semibold">Filings 30d</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((record, index) => {
              const severity = getAnomalySeverity(record.anomaly_score);
              const isSelected = anomalyRecordsMatch(record, selectedRecord);
              const isTopRisk = index < 3;

              return (
                <tr
                  key={rowKey(record, index)}
                  onClick={() => onSelect(record)}
                  className={`cursor-pointer border-b border-white/5 transition hover:bg-white/[0.03] ${
                    isSelected ? "bg-cyan-500/10" : ""
                  } ${isTopRisk ? "bg-rose-950/20" : ""}`}
                >
                  <td className="py-2.5 pr-4 font-medium text-slate-100">
                    {formatTicker(record.ticker)}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-400">
                    {formatDate(String(record.date))}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-cyan-300">
                    {formatScore(record.anomaly_score)}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge className={severityStyles(severity)}>{severity}</Badge>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex max-w-[220px] flex-wrap gap-1">
                      {splitAnomalyTypes(record.anomaly_type).length > 0 ? (
                        splitAnomalyTypes(record.anomaly_type)
                          .slice(0, 2)
                          .map((t) => (
                            <Badge
                              key={t}
                              className="border-white/10 bg-zinc-900 text-slate-400 normal-case"
                            >
                              {t.replace(/_/g, " ")}
                            </Badge>
                          ))
                      ) : (
                        <Badge className="border-white/10 bg-zinc-900 text-slate-500">
                          {primaryAnomalyType(record.anomaly_type)}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-slate-300">
                    {formatPercent(record.daily_return)}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-slate-400">
                    {formatNumber(record.volume_zscore_30d, 2)}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">
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
