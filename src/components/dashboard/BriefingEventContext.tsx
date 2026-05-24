"use client";

import { MousePointerClick, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AnomalyRecord, AnomalySeverity, Company } from "@/lib/types";
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

interface BriefingEventContextProps {
  selectedRecord: AnomalyRecord | null;
  companies: Company[];
  loading: boolean;
  onGenerate: () => void;
}

const METRICS: {
  key: keyof AnomalyRecord;
  label: string;
  mono?: boolean;
  percent?: boolean;
  decimals?: number;
}[] = [
  { key: "daily_return", label: "Daily Return", percent: true },
  { key: "volume_zscore_30d", label: "Volume Z", mono: true, decimals: 2 },
  { key: "return_zscore_30d", label: "Return Z", mono: true, decimals: 2 },
  { key: "volatility_30d", label: "Volatility 30D", mono: true, decimals: 4 },
  { key: "filing_count_30d", label: "Filings 30D", mono: true, decimals: 0 },
  { key: "form_8k_count_30d", label: "8-K Filings 30D", mono: true, decimals: 0 },
  { key: "revenue_growth_qoq", label: "Revenue QoQ", percent: true },
  { key: "net_margin", label: "Net Margin", percent: true },
  { key: "operating_margin", label: "Operating Margin", percent: true },
];

type SignalStrength = {
  marketReaction: "Strong" | "Moderate" | "Low";
  volumeSignal: "Elevated" | "Normal";
  filingActivity: "Elevated" | "Minimal";
  financialShift: "Positive" | "Negative" | "Neutral";
  compositeRisk: AnomalySeverity;
};

function metricValue(
  record: AnomalyRecord,
  spec: (typeof METRICS)[number],
): string {
  const raw = record[spec.key];
  if (spec.percent) return formatPercent(raw as string | number | null | undefined);
  return formatNumber(raw as string | number | null | undefined, spec.decimals ?? 2);
}

function deriveSignalStrength(record: AnomalyRecord): SignalStrength {
  const dailyReturn = toFiniteNumber(record.daily_return);
  const returnZ = toFiniteNumber(record.return_zscore_30d);
  const volumeZ = toFiniteNumber(record.volume_zscore_30d);
  const filings = toFiniteNumber(record.filing_count_30d);
  const revenueGrowth = toFiniteNumber(record.revenue_growth_qoq);
  const netMargin = toFiniteNumber(record.net_margin);

  const absReturn = dailyReturn !== undefined ? Math.abs(dailyReturn) : 0;
  const absReturnZ = returnZ !== undefined ? Math.abs(returnZ) : 0;

  let marketReaction: SignalStrength["marketReaction"] = "Low";
  if (absReturn >= 0.05 || absReturnZ >= 2) {
    marketReaction = "Strong";
  } else if (absReturn >= 0.02 || absReturnZ >= 1) {
    marketReaction = "Moderate";
  }

  const volumeSignal: SignalStrength["volumeSignal"] =
    volumeZ !== undefined && Math.abs(volumeZ) >= 2 ? "Elevated" : "Normal";

  const filingActivity: SignalStrength["filingActivity"] =
    filings !== undefined && filings >= 2 ? "Elevated" : "Minimal";

  let financialShift: SignalStrength["financialShift"] = "Neutral";
  if (revenueGrowth !== undefined && netMargin !== undefined) {
    if (revenueGrowth > 0 && netMargin > 0) {
      financialShift = "Positive";
    } else if (revenueGrowth < 0 || netMargin < 0) {
      financialShift = "Negative";
    }
  } else if (revenueGrowth !== undefined) {
    financialShift = revenueGrowth > 0 ? "Positive" : revenueGrowth < 0 ? "Negative" : "Neutral";
  } else if (netMargin !== undefined) {
    financialShift = netMargin > 0 ? "Positive" : netMargin < 0 ? "Negative" : "Neutral";
  }

  return {
    marketReaction,
    volumeSignal,
    filingActivity,
    financialShift,
    compositeRisk: getAnomalySeverity(record.anomaly_score),
  };
}

function strengthChipClass(kind: "positive" | "negative" | "neutral" | "elevated" | "risk"): string {
  switch (kind) {
    case "positive":
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20";
    case "negative":
      return "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20";
    case "elevated":
      return "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20";
    case "risk":
      return "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20";
    default:
      return "bg-white/[0.04] text-slate-400 ring-1 ring-white/10";
  }
}

function chipKindForStrength(
  label: string,
  value: string,
): "positive" | "negative" | "neutral" | "elevated" | "risk" {
  if (label === "Composite Risk") {
    if (value === "Critical" || value === "High") return "negative";
    if (value === "Medium") return "elevated";
    return "neutral";
  }
  if (value === "Strong" || value === "Elevated" || value === "Positive") return "positive";
  if (value === "Negative" || value === "Critical") return "negative";
  if (value === "Moderate" || value === "High") return "elevated";
  return "neutral";
}

function SignalStrengthRow({ label, value }: { label: string; value: string }) {
  const kind = chipKindForStrength(label, value);
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${strengthChipClass(kind)}`}
      >
        {value}
      </span>
    </div>
  );
}

function SignalStrengthSection({ record }: { record: AnomalyRecord }) {
  const strength = deriveSignalStrength(record);
  const rows: { label: string; value: string }[] = [
    { label: "Market Reaction", value: strength.marketReaction },
    { label: "Volume Signal", value: strength.volumeSignal },
    { label: "Filing Activity", value: strength.filingActivity },
    { label: "Financial Shift", value: strength.financialShift },
    { label: "Composite Risk", value: strength.compositeRisk },
  ];

  return (
    <div className="border-t border-white/5 pt-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Signal Strength
      </p>
      <div className="divide-y divide-white/[0.04]">
        {rows.map((row) => (
          <SignalStrengthRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

function BriefingContextSection() {
  return (
    <div className="border-t border-white/5 pt-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Briefing Context
      </p>
      <p className="text-sm leading-relaxed text-slate-400">
        This selected anomaly will be used as structured context for the executive
        memo. The briefing will summarize market behavior, filing activity, financial
        signals, risk interpretation, and monitoring actions.
      </p>
    </div>
  );
}

function BottomActionRow({
  loading,
  onGenerate,
}: {
  loading: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
      <p className="text-xs text-slate-500">Uses selected event context</p>
      <Button
        variant="primary"
        loading={loading}
        disabled={loading}
        onClick={onGenerate}
        className="shrink-0 text-sm"
      >
        <Sparkles className="h-4 w-4" />
        {loading ? "Generating Briefing..." : "Generate Executive Briefing"}
      </Button>
    </div>
  );
}

export function BriefingEventContext({
  selectedRecord,
  companies,
  loading,
  onGenerate,
}: BriefingEventContextProps) {
  const hasSelection = Boolean(selectedRecord?.ticker && selectedRecord?.date);
  const severity = selectedRecord
    ? getAnomalySeverity(selectedRecord.anomaly_score)
    : null;
  const ticker = selectedRecord ? formatTicker(selectedRecord.ticker) : "";
  const company = companies.find((c) => formatTicker(c.ticker) === ticker);
  const companyName = company?.company_name ?? "Issuer profile";
  const types = selectedRecord
    ? splitAnomalyTypes(String(selectedRecord.anomaly_type ?? ""))
    : [];

  return (
    <Card
      title="Selected Event Context"
      fillHeight
      className="h-full w-full max-h-[calc(53vh-100px)] overflow-hidden"
    >
      {!hasSelection && (
        <div className="flex h-full min-h-[140px] flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400/80 ring-1 ring-cyan-500/20">
            <MousePointerClick className="h-5 w-5" />
          </div>
          <p className="text-base font-medium text-slate-200">No anomaly selected</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Select an event from the queue to prepare an executive briefing.
          </p>
        </div>
      )}

      {hasSelection && selectedRecord && (
        <div className="flex h-full min-h-0 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-sm font-bold text-cyan-300 ring-1 ring-cyan-500/20">
                {ticker.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-lg font-semibold tracking-tight text-slate-50">
                    {ticker}
                  </p>
                  {severity && (
                    <Badge className={severityStyles(severity)}>{severity}</Badge>
                  )}
                </div>
                <p className="truncate text-sm text-slate-500">{companyName}</p>
                <p className="mt-0.5 text-sm text-slate-400">
                  {formatDate(String(selectedRecord.date))}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Anomaly Score
              </p>
              <p className="font-mono text-xl text-cyan-300">
                {formatScore(selectedRecord.anomaly_score)}
              </p>
            </div>
          </div>

          {types.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-white/5 pt-3">
              {types.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-white/[0.04] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-400"
                >
                  {t.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-white/5 pt-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Signal Metrics
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              {METRICS.map((spec) => (
                <div key={spec.label}>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    {spec.label}
                  </p>
                  <p
                    className={`mt-0.5 text-sm text-slate-100 ${
                      spec.mono ? "font-mono tabular-nums" : ""
                    }`}
                  >
                    {metricValue(selectedRecord, spec)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <SignalStrengthSection record={selectedRecord} />
          <BriefingContextSection />
          </div>
          <BottomActionRow loading={loading} onGenerate={onGenerate} />
        </div>
      )}
    </Card>
  );
}
