import { CompanyTickerCell } from "@/components/company-icons";
import { Card } from "@/components/ui/Card";
import { RiskTierIndicator } from "@/components/ui/RiskTierIndicator";
import { CARD_DIVIDER } from "@/lib/cardVisuals";
import { TYPE_DATA_ACCENT } from "@/lib/typography";
import type { AnomalySummary } from "@/lib/types";
import {
  formatAnomalyRate,
  formatScore,
  formatTicker,
  getRiskTier,
  toFiniteNumber,
} from "@/lib/formatters";

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
            <tr className={`border-b ${CARD_DIVIDER}`}>
              <th className="table-head-cell pb-2 pr-3 text-left">Rank</th>
              <th className="table-head-cell pb-2 pr-3 text-left">Ticker</th>
              <th className="table-head-cell pb-2 pr-3 text-left">Tier</th>
              <th className="table-head-cell pb-2 pr-3 text-left">Rate</th>
              <th className="table-head-cell pb-2 pr-3 text-left">Anomalies</th>
              <th className="table-head-cell pb-2 pr-3 text-left">Min</th>
              <th className="table-head-cell pb-2 pr-3 text-left">Avg</th>
              <th className="table-head-cell pb-2 text-left">Max</th>
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
                  className={`border-b text-[var(--text-secondary)] ${CARD_DIVIDER} ${
                    isHighlighted ? "row-selected" : ""
                  }`}
                >
                  <td className="py-2 pr-3 font-data text-[var(--text-muted)]">
                    {index + 1}
                  </td>
                  <td className="py-2 pr-3">
                    <CompanyTickerCell ticker={row.ticker} />
                  </td>
                  <td className="py-2 pr-3">
                    <RiskTierIndicator tier={tier} compact />
                  </td>
                  <td className={`py-2 pr-3 ${TYPE_DATA_ACCENT}`}>
                    {formatAnomalyRate(row.anomaly_rate)}
                  </td>
                  <td className="py-2 pr-3 font-data">{row.anomalies}</td>
                  <td className="py-2 pr-3 font-data">{formatScore(row.min_score)}</td>
                  <td className="py-2 pr-3 font-data">{formatScore(row.avg_score)}</td>
                  <td className="py-2 font-data">{formatScore(row.max_score)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
