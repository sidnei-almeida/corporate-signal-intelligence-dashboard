import { Card } from "@/components/ui/Card";
import { MetricCell } from "@/components/ui/MetricCell";
import { RiskTierIndicator } from "@/components/ui/RiskTierIndicator";
import { AnomalyTypeTags } from "@/components/ui/AnomalyTypeTags";
import { METRIC_CELL, SECTION_LABEL, metricValueClass } from "@/lib/cardVisuals";
import { TYPE_DATA_ACCENT, TYPE_TICKER } from "@/lib/typography";
import type { AnomalyRecord, AnomalySummary, CompanyProfile } from "@/lib/types";
import {
  formatAnomalyRate,
  formatDate,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  getCompanyRiskRank,
  getRiskTier,
  splitAnomalyTypes,
  toFiniteNumber,
} from "@/lib/formatters";

interface CompanyProfileCardProps {
  profile: CompanyProfile | null;
  summaries: AnomalySummary[];
  tickerAnomalies?: AnomalyRecord[];
  loading?: boolean;
  fillHeight?: boolean;
}

export function CompanyProfileCard({
  profile,
  summaries,
  tickerAnomalies = [],
  loading,
  fillHeight = false,
}: CompanyProfileCardProps) {
  if (loading) {
    return (
      <Card
        title="Company Intelligence Profile"
        subtitle="Issuer risk and anomaly statistics"
        className="w-full"
      >
        <p className="text-sm text-[var(--text-muted)]">Loading company profile…</p>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card
        title="Company Intelligence Profile"
        subtitle="Select a ticker to load issuer intelligence"
        className="w-full"
      >
        <p className="text-sm text-[var(--text-muted)]">
          Choose a monitored company to view risk profile, ranking, and signal
          history.
        </p>
      </Card>
    );
  }

  const tier = getRiskTier(profile.anomaly_rate);
  const rank = getCompanyRiskRank(summaries, profile.ticker);
  const summaryRow = summaries.find(
    (s) => formatTicker(s.ticker) === formatTicker(profile.ticker),
  );
  const minScore =
    summaryRow?.min_score ??
    tickerAnomalies.reduce<AnomalyRecord | null>((best, r) => {
      const score = toFiniteNumber(r.anomaly_score);
      const bestScore = best ? toFiniteNumber(best.anomaly_score) : undefined;
      if (score === undefined) return best;
      if (bestScore === undefined) return r;
      return score < bestScore ? r : best;
    }, null)?.anomaly_score;

  const mostSevereDate = tickerAnomalies.length
    ? [...tickerAnomalies]
        .filter((r) => r.is_anomaly !== false)
        .sort(
          (a, b) =>
            (toFiniteNumber(a.anomaly_score) ?? 0) -
            (toFiniteNumber(b.anomaly_score) ?? 0),
        )[0]
    : null;

  const latestSeverity = profile.latest_anomaly
    ? getAnomalySeverity(profile.latest_anomaly.anomaly_score)
    : null;

  return (
    <Card
      title="Company Intelligence Profile"
      subtitle={`${formatTicker(profile.ticker)} · monitored issuer`}
      fillHeight={fillHeight}
      className={fillHeight ? "h-full w-full" : "w-full"}
    >
      <div className={`flex flex-col gap-4 ${fillHeight ? "min-h-0 flex-1" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${TYPE_TICKER} text-xl`}>
            {formatTicker(profile.ticker)}
          </span>
          <RiskTierIndicator tier={tier} suffix="risk" />
          <span className={`text-lg ${TYPE_DATA_ACCENT}`}>
            {formatAnomalyRate(profile.anomaly_rate)}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <MetricCell
            label="Observations"
            value={profile.row_count.toLocaleString()}
          />
          <MetricCell label="Anomalies" value={String(profile.anomaly_count)} />
          <MetricCell
            label="Risk rank"
            value={
              rank
                ? `#${rank} of ${summaries.length}`
                : `— of ${summaries.length}`
            }
            highlight
          />
          <MetricCell label="Min score" value={formatScore(minScore)} highlight />
          <MetricCell
            label="Latest anomaly"
            value={
              profile.latest_anomaly
                ? formatDate(String(profile.latest_anomaly.date))
                : "—"
            }
          />
          <MetricCell
            label="Most severe"
            value={
              mostSevereDate
                ? formatDate(String(mostSevereDate.date))
                : formatScore(minScore)
            }
          />
        </dl>

        <div className={`${METRIC_CELL} px-3 py-2.5 text-xs text-[var(--text-secondary)]`}>
          <span className={SECTION_LABEL}>Coverage: </span>
          {formatDate(profile.first_date)} — {formatDate(profile.last_date)}
        </div>

        {profile.latest_anomaly && (
          <div className={`${METRIC_CELL} px-3 py-3`}>
            <p className={SECTION_LABEL}>Latest signal</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-[var(--text-primary)]">
                {formatDate(String(profile.latest_anomaly.date))}
              </span>
              <span
                className={`text-sm ${metricValueClass(latestSeverity)}`}
              >
                {formatScore(profile.latest_anomaly.anomaly_score)}
              </span>
              <AnomalyTypeTags
                types={splitAnomalyTypes(String(profile.latest_anomaly.anomaly_type))}
              />
            </div>
          </div>
        )}

        <p
          className={`text-xs leading-relaxed text-[var(--text-muted)] ${
            fillHeight ? "mt-auto" : ""
          }`}
        >
          Lower anomaly score indicates stronger deviation from normal historical
          behavior.
        </p>
      </div>
    </Card>
  );
}
