import { MousePointerClick } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AnomalyRecord } from "@/lib/types";
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  severityStyles,
  splitAnomalyTypes,
  toFiniteNumber,
} from "@/lib/formatters";

interface SelectedAnomalyDetailsProps {
  record: AnomalyRecord | null;
  fillHeight?: boolean;
}

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-zinc-900/40 px-3 py-2.5">
      <dt className="text-xs uppercase tracking-wider text-slate-500">{label}</dt>
      <dd
        className={`mt-1 text-sm text-slate-100 ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
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
          className={`flex flex-col items-center justify-center text-center ${
            fillHeight ? "min-h-[280px] flex-1 md:min-h-[320px] 2xl:min-h-[360px]" : "py-12"
          }`}
        >
          <div className="mb-4 rounded-full border border-white/10 bg-zinc-900/60 p-3">
            <MousePointerClick className="h-6 w-6 text-cyan-500/60" />
          </div>
          <p className="text-base font-medium text-slate-200">No anomaly selected</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Select an event from the table below to inspect signal context.
          </p>
          <p className="mt-4 text-xs text-slate-600">
            Click any anomaly row to populate this panel.
          </p>
        </div>
      </Card>
    );
  }

  const severity = getAnomalySeverity(record.anomaly_score);
  const types = splitAnomalyTypes(String(record.anomaly_type ?? ""));
  const contextLines = buildSignalContext(record);

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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold text-slate-50">
            {formatTicker(record.ticker)}
          </span>
          <span className="text-sm text-slate-400">
            {formatDate(String(record.date))}
          </span>
          <Badge className={severityStyles(severity)}>{severity}</Badge>
          <span className="font-mono text-sm text-cyan-300">
            {formatScore(record.anomaly_score)}
          </span>
        </div>

        {types.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <Badge
                key={t}
                className="border-white/10 bg-zinc-900 text-slate-300 normal-case"
              >
                {t.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        )}

        <div className={fillHeight ? "min-h-0 flex-1" : ""}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Signal metrics
          </p>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <DetailItem label="Daily Return" value={formatPercent(record.daily_return)} />
            <DetailItem
              label="Volume Z (30d)"
              value={formatNumber(record.volume_zscore_30d, 2)}
              mono
            />
            <DetailItem
              label="Return Z (30d)"
              value={formatNumber(record.return_zscore_30d, 2)}
              mono
            />
            <DetailItem
              label="Volatility (30d)"
              value={formatNumber(record.volatility_30d, 4)}
              mono
            />
            <DetailItem
              label="Filings (30d)"
              value={formatNumber(record.filing_count_30d, 0)}
              mono
            />
            <DetailItem
              label="8-K (30d)"
              value={formatNumber(record.form_8k_count_30d, 0)}
              mono
            />
            <DetailItem
              label="Revenue QoQ"
              value={formatPercent(record.revenue_growth_qoq)}
            />
            <DetailItem label="Net Margin" value={formatPercent(record.net_margin)} />
            <DetailItem
              label="Operating Margin"
              value={formatPercent(record.operating_margin)}
            />
          </dl>
        </div>

        <div
          className={`rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-3 ${
            fillHeight ? "mt-auto shrink-0" : ""
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-500/80">
            Signal context
          </p>
          <ul className="mt-2 space-y-1.5">
            {contextLines.map((line) => (
              <li key={line} className="text-sm leading-relaxed text-slate-400">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
