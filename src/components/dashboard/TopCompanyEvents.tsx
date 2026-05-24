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
  severityStyles,
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
        (toFiniteNumber(a.anomaly_score) ?? 0) -
        (toFiniteNumber(b.anomaly_score) ?? 0),
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
        <p className="text-sm text-slate-500">Loading company events…</p>
      )}
      {!loading && !ticker && (
        <p className="text-sm text-slate-500">Select a company to view events.</p>
      )}
      {!loading && ticker && sorted.length === 0 && (
        <p className="text-sm text-slate-500">No anomaly events for this ticker.</p>
      )}
      {!loading && sorted.length > 0 && (
        <div className="max-h-[min(420px,55vh)] overflow-y-auto 2xl:min-h-[29.75rem] 2xl:max-h-[29.75rem]">
          <ul className="divide-y divide-white/5">
            {sorted.map((record, index) => {
              const severity = getAnomalySeverity(record.anomaly_score);
              const isSelected = anomalyRecordsMatch(record, selectedRecord);
              const types = splitAnomalyTypes(String(record.anomaly_type ?? ""));

              return (
                <li key={`${record.ticker}-${record.date}-${index}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(record)}
                    className={`w-full px-1 py-3 text-left transition hover:bg-white/[0.02] ${
                      isSelected ? "bg-cyan-500/10" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-100">
                        {formatDate(String(record.date))}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-cyan-300 2xl:text-sm">
                          {formatScore(record.anomaly_score)}
                        </span>
                        <Badge className={severityStyles(severity)}>
                          {severity}
                        </Badge>
                      </div>
                    </div>
                    {types.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {types.slice(0, 3).map((t) => (
                          <Badge
                            key={t}
                            className="border-white/10 bg-zinc-900 text-xs text-slate-400 normal-case"
                          >
                            {t.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 2xl:text-sm">
                      <span>Return {formatPercent(record.daily_return)}</span>
                      <span>Vol Z {formatNumber(record.volume_zscore_30d, 2)}</span>
                      <span>Filings {formatNumber(record.filing_count_30d, 0)}</span>
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
