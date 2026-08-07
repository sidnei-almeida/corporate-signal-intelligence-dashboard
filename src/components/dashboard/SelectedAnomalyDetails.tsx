import { CompanyIdentity } from "@/components/company-icons";
import { IconPointer } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { MetricCell } from "@/components/ui/MetricCell";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { AnomalyTypeTags } from "@/components/ui/AnomalyTypeTags";
import { METRIC_CELL, SECTION_LABEL, metricValueClass } from "@/lib/cardVisuals";
import type { AnomalyRecord } from "@/lib/types";
import {
  DEVIATION_FIELDS,
  dominantDeviation,
  formatDate,
  formatNumber,
  formatPercent,
  formatScore,
  formatSigma,
  hasDisclosure,
  severityOf,
  splitAnomalyTypes,
  toFiniteNumber,
} from "@/lib/formatters";

interface SelectedAnomalyDetailsProps {
  record: AnomalyRecord | null;
  fillHeight?: boolean;
}

function buildSignalContext(record: AnomalyRecord): string[] {
  const lines: string[] = [];

  // The score *is* the largest deviation, so the reason needs no inference.
  const driver = dominantDeviation(record);
  if (driver) {
    lines.push(
      `Flagged on ${driver.label.toLowerCase()}: ${formatSigma(driver.value)} against this issuer's own trailing 21 sessions.`,
    );
  }

  if (hasDisclosure(record)) {
    const forms = [
      (toFiniteNumber(record.filed_8k_2d) ?? 0) > 0 ? "8-K" : null,
      (toFiniteNumber(record.filed_10q_2d) ?? 0) > 0 ? "10-Q" : null,
      (toFiniteNumber(record.filed_10k_2d) ?? 0) > 0 ? "10-K" : null,
    ].filter(Boolean);
    lines.push(
      `A ${forms.join(" and ")} landed within the two-session reaction window — co-occurrence, not established cause.`,
    );
  } else {
    const market = toFiniteNumber(record.market_return);
    if (market !== undefined && Math.abs(market) >= 0.02) {
      lines.push(
        "The market moved broadly the same session; check whether this is issuer-specific.",
      );
    }
  }

  return lines.slice(0, 2);
}

export function SelectedAnomalyDetails({
  record,
  fillHeight = false,
}: SelectedAnomalyDetailsProps) {
  if (!record) {
    return (
      <Card
        title="Selected Anomaly"
        subtitle="Signal context for the active investigation"
        fillHeight={fillHeight}
        className={`selected-event event-context ${fillHeight ? "h-full w-full" : "w-full"}`}
      >
        <div
          className={`empty-state ${
            fillHeight ? "min-h-[280px] flex-1 md:min-h-[320px] 2xl:min-h-[360px]" : ""
          }`}
        >
          <div className="empty-state-icon">
            <IconPointer size={20} className="opacity-70" />
          </div>
          <p className="empty-state-title">No anomaly selected</p>
          <p className="empty-state-hint">
            Select an event from the table below to inspect signal context.
          </p>
        </div>
      </Card>
    );
  }

  const severity = severityOf(record);
  const types = splitAnomalyTypes(String(record.anomaly_type ?? ""));
  const contextLines = buildSignalContext(record);
  const scoreClass = metricValueClass(severity);
  const driver = dominantDeviation(record);

  return (
    <Card
      title="Selected Anomaly"
      subtitle="Full signal context for investigation"
      fillHeight={fillHeight}
      className={`selected-event event-context ${fillHeight ? "h-full w-full" : "w-full"}`}
    >
      <div
        className={`flex flex-col gap-5 ${fillHeight ? "min-h-0 flex-1" : ""}`}
      >
        <CompanyIdentity
          ticker={String(record.ticker)}
          meta={formatDate(String(record.date))}
          className="event-header event-row"
          trailing={
            <>
              <SeverityIndicator
                severity={severity}
                compact
                className="event-severity severity-badge"
              />
              <span className={`score-value score-block text-sm ${scoreClass}`}>
                {formatScore(record.anomaly_score)}
              </span>
            </>
          }
        />

        {types.length > 0 && (
          <div className="event-tags signal-tags">
            <AnomalyTypeTags types={types} />
          </div>
        )}

        <div className={fillHeight ? "min-h-0 flex-1" : ""}>
          <p className={`${SECTION_LABEL} mb-2`}>
            Conditional deviations · 21 sessions
          </p>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEVIATION_FIELDS.map(([field, label]) => (
              <MetricCell
                key={field}
                label={
                  driver?.field === field ? `${label} · drove score` : label
                }
                value={formatSigma(record[field] as never)}
                mono
              />
            ))}
          </dl>

          <p className={`${SECTION_LABEL} mb-2 mt-4`}>Session context</p>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MetricCell label="Log Return" value={formatPercent(record.log_return)} />
            <MetricCell
              label="Realised Vol (21d)"
              value={formatNumber(record.realised_volatility_21d, 4)}
              mono
            />
            <MetricCell
              label="Market Return"
              value={formatPercent(record.market_return)}
            />
            <MetricCell
              label="Idiosyncratic Z"
              value={formatNumber(record.idiosyncratic_zscore, 2)}
              mono
            />
            <MetricCell
              label="Filing in ±2d"
              value={hasDisclosure(record) ? "Yes" : "No"}
              mono
            />
            <MetricCell
              label="Days Since 8-K"
              value={formatNumber(record.days_since_8k, 0)}
              mono
            />
          </dl>
        </div>

        <div
          className={`${METRIC_CELL} px-4 py-3 ${
            fillHeight ? "mt-auto shrink-0" : ""
          }`}
        >
          <p className={SECTION_LABEL}>Signal context</p>
          <ul className="mt-2 space-y-1.5">
            {contextLines.map((line) => (
              <li key={line} className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
