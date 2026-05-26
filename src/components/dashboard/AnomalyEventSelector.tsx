"use client";

import Link from "next/link";
import { CompanyTickerCell } from "@/components/company-icons";
import { Card } from "@/components/ui/Card";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { AnomalyTypeTags } from "@/components/ui/AnomalyTypeTags";
import { Select } from "@/components/ui/Select";
import {
  CARD_DIVIDER,
  INLINE_TEXT_TAG,
  metricValueClass,
} from "@/lib/cardVisuals";
import { TYPE_LABEL } from "@/lib/typography";
import type { AnomalyRecord, AnomalySeverity, Company } from "@/lib/types";
import {
  anomalyRecordsMatch,
  formatDate,
  formatNumber,
  formatPercent,
  formatScore,
  formatTicker,
  getAnomalySeverity,
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
          <span className={INLINE_TEXT_TAG}>
            {records.length} events
          </span>
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
          <label className={`mb-1 block ${TYPE_LABEL}`}>
            Search anomaly type
          </label>
          <input
            type="search"
            value={typeSearch}
            onChange={(e) => onTypeSearchChange(e.target.value)}
            placeholder="e.g. filing, volume, revenue"
            className="input-surface w-full rounded-lg px-3 py-2 text-sm placeholder:text-[var(--text-muted)]"
          />
        </div>

        {listLoading && (
          <p className="text-sm text-[var(--text-muted)]">Loading events…</p>
        )}

        {!listLoading && records.length === 0 && (
          <p className="py-6 text-center text-sm text-[var(--text-muted)]">
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
              const scoreClass = metricValueClass(severity);

              return (
                <li key={`${record.ticker}-${record.date}-${index}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(record)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "row-selected border"
                        : "border border-transparent hover:bg-[rgba(255,255,255,0.03)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CompanyTickerCell ticker={String(record.ticker)} />
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                          {formatDate(String(record.date))}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={`text-xs ${scoreClass}`}>
                          {formatScore(record.anomaly_score)}
                        </span>
                        <SeverityIndicator severity={severity} compact />
                      </div>
                    </div>
                    {types.length > 0 && (
                      <div className="mt-2">
                        <AnomalyTypeTags types={types} maxItems={2} />
                      </div>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-[var(--text-muted)]">
                      <span>Return {formatPercent(record.daily_return)}</span>
                      <span>Vol Z {formatNumber(record.volume_zscore_30d, 2)}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className={`border-t pt-3 ${CARD_DIVIDER}`}>
          <Link
            href="/anomalies"
            className="text-xs font-medium link-accent hover:text-[var(--accent-primary)]"
          >
            View all events →
          </Link>
        </div>
      </div>
    </Card>
  );
}
