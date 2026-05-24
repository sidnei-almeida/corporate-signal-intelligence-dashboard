import { Card } from "@/components/ui/Card";
import type { AnomalySummary } from "@/lib/types";
import {
  formatAnomalyRate,
  formatScore,
  formatTicker,
  getRiskTier,
  riskTierStyles,
  toFiniteNumber,
} from "@/lib/formatters";
import { Badge } from "@/components/ui/Badge";

interface MonitoredUniverseRankingProps {
  summaries: AnomalySummary[];
  highlightTicker?: string;
}

export function MonitoredUniverseRanking({
  summaries,
  highlightTicker,
}: MonitoredUniverseRankingProps) {
  const sorted = [...summaries].sort(
    (a, b) =>
      (toFiniteNumber(b.anomaly_rate) ?? 0) -
      (toFiniteNumber(a.anomaly_rate) ?? 0),
  );

  return (
    <Card
      title="Monitored Universe Ranking"
      subtitle="All companies sorted by anomaly rate"
      className="w-full"
    >
      <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5 2xl:-mx-6 2xl:px-6">
        <table className="w-full min-w-[720px] text-left text-xs 2xl:text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-3 font-semibold">Rank</th>
              <th className="pb-2 pr-3 font-semibold">Ticker</th>
              <th className="pb-2 pr-3 font-semibold">Tier</th>
              <th className="pb-2 pr-3 font-semibold">Rate</th>
              <th className="pb-2 pr-3 font-semibold">Anomalies</th>
              <th className="pb-2 pr-3 font-semibold">Min</th>
              <th className="pb-2 pr-3 font-semibold">Avg</th>
              <th className="pb-2 font-semibold">Max</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, index) => {
              const isHighlighted =
                highlightTicker &&
                formatTicker(row.ticker) === formatTicker(highlightTicker);
              const tier = getRiskTier(row.anomaly_rate);

              return (
                <tr
                  key={row.ticker}
                  className={`border-b border-white/5 text-slate-300 ${
                    isHighlighted ? "bg-cyan-500/10" : ""
                  }`}
                >
                  <td className="py-2 pr-3 tabular-nums text-slate-500">
                    {index + 1}
                  </td>
                  <td className="py-2 pr-3 font-medium text-slate-100">
                    {formatTicker(row.ticker)}
                  </td>
                  <td className="py-2 pr-3">
                    <Badge className={riskTierStyles(tier)}>{tier}</Badge>
                  </td>
                  <td className="py-2 pr-3 text-cyan-300">
                    {formatAnomalyRate(row.anomaly_rate)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">{row.anomalies}</td>
                  <td className="py-2 pr-3 font-mono">{formatScore(row.min_score)}</td>
                  <td className="py-2 pr-3 font-mono">{formatScore(row.avg_score)}</td>
                  <td className="py-2 font-mono">{formatScore(row.max_score)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
