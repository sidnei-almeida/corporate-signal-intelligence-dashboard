"use client";

import { Card } from "@/components/ui/Card";
import { TYPE_DATA_ACCENT } from "@/lib/typography";
import type { DetectorMetric } from "@/lib/types";

const SELECTED = "Escore condicional";

/**
 * The benchmark, as measured.
 *
 * Ten detectors under one protocol: the same temporal split, the same robust scaling and
 * the same alert budget. Two columns say different things and are shown side by side on
 * purpose — ROC-AUC scores the whole ordering, precision at the budget scores only the
 * top of it, and the top is the only part an analyst ever reads.
 */
export function DetectorBenchmarkTable({
  detectors,
  baseRate,
}: {
  detectors: DetectorMetric[];
  baseRate?: number;
}) {
  if (detectors.length === 0) {
    return (
      <Card title="Detector Benchmark" subtitle="Unavailable">
        <p className="empty-state-hint">
          Run the evaluation notebook to publish the benchmark.
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Detector Benchmark"
      subtitle="Ten detectors, one protocol, scored against the prospective criterion"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr>
              <th className="table-head-cell pb-3 pr-4 pt-1">Detector</th>
              <th className="table-head-cell pb-3 pr-4 pt-1">ROC-AUC</th>
              <th className="table-head-cell pb-3 pr-4 pt-1">95% CI</th>
              <th className="table-head-cell pb-3 pr-4 pt-1">Precision @1%</th>
              <th className="table-head-cell pb-3 pr-4 pt-1">Gain</th>
              <th className="table-head-cell pb-3 pt-1">Avg rank</th>
            </tr>
          </thead>
          <tbody>
            {detectors.map((row) => {
              const selected = row.model === SELECTED;
              return (
                <tr
                  key={row.model}
                  className={
                    selected
                      ? "border-t border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--accent-cyan)_7%,transparent)]"
                      : "border-t border-[var(--border-subtle)]"
                  }
                >
                  <td className="py-2.5 pr-4">
                    <span
                      className={
                        selected
                          ? "font-medium text-[var(--accent-cyan)]"
                          : "text-[var(--text-secondary)]"
                      }
                    >
                      {row.model}
                    </span>
                    {selected && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                        ships
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 font-data">{row.roc_auc.toFixed(3)}</td>
                  <td className="py-2.5 pr-4 font-data text-xs text-[var(--text-muted)]">
                    {row.ci_low != null && row.ci_high != null
                      ? `${row.ci_low.toFixed(3)}–${row.ci_high.toFixed(3)}`
                      : "—"}
                  </td>
                  <td
                    className={`py-2.5 pr-4 font-data ${selected ? TYPE_DATA_ACCENT : ""}`}
                  >
                    {(row.precision_at_budget * 100).toFixed(1)}%
                  </td>
                  <td
                    className={`py-2.5 pr-4 font-data ${selected ? TYPE_DATA_ACCENT : ""}`}
                  >
                    {row.precision_lift.toFixed(2)}×
                  </td>
                  <td className="py-2.5 font-data text-[var(--text-secondary)]">
                    {row.average_rank != null ? row.average_rank.toFixed(2) : "—"}
                  </td>
                </tr>
              );
            })}
            {baseRate !== undefined && (
              <tr className="border-t border-[var(--border-subtle)]">
                <td className="py-2.5 pr-4 text-xs italic text-[var(--text-muted)]">
                  Base rate of the criterion
                </td>
                <td className="py-2.5 pr-4">—</td>
                <td className="py-2.5 pr-4">—</td>
                <td className="py-2.5 pr-4 font-data text-xs text-[var(--text-muted)]">
                  {(baseRate * 100).toFixed(2)}%
                </td>
                <td className="py-2.5 pr-4 font-data text-xs text-[var(--text-muted)]">
                  1.00×
                </td>
                <td className="py-2.5">—</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
        ROC-AUC evaluates the whole ordering; precision at the budget evaluates only the
        first percentile, which is the part that becomes work. A detector can order the
        set well and still populate the top of it badly.
      </p>
    </Card>
  );
}
