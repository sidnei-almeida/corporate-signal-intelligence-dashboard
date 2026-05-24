import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AnomalyRecord, AnomalySummary, CompanyProfile } from "@/lib/types";
import {
  formatAnomalyRate,
  formatDate,
  formatScore,
  formatTicker,
  getCompanyRiskRank,
  getRiskTier,
  primaryAnomalyType,
  riskTierStyles,
  toFiniteNumber,
} from "@/lib/formatters";

interface CompanyProfileCardProps {
  profile: CompanyProfile | null;
  summaries: AnomalySummary[];
  tickerAnomalies?: AnomalyRecord[];
  loading?: boolean;
  fillHeight?: boolean;
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-zinc-900/50 px-3 py-2.5">
      <dt className="text-xs uppercase tracking-wider text-slate-500">{label}</dt>
      <dd
        className={`mt-1 text-sm ${highlight ? "font-semibold text-cyan-300" : "text-slate-100"}`}
      >
        {value}
      </dd>
    </div>
  );
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
        <p className="text-sm text-slate-500">Loading company profile…</p>
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
        <p className="text-sm text-slate-500">
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

  return (
    <Card
      title="Company Intelligence Profile"
      subtitle={`${formatTicker(profile.ticker)} · monitored issuer`}
      fillHeight={fillHeight}
      className={fillHeight ? "h-full w-full" : "w-full"}
    >
      <div className={`flex flex-col gap-4 ${fillHeight ? "min-h-0 flex-1" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-semibold text-slate-50">
            {formatTicker(profile.ticker)}
          </span>
          <Badge className={riskTierStyles(tier)}>{tier} risk</Badge>
          <span className="text-lg font-semibold text-cyan-300">
            {formatAnomalyRate(profile.anomaly_rate)}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <Metric label="Observations" value={profile.row_count.toLocaleString()} />
          <Metric label="Anomalies" value={String(profile.anomaly_count)} />
          <Metric
            label="Risk rank"
            value={
              rank
                ? `#${rank} of ${summaries.length}`
                : `— of ${summaries.length}`
            }
            highlight
          />
          <Metric label="Min score" value={formatScore(minScore)} highlight />
          <Metric
            label="Latest anomaly"
            value={
              profile.latest_anomaly
                ? formatDate(String(profile.latest_anomaly.date))
                : "—"
            }
          />
          <Metric
            label="Most severe"
            value={
              mostSevereDate
                ? formatDate(String(mostSevereDate.date))
                : formatScore(minScore)
            }
          />
        </dl>

        <div className="rounded-lg border border-white/5 bg-zinc-900/40 px-3 py-2.5 text-xs text-slate-400">
          <span className="font-medium text-slate-500">Coverage: </span>
          {formatDate(profile.first_date)} — {formatDate(profile.last_date)}
        </div>

        {profile.latest_anomaly && (
          <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Latest signal
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-200">
                {formatDate(String(profile.latest_anomaly.date))}
              </span>
              <span className="font-mono text-sm text-cyan-300">
                {formatScore(profile.latest_anomaly.anomaly_score)}
              </span>
              <Badge className="border-white/10 bg-zinc-800 text-slate-300 normal-case">
                {primaryAnomalyType(
                  String(profile.latest_anomaly.anomaly_type),
                ).replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        )}

        <p
          className={`text-xs leading-relaxed text-slate-600 ${
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
