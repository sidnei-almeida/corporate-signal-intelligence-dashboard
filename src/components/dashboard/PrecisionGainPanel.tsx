"use client";

import { Card } from "@/components/ui/Card";
import { METRIC_CELL, SECTION_LABEL } from "@/lib/cardVisuals";
import { CHART_ACCENT, CHART_GRAPHITE } from "@/lib/chartTheme";
import { TYPE_DATA_ACCENT } from "@/lib/typography";
import type { ValidationProtocol } from "@/lib/types";

interface PrecisionGainPanelProps {
  protocol: ValidationProtocol | null;
  fillHeight?: boolean;
}

function Bar({
  label,
  value,
  max,
  accent,
  caption,
}: {
  label: string;
  value: number;
  max: number;
  accent: boolean;
  caption: string;
}) {
  const width = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
        <span
          className={`font-data text-sm ${accent ? TYPE_DATA_ACCENT : "text-[var(--text-secondary)]"}`}
        >
          {(value * 100).toFixed(1)}%
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            // Same two colours the bar charts use: the warm accent carries the subject of
            // the comparison, graphite carries everything measured against it.
            background: accent ? CHART_ACCENT : CHART_GRAPHITE,
          }}
        />
      </div>
      <p className="mt-1 text-[11px] text-[var(--text-muted)]">{caption}</p>
    </div>
  );
}

/**
 * The headline claim, stated as the comparison that produced it.
 *
 * Precision at the alert budget against the base rate of the prospective criterion. The
 * criterion uses only information from after the scoring date, so this is a measurement
 * rather than a fit statistic.
 */
export function PrecisionGainPanel({
  protocol,
  fillHeight = false,
}: PrecisionGainPanelProps) {
  const precision = protocol?.primary_score?.precision_at_budget ?? undefined;
  const baseRate = protocol?.base_rate ?? undefined;
  const lift = protocol?.primary_score?.precision_lift_over_base_rate ?? undefined;
  const calm = protocol?.primary_score?.precision_at_budget_calm_market ?? undefined;

  if (precision === undefined || baseRate === undefined) {
    return (
      <Card
        title="Precision Against the Criterion"
        subtitle="Validation artifacts unavailable"
        fillHeight={fillHeight}
        className={fillHeight ? "h-full w-full" : "w-full"}
      >
        <p className="empty-state-hint">
          Run the evaluation notebook to publish the validation artifacts.
        </p>
      </Card>
    );
  }

  const max = Math.max(precision, baseRate, calm ?? 0);

  return (
    <Card
      title="Precision Against the Criterion"
      subtitle="Days followed by a material move, at the 1% alert budget"
      fillHeight={fillHeight}
      className={fillHeight ? "h-full w-full" : "w-full"}
    >
      <div
        className={`flex flex-col gap-4 ${
          fillHeight ? "min-h-0 flex-1 justify-between" : ""
        }`}
      >
        <div className="flex flex-col gap-3.5">
          <Bar
            label="Model queue"
            value={precision}
            max={max}
            accent
            caption="Share of alerts followed by an abnormal move next session"
          />
          {calm !== undefined && (
            <Bar
              label="Model queue · calm markets"
              value={calm}
              max={max}
              accent
              caption="Restricted to the quietest 80% of sessions, where triage is hardest"
            />
          )}
          <Bar
            label="Random inspection"
            value={baseRate}
            max={max}
            accent={false}
            caption="Base rate of the criterion over the same window"
          />
        </div>

        <div className={`${METRIC_CELL} px-4 py-3`}>
          <p className={SECTION_LABEL}>What this buys</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
            {lift !== undefined ? (
              <>
                An analyst reaches the same set of material days by examining about{" "}
                <span className={TYPE_DATA_ACCENT}>one {ordinal(lift)}</span> of the
                volume — a {lift.toFixed(1)}× gain over inspecting at random.
              </>
            ) : (
              "The queue concentrates material days at the top of the list."
            )}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
            The criterion is built only from information after the scoring date: no model
            could have fitted it. It rewards anticipating movement, not direction.
          </p>
        </div>
      </div>
    </Card>
  );
}

function ordinal(lift: number): string {
  const n = Math.round(lift);
  const names: Record<number, string> = {
    2: "half",
    3: "third",
    4: "quarter",
    5: "fifth",
    6: "sixth",
    7: "seventh",
    8: "eighth",
    9: "ninth",
    10: "tenth",
  };
  return names[n] ?? `${n}th`;
}
