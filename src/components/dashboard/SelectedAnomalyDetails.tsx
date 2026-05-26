import { CompanyIdentity } from "@/components/company-icons";
import { IconPointer } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { MetricCell } from "@/components/ui/MetricCell";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { AnomalyTypeTags } from "@/components/ui/AnomalyTypeTags";
import { METRIC_CELL, SECTION_LABEL, metricValueClass } from "@/lib/cardVisuals";
import type { AnomalyRecord } from "@/lib/types";
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatScore,
  getAnomalySeverity,
  splitAnomalyTypes,
  toFiniteNumber,
} from "@/lib/formatters";

interface SelectedAnomalyDetailsProps {
  record: AnomalyRecord | null;
  fillHeight?: boolean;
}

function buildSignalContext(record: AnomalyRecord): string[] {
  const lines: string[] = [];
  const types = splitAnomalyTypes(String(record.anomaly_type ?? ""));

  if (types.length > 1) {
    const labels = types.map((t) => t.replace(/_/g, " ")).join(", ");
    lines.push(
      `This event combines multiple signal types: ${labels}.`,
    );
  } else if (types.length === 1) {
    lines.push(
      `Primary signal classification: ${types[0].replace(/_/g, " ")}.`,
    );
  }

  const volZ = toFiniteNumber(record.volume_zscore_30d);
  const retZ = toFiniteNumber(record.return_zscore_30d);
  const filings = toFiniteNumber(record.filing_count_30d);

  if (volZ !== undefined && Math.abs(volZ) >= 2) {
    lines.push("Elevated volume relative to the 30-day historical baseline.");
  }
  if (retZ !== undefined && Math.abs(retZ) >= 2) {
    lines.push("Return movement is statistically unusual versus recent history.");
  }
  if (filings !== undefined && filings >= 2) {
    lines.push("SEC filing activity is elevated in the surrounding window.");
  }

  lines.push(
    "Lower anomaly score indicates stronger deviation from normal issuer behavior.",
  );

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
        className={fillHeight ? "h-full w-full" : "w-full"}
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

  const severity = getAnomalySeverity(record.anomaly_score);
  const types = splitAnomalyTypes(String(record.anomaly_type ?? ""));
  const contextLines = buildSignalContext(record);
  const scoreClass = metricValueClass(severity);

  return (
    <Card
      title="Selected Anomaly"
      subtitle="Full signal context for investigation"
      fillHeight={fillHeight}
      className={fillHeight ? "h-full w-full" : "w-full"}
    >
      <div
        className={`flex flex-col gap-5 ${fillHeight ? "min-h-0 flex-1" : ""}`}
      >
        <CompanyIdentity
          ticker={String(record.ticker)}
          meta={formatDate(String(record.date))}
          trailing={
            <>
              <SeverityIndicator severity={severity} compact />
              <span className={`text-sm ${scoreClass}`}>
                {formatScore(record.anomaly_score)}
              </span>
            </>
          }
        />

        {types.length > 0 && <AnomalyTypeTags types={types} />}

        <div className={fillHeight ? "min-h-0 flex-1" : ""}>
          <p className={`${SECTION_LABEL} mb-2`}>Signal metrics</p>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MetricCell label="Daily Return" value={formatPercent(record.daily_return)} />
            <MetricCell
              label="Volume Z (30d)"
              value={formatNumber(record.volume_zscore_30d, 2)}
              mono
            />
            <MetricCell
              label="Return Z (30d)"
              value={formatNumber(record.return_zscore_30d, 2)}
              mono
            />
            <MetricCell
              label="Volatility (30d)"
              value={formatNumber(record.volatility_30d, 4)}
              mono
            />
            <MetricCell
              label="Filings (30d)"
              value={formatNumber(record.filing_count_30d, 0)}
              mono
            />
            <MetricCell
              label="8-K (30d)"
              value={formatNumber(record.form_8k_count_30d, 0)}
              mono
            />
            <MetricCell
              label="Revenue QoQ"
              value={formatPercent(record.revenue_growth_qoq)}
            />
            <MetricCell label="Net Margin" value={formatPercent(record.net_margin)} />
            <MetricCell
              label="Operating Margin"
              value={formatPercent(record.operating_margin)}
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
