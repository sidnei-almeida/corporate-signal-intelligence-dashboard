import {
  AlertTriangle,
  Building2,
  Percent,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import type { AnomalySummary, Company, HealthResponse } from "@/lib/types";
import {
  formatAnomalyRate,
  formatTicker,
  toFiniteNumber,
} from "@/lib/formatters";

interface ExecutiveOverviewProps {
  companies: Company[];
  summaries: AnomalySummary[];
  health: HealthResponse | null;
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-zinc-950/90 p-4 sm:p-5 2xl:p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 2xl:text-xs">
          {label}
        </p>
        <Icon className="h-4 w-4 shrink-0 text-cyan-500/60 2xl:h-5 2xl:w-5" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-50 2xl:text-3xl">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-slate-500 2xl:text-sm">{hint}</p>
      )}
    </div>
  );
}

export function ExecutiveOverview({
  companies,
  summaries,
  health,
}: ExecutiveOverviewProps) {
  const monitored = companies.length;
  const totalAnomalies = summaries.reduce((acc, s) => acc + s.anomalies, 0);
  const avgRate =
    summaries.length > 0
      ? summaries.reduce(
          (acc, s) => acc + (toFiniteNumber(s.anomaly_rate) ?? 0),
          0,
        ) / summaries.length
      : 0;

  const highestRisk = [...summaries].sort(
    (a, b) =>
      (toFiniteNumber(b.anomaly_rate) ?? 0) -
      (toFiniteNumber(a.anomaly_rate) ?? 0),
  )[0];

  return (
    <section className="grid w-full max-w-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard
        label="Monitored Companies"
        value={String(monitored)}
        hint="Public issuers in watchlist"
        icon={Building2}
      />
      <KpiCard
        label="Total Anomalies"
        value={totalAnomalies.toLocaleString()}
        hint="Flagged issuer-period events"
        icon={AlertTriangle}
      />
      <KpiCard
        label="Avg Anomaly Rate"
        value={formatAnomalyRate(avgRate)}
        hint="Across monitored universe"
        icon={Percent}
      />
      <KpiCard
        label="Highest Risk Ticker"
        value={highestRisk ? formatTicker(highestRisk.ticker) : "—"}
        hint={
          highestRisk
            ? `${formatAnomalyRate(highestRisk.anomaly_rate)} anomaly rate`
            : undefined
        }
        icon={TrendingDown}
      />
      <KpiCard
        label="Model Availability"
        value={health?.model_available ? "Online" : "Offline"}
        hint={health?.data_source ? `Data: ${health.data_source}` : undefined}
        icon={AlertTriangle}
      />
    </section>
  );
}
