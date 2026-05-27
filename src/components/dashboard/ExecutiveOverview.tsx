import type { DashboardIconComponent } from "@/components/icons";
import {
  IconKpiAnomalies,
  IconKpiModel,
  IconKpiRate,
  IconKpiRisk,
  IconKpiUniverse,
} from "@/components/icons";
import type { AnomalySummary, Company, HealthResponse } from "@/lib/types";
import {
  formatAnomalyRate,
  formatTicker,
  toFiniteNumber,
} from "@/lib/formatters";
import { CARD_SHELL } from "@/lib/cardVisuals";
import { TYPE_LABEL, TYPE_METRIC } from "@/lib/typography";

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
  icon: DashboardIconComponent;
}) {
  return (
    <div className={`kpi-card ${CARD_SHELL} h-full p-4 sm:p-5 2xl:p-6`}>
      <div className="flex items-center justify-between gap-2">
        <p className={TYPE_LABEL}>{label}</p>
        <Icon className="icon-premium" size={17} />
      </div>
      <p className={`${TYPE_METRIC} mt-3`}>{value}</p>
      {hint && (
        <p className="mt-1 font-display text-[11px] font-normal text-[var(--text-secondary)] 2xl:text-xs">
          {hint}
        </p>
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
    <section className="grid w-full max-w-none grid-cols-5 gap-4">
      <KpiCard
        label="Monitored Companies"
        value={String(monitored)}
        hint="Public issuers in watchlist"
        icon={IconKpiUniverse}
      />
      <KpiCard
        label="Total Anomalies"
        value={totalAnomalies.toLocaleString()}
        hint="Flagged issuer-period events"
        icon={IconKpiAnomalies}
      />
      <KpiCard
        label="Avg Anomaly Rate"
        value={formatAnomalyRate(avgRate)}
        hint="Across monitored universe"
        icon={IconKpiRate}
      />
      <KpiCard
        label="Highest Risk Ticker"
        value={highestRisk ? formatTicker(highestRisk.ticker) : "—"}
        hint={
          highestRisk
            ? `${formatAnomalyRate(highestRisk.anomaly_rate)} anomaly rate`
            : undefined
        }
        icon={IconKpiRisk}
      />
      <KpiCard
        label="Model Availability"
        value={health?.model_available ? "Online" : "Offline"}
        hint={health?.data_source ? `Data: ${health.data_source}` : undefined}
        icon={IconKpiModel}
      />
    </section>
  );
}
