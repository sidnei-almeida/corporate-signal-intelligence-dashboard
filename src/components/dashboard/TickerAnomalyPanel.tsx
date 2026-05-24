import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AnomalyRecord } from "@/lib/types";
import {
  anomalyRecordsMatch,
  formatDate,
  formatPercent,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  primaryAnomalyType,
  severityStyles,
  toFiniteNumber,
} from "@/lib/formatters";

interface TickerAnomalyPanelProps {
  ticker: string;
  records: AnomalyRecord[];
  selectedRecord: AnomalyRecord | null;
  onSelect: (record: AnomalyRecord) => void;
  loading?: boolean;
}

export function TickerAnomalyPanel({
  ticker,
  records,
  selectedRecord,
  onSelect,
  loading,
}: TickerAnomalyPanelProps) {
  const sorted = [...records]
    .filter((r) => r.is_anomaly !== false)
    .sort(
      (a, b) =>
        (toFiniteNumber(a.anomaly_score) ?? 0) -
        (toFiniteNumber(b.anomaly_score) ?? 0),
    )
    .slice(0, 12);

  return (
    <Card
      title={`${formatTicker(ticker)} Anomalies`}
      subtitle="Select a date for executive briefing generation"
    >
      {loading && (
        <p className="text-sm text-slate-500">Loading ticker anomalies…</p>
      )}
      {!loading && sorted.length === 0 && (
        <p className="text-sm text-slate-500">No anomaly records for this ticker.</p>
      )}
      {!loading && sorted.length > 0 && (
        <ul className="flex flex-col gap-2">
          {sorted.map((record) => {
            const isSelected = anomalyRecordsMatch(record, selectedRecord);
            const severity = getAnomalySeverity(record.anomaly_score);

            return (
              <li key={`${record.ticker}-${record.date}`}>
                <button
                  type="button"
                  onClick={() => onSelect(record)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-cyan-500/40 bg-cyan-500/10"
                      : "border-white/5 bg-zinc-900/40 hover:border-white/10 hover:bg-zinc-900/70"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-100">
                      {formatDate(String(record.date))}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-300">
                        {formatScore(record.anomaly_score)}
                      </span>
                      <Badge className={severityStyles(severity)}>{severity}</Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {primaryAnomalyType(record.anomaly_type).replace(/_/g, " ")} ·{" "}
                    {formatPercent(record.daily_return)} return
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
