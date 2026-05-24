"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import type { AnomalyRecord, AnomalySeverity, Company } from "@/lib/types";
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
} from "@/lib/formatters";

const SEVERITIES: AnomalySeverity[] = ["Critical", "High", "Medium", "Low"];

interface AnomalyEventSelectorProps {
  companies: Company[];
  records: AnomalyRecord[];
  selectedRecord: AnomalyRecord | null;
  onSelect: (record: AnomalyRecord) => void;
  tickerFilter: string;
  severityFilter: string;
  typeSearch: string;
  onTickerFilterChange: (value: string) => void;
  onSeverityFilterChange: (value: string) => void;
  onTypeSearchChange: (value: string) => void;
  listLoading?: boolean;
  fillHeight?: boolean;
}

export function AnomalyEventSelector({
  companies,
  records,
  selectedRecord,
  onSelect,
  tickerFilter,
  severityFilter,
  typeSearch,
  onTickerFilterChange,
  onSeverityFilterChange,
  onTypeSearchChange,
  listLoading,
  fillHeight = false,
}: AnomalyEventSelectorProps) {
  return (
    <Card
      title="Anomaly Event Queue"
      fillHeight={fillHeight}
      className={
        fillHeight
          ? "h-full w-full max-h-[calc(53vh-100px)] overflow-hidden"
          : "w-full"
      }
      action={
        records.length > 0 ? (
          <Badge className="border-cyan-500/20 bg-cyan-500/10 font-mono text-[11px] text-cyan-300">
            {records.length} events
          </Badge>
        ) : undefined
      }
    >
      <div
        className={`flex flex-col gap-3 ${fillHeight ? "min-h-0 flex-1" : ""}`}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Select
            label="Ticker"
            value={tickerFilter}
            onChange={(e) => onTickerFilterChange(e.target.value)}
          >
            <option value="">All tickers</option>
            {companies.map((c) => (
              <option key={c.ticker} value={c.ticker}>
                {formatTicker(c.ticker)}
              </option>
            ))}
          </Select>
          <Select
            label="Severity"
            value={severityFilter}
            onChange={(e) => onSeverityFilterChange(e.target.value)}
          >
            <option value="">All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Search anomaly type
          </label>
          <input
            type="search"
            value={typeSearch}
            onChange={(e) => onTypeSearchChange(e.target.value)}
            placeholder="e.g. filing, volume, revenue"
            className="w-full rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>

        {listLoading && (
          <p className="text-sm text-slate-500">Loading events…</p>
        )}

        {!listLoading && records.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            No events match the current filters.
          </p>
        )}

        {!listLoading && records.length > 0 && (
          <ul
            className={`space-y-1 overflow-y-auto pr-1 ${
              fillHeight
                ? "min-h-0 flex-1"
                : "max-h-[min(440px,52vh)]"
            }`}
          >
            {records.map((record, index) => {
              const severity = getAnomalySeverity(record.anomaly_score);
              const isSelected = anomalyRecordsMatch(record, selectedRecord);
              const types = splitAnomalyTypes(String(record.anomaly_type ?? ""));

              return (
                <li key={`${record.ticker}-${record.date}-${index}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(record)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "border border-cyan-500/40 bg-cyan-500/[0.12] shadow-[inset_3px_0_0_0_rgba(34,211,238,0.85)]"
                        : "border border-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-100">
                          {formatTicker(record.ticker)}
                        </span>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDate(String(record.date))}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-mono text-xs text-cyan-300">
                          {formatScore(record.anomaly_score)}
                        </span>
                        <Badge className={severityStyles(severity)}>{severity}</Badge>
                      </div>
                    </div>
                    {types.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {types.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500"
                          >
                            {t.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                      <span>Return {formatPercent(record.daily_return)}</span>
                      <span>Vol Z {formatNumber(record.volume_zscore_30d, 2)}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-white/5 pt-3">
          <Link
            href="/anomalies"
            className="text-xs font-medium text-cyan-400/90 hover:text-cyan-300"
          >
            View all events →
          </Link>
        </div>
      </div>
    </Card>
  );
}
