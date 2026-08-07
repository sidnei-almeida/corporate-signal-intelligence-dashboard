import type { DashboardIconComponent } from "@/components/icons";
import {
  IconKpiAnomalies,
  IconKpiModel,
  IconKpiRate,
  IconKpiRisk,
  IconKpiUniverse,
} from "@/components/icons";
import type {
  AlertBudget,
  AnomalySummary,
  Company,
  HealthResponse,
  ValidationProtocol,
} from "@/lib/types";
import { formatAnomalyRate } from "@/lib/formatters";
import { CARD_SHELL } from "@/lib/cardVisuals";
import { TYPE_LABEL, TYPE_METRIC } from "@/lib/typography";

interface ExecutiveOverviewProps {
  companies: Company[];
  summaries: AnomalySummary[];
  health: HealthResponse | null;
  protocol?: ValidationProtocol | null;
  budget?: AlertBudget | null;
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
    <div className={`stat-card kpi-card metric-card ${CARD_SHELL} h-full p-4 sm:p-5 2xl:p-6`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`card-label ${TYPE_LABEL}`}>{label}</p>
        <Icon className="card-icon icon-premium" size={17} />
      </div>
      <p className={`card-value ${TYPE_METRIC} mt-3`}>{value}</p>
      {hint && (
        <p className="card-sub mt-1 font-display text-[11px] font-normal text-[var(--text-secondary)] 2xl:text-xs">
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
  protocol,
  budget,
}: ExecutiveOverviewProps) {
  const monitored = companies.length;
  const totalAlerts = summaries.reduce((acc, s) => acc + s.anomalies, 0);

  // The headline is what the queue buys over inspecting at random. Every other number
  // here is context for it.
  const precision = protocol?.primary_score?.precision_at_budget;
  const lift = protocol?.primary_score?.precision_lift_over_base_rate;
  const baseRate = protocol?.base_rate;
  const perYear = budget?.alerts_per_year ?? protocol?.alerts?.per_year;

  return (
    <section
      className="stat-cards-row metrics-row kpi-row grid w-full max-w-none grid-cols-5 gap-4"
      data-component="stat-cards"
    >
      <KpiCard
        label="Precision Gain"
        value={lift !== undefined && lift !== null ? `${lift.toFixed(1)}×` : "—"}
        hint={
          precision !== undefined && baseRate !== undefined
            ? `${formatAnomalyRate(precision)} hit rate vs ${formatAnomalyRate(baseRate)} at random`
            : "Versus random inspection"
        }
        icon={IconKpiRate}
      />
      <KpiCard
        label="Alert Budget"
        value={budget ? `${budget.budget_pct}%` : "1%"}
        hint={
          perYear
            ? `≈${perYear} alerts a year across the book`
            : "Share of issuer-days that may alert"
        }
        icon={IconKpiRisk}
      />
      <KpiCard
        label="Alerts Raised"
        value={totalAlerts.toLocaleString()}
        hint={
          protocol?.test_window
            ? `Since ${protocol.test_window[0].slice(0, 4)}`
            : "Flagged issuer-days"
        }
        icon={IconKpiAnomalies}
      />
      <KpiCard
        label="Monitored Issuers"
        value={String(monitored)}
        hint="Alert rate is issuer-relative, so these do not rank"
        icon={IconKpiUniverse}
      />
      <KpiCard
        label="Pipeline"
        value={health?.status === "ok" ? "Online" : "Offline"}
        hint={health?.data_source ? `Data: ${health.data_source}` : undefined}
        icon={IconKpiModel}
      />
    </section>
  );
}
