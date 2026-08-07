"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DetectorBenchmarkTable } from "@/components/dashboard/DetectorBenchmarkTable";
import { useValidationData } from "@/hooks/useValidationData";
import { METRIC_CELL, SECTION_LABEL } from "@/lib/cardVisuals";
import { TYPE_DATA_ACCENT, TYPE_LABEL } from "@/lib/typography";
import {
  CHART_ACCENT,
  chartAxisLine,
  chartAxisTick,
  chartGridStroke,
  chartTooltipContentStyle,
} from "@/lib/chartTheme";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className={`${METRIC_CELL} px-4 py-3`}>
      <p className={TYPE_LABEL}>{label}</p>
      <p className={`mt-1 font-data text-lg ${TYPE_DATA_ACCENT}`}>{value}</p>
      {hint && (
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function ValidationPage() {
  const {
    loading,
    error,
    protocol,
    detectors,
    walkForward,
    attribution,
    drivers,
    regime,
    refresh,
  } = useValidationData();

  if (loading) return <LoadingState message="Loading validation protocol…" />;
  if (error) return <ErrorState message={error} onRetry={() => void refresh()} />;

  const friedman = protocol?.friedman;
  const walk = protocol?.walk_forward;
  const alerts = protocol?.alerts;

  const topAttribution = attribution.slice(0, 8);
  const maxAttribution = Math.max(
    ...topAttribution.map((f) => f.mean_abs_shap_flagged),
    0,
  );

  return (
    <div className="dashboard-page-content flex w-full max-w-none flex-col gap-4 2xl:gap-5">
      <Card
        title="The Evaluation Criterion"
        subtitle="What the detectors were scored against, and why it counts as external"
      >
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          A day is labelled material when the <em>next</em> session shows an abnormal
          return larger than {protocol?.stress_multiple ?? 4}× the issuer&apos;s trailing
          63-session abnormal-return volatility. Every feature uses information up to{" "}
          <em>t</em>; the label uses only information from <em>t+1</em> onward, so no
          model could have fitted it.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Base rate"
            value={
              protocol?.base_rate !== undefined
                ? `${(protocol.base_rate * 100).toFixed(2)}%`
                : "—"
            }
            hint="How often the criterion fires at random"
          />
          <Stat
            label="Evaluation window"
            value={
              protocol?.test_window
                ? `${protocol.test_window[0].slice(0, 4)}–${protocol.test_window[1].slice(0, 4)}`
                : "—"
            }
            hint="Held out from fitting entirely"
          />
          <Stat
            label="Alerts raised"
            value={alerts?.total ? alerts.total.toLocaleString() : "—"}
            hint={
              alerts?.per_year ? `≈${alerts.per_year} a year for the book` : undefined
            }
          />
          <Stat
            label="Near a filing"
            value={
              alerts?.share_in_disclosure_window_pct
                ? `${alerts.share_in_disclosure_window_pct}%`
                : "—"
            }
            hint="Alerts inside a two-session disclosure window"
          />
        </div>
      </Card>

      <DetectorBenchmarkTable
        detectors={detectors}
        baseRate={protocol?.base_rate}
      />

      <div className="grid w-full grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <Card
          title="Are the Differences Real?"
          subtitle="Friedman across issuer-year blocks, then Wilcoxon with Holm correction"
        >
          {friedman ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="Friedman χ²"
                  value={friedman.statistic?.toFixed(1) ?? "—"}
                  hint={
                    friedman.p_value !== undefined
                      ? `p = ${friedman.p_value.toExponential(1)}`
                      : undefined
                  }
                />
                <Stat
                  label="Blocks compared"
                  value={String(friedman.blocks ?? "—")}
                  hint="Issuer-year pairs with both classes present"
                />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                The test rejects identical performance. But of{" "}
                {friedman.total_pairs ?? "—"} pairwise comparisons, only{" "}
                {friedman.significant_pairs_after_holm ?? 0} survive the Holm correction —
                and{" "}
                <strong className="text-[var(--text-primary)]">
                  none of the {friedman.pairs_involving_best ?? 0} involving the selected
                  score
                </strong>
                . In ordering terms nothing measurably outranks it; the separation comes
                from precision at the budget, not from rank.
              </p>
            </>
          ) : (
            <p className="empty-state-hint">Significance testing unavailable.</p>
          )}
        </Card>

        <Card
          title="Walk-Forward Stability"
          subtitle="Refitted annually, scored only on the year it had not seen"
        >
          {walkForward.length > 0 ? (
            <>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={walkForward}
                    margin={{ top: 8, right: 8, bottom: 4, left: -12 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartGridStroke}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      tick={chartAxisTick}
                      axisLine={chartAxisLine}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0.4, 1]}
                      tick={chartAxisTick}
                      axisLine={chartAxisLine}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={chartTooltipContentStyle}
                      formatter={(value) => [Number(value).toFixed(3), "ROC-AUC"]}
                    />
                    <ReferenceLine
                      y={0.5}
                      stroke="var(--text-muted)"
                      strokeDasharray="4 3"
                      label={{
                        value: "chance",
                        position: "insideTopLeft",
                        fill: "var(--text-muted)",
                        fontSize: 10,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="roc_auc"
                      stroke={CHART_ACCENT}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CHART_ACCENT }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {walk && (
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Mean {walk.mean_roc_auc?.toFixed(3)} across{" "}
                  {walk.years?.length ?? walkForward.length} years, ranging{" "}
                  {walk.min_roc_auc?.toFixed(3)}–{walk.max_roc_auc?.toFixed(3)}. No year
                  fell below chance. Each year is scored by a model that never saw it,
                  which is the closest this study gets to live operation.
                </p>
              )}
            </>
          ) : (
            <p className="empty-state-hint">Walk-forward results unavailable.</p>
          )}
        </Card>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <Card
          title="What Drives an Alert"
          subtitle="Mean absolute SHAP contribution on flagged days"
        >
          {topAttribution.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {topAttribution.map((feature) => (
                <li key={feature.feature}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-data text-xs text-[var(--text-secondary)]">
                      {feature.feature}
                    </span>
                    <span className={`font-data text-xs ${TYPE_DATA_ACCENT}`}>
                      {feature.mean_abs_shap_flagged.toFixed(3)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${maxAttribution > 0 ? (feature.mean_abs_shap_flagged / maxAttribution) * 100 : 0}%`,
                        background:
                          "linear-gradient(90deg, #00D4FF 0%, #0066FF 100%)",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state-hint">Attribution unavailable.</p>
          )}

          {drivers.length > 0 && (
            <div className={`${METRIC_CELL} mt-4 px-4 py-3`}>
              <p className={SECTION_LABEL}>Dominant driver among flagged days</p>
              <ul className="mt-2 flex flex-col gap-1">
                {drivers.map((driver) => (
                  <li
                    key={driver.driver}
                    className="flex justify-between text-xs text-[var(--text-secondary)]"
                  >
                    <span>{driver.driver}</span>
                    <span className="font-data">{driver.share_pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card
          title="Behaviour Under Stress"
          subtitle="Alert rate during the COVID shock versus the calm period"
        >
          {regime.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[380px] text-left text-sm">
                  <thead>
                    <tr>
                      <th className="table-head-cell pb-3 pr-4 pt-1">Detector</th>
                      <th className="table-head-cell pb-3 pr-4 pt-1">
                        COVID / calm
                      </th>
                      <th className="table-head-cell pb-3 pt-1">Calm rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...regime]
                      .sort(
                        (a, b) =>
                          (a.stress_multiple ?? 0) - (b.stress_multiple ?? 0),
                      )
                      .map((row) => {
                        const selected = row.model === "Escore condicional";
                        return (
                          <tr
                            key={row.model}
                            className="border-t border-[var(--border-subtle)]"
                          >
                            <td
                              className={`py-2 pr-4 ${
                                selected
                                  ? "font-medium text-[var(--accent-cyan)]"
                                  : "text-[var(--text-secondary)]"
                              }`}
                            >
                              {row.model}
                            </td>
                            <td
                              className={`py-2 pr-4 font-data ${selected ? TYPE_DATA_ACCENT : ""}`}
                            >
                              {row.stress_multiple != null
                                ? `${row.stress_multiple.toFixed(1)}×`
                                : "—"}
                            </td>
                            <td className="py-2 font-data text-[var(--text-secondary)]">
                              {row.calm_pct != null
                                ? `${row.calm_pct.toFixed(2)}%`
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
                The conditional score does not flood in a crisis: its 21-session
                denominator rises with volatility, so the score self-normalises. That is a
                genuine trade-off rather than a win — the rule is robust to a change of
                regime precisely because it is blind to it.
              </p>
            </>
          ) : (
            <p className="empty-state-hint">Regime behaviour unavailable.</p>
          )}
        </Card>
      </div>

      <Card title="Limits" subtitle="Stated because omitting them would misrepresent the evidence">
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-[var(--text-secondary)]">
          <li>
            The criterion rewards anticipating <em>movement</em>, which volatility
            clustering makes partly predictable. A genuinely material day that did not
            move the price counts here as a false positive.
          </li>
          <li>
            An unusual configuration without a price reaction is invisible to the label,
            which specifically under-credits the multivariate detectors.
          </li>
          <li>
            The universe is {protocol?.universe?.length ?? 10} large-cap US technology
            issuers on one exchange calendar. Nothing here extrapolates without refitting.
          </li>
          <li>
            Any figure depends on the horizon. The same models on the same data move from
            0.74 to 0.54 ROC-AUC as the horizon widens from one session to ten.
          </li>
        </ul>
      </Card>
    </div>
  );
}
