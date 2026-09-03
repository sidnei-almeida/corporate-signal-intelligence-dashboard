"use client";

import { Select } from "@/components/ui/Select";
import { ANOMALY_TYPE_LABELS } from "@/lib/constants";
import type { AnomalySeverity } from "@/lib/types";
import { SEVERITY_LABELS, formatTicker } from "@/lib/formatters";

interface AnomalyFiltersProps {
  tickers: string[];
  ticker: string;
  severity: string;
  anomalyType: string;
  onTickerChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onAnomalyTypeChange: (value: string) => void;
}

// "below budget" belongs here: the tiers stop at the 1% cutoff, so any budget wider
// than that admits rows beneath the watch line, and without this option they cannot be
// selected at all.
const SEVERITIES: AnomalySeverity[] = [
  "critical",
  "high",
  "moderate",
  "watch",
  "below budget",
];

export function AnomalyFilters({
  tickers,
  ticker,
  severity,
  anomalyType,
  onTickerChange,
  onSeverityChange,
  onAnomalyTypeChange,
}: AnomalyFiltersProps) {
  return (
    <div className="filter-row filters grid grid-cols-3 gap-3" data-component="filter">
      <Select
        label="Ticker"
        value={ticker}
        onChange={(e) => onTickerChange(e.target.value)}
      >
        <option value="">All tickers</option>
        {tickers.map((t) => (
          <option key={t} value={t}>
            {formatTicker(t)}
          </option>
        ))}
      </Select>
      <Select
        label="Severity"
        value={severity}
        onChange={(e) => onSeverityChange(e.target.value)}
      >
        <option value="">All severities</option>
        {SEVERITIES.map((s) => (
          <option key={s} value={s}>
            {SEVERITY_LABELS[s]}
          </option>
        ))}
      </Select>
      <Select
        label="Anomaly type"
        value={anomalyType}
        onChange={(e) => onAnomalyTypeChange(e.target.value)}
      >
        <option value="">All types</option>
        {Object.entries(ANOMALY_TYPE_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
}
