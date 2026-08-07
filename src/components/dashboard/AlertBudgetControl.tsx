"use client";

import { METRIC_CELL, SECTION_LABEL } from "@/lib/cardVisuals";
import { TYPE_DATA_ACCENT, TYPE_LABEL } from "@/lib/typography";
import { formatScore } from "@/lib/formatters";
import type { AlertBudget } from "@/lib/types";

const BUDGET_STOPS = [0.25, 0.5, 1, 2, 5] as const;

interface AlertBudgetControlProps {
  budgetPct: number;
  budget: AlertBudget | null;
  onChange: (budgetPct: number) => void;
  disabled?: boolean;
}

/**
 * The operating control of the tool.
 *
 * Analyst attention is the scarce resource, so the budget — the share of issuer-days
 * allowed to raise an alert — is what the desk actually sets. The score threshold is
 * derived from it. Because the score is self-normalising against each issuer's own
 * trailing volatility, the same budget holds its meaning across calm and stressed
 * regimes rather than flooding the queue in a crisis.
 */
export function AlertBudgetControl({
  budgetPct,
  budget,
  onChange,
  disabled = false,
}: AlertBudgetControlProps) {
  return (
    <div className={`${METRIC_CELL} flex flex-col gap-3 px-4 py-3.5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={SECTION_LABEL}>Alert budget</p>
        <p className="text-[11px] text-[var(--text-muted)]">
          Share of issuer-days allowed to alert
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Alert budget">
        {BUDGET_STOPS.map((stop) => {
          const active = Math.abs(stop - budgetPct) < 1e-9;
          return (
            <button
              key={stop}
              type="button"
              disabled={disabled}
              onClick={() => onChange(stop)}
              aria-pressed={active}
              className={`rounded-md border px-2.5 py-1 font-data text-xs transition-colors disabled:opacity-50 ${
                active
                  ? "border-[var(--accent-cyan)] bg-[color-mix(in_srgb,var(--accent-cyan)_12%,transparent)] text-[var(--accent-cyan)]"
                  : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-cyan)]"
              }`}
            >
              {stop}%
            </button>
          );
        })}
      </div>

      <dl className="grid grid-cols-3 gap-3 border-t border-[var(--border-subtle)] pt-3">
        <div>
          <dt className={TYPE_LABEL}>Threshold</dt>
          <dd className={`mt-0.5 font-data text-sm ${TYPE_DATA_ACCENT}`}>
            {budget?.threshold != null ? `${formatScore(budget.threshold)}σ` : "—"}
          </dd>
        </div>
        <div>
          <dt className={TYPE_LABEL}>Alerts</dt>
          <dd className="mt-0.5 font-data text-sm text-[var(--text-primary)]">
            {budget ? budget.alerts.toLocaleString() : "—"}
          </dd>
        </div>
        <div>
          <dt className={TYPE_LABEL}>Per year</dt>
          <dd className="mt-0.5 font-data text-sm text-[var(--text-primary)]">
            {budget?.alerts_per_year != null ? `≈${budget.alerts_per_year}` : "—"}
          </dd>
        </div>
      </dl>

      <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
        Tightening the budget raises the threshold; it does not change the ranking. A
        flagged day is a candidate for review, not a finding.
      </p>
    </div>
  );
}
