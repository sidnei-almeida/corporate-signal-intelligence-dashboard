"use client";

import { IconPointer, IconSparkline } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetricCell } from "@/components/ui/MetricCell";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { AnomalyTypeTags } from "@/components/ui/AnomalyTypeTags";
import {
  CARD_DIVIDER,
  METRIC_CELL,
  SECTION_LABEL,
  SECTION_VALUE,
  metricValueClass,
} from "@/lib/cardVisuals";
import { TYPE_TICKER } from "@/lib/typography";
import type { AnomalyRecord, AnomalySeverity, Company } from "@/lib/types";
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatScore,
  formatTicker,
  getAnomalySeverity,
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

function SignalStrengthRow({ label, value }: { label: string; value: string }) {
  const severityValues: AnomalySeverity[] = ["Critical", "High", "Medium", "Low"];
  const isCompositeRisk = label === "Composite Risk";
  const showSeverity =
    isCompositeRisk && severityValues.includes(value as AnomalySeverity);

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className={SECTION_LABEL}>{label}</span>
      {showSeverity ? (
        <SeverityIndicator severity={value as AnomalySeverity} />
      ) : (
        <span className={SECTION_VALUE}>{value}</span>
      )}
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
    <div className={`border-t pt-4 ${CARD_DIVIDER}`}>
      <p className={`mb-2 ${SECTION_LABEL}`}>Signal Strength</p>
      <div className={`divide-y ${CARD_DIVIDER}`}>
        {rows.map((row) => (
          <SignalStrengthRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

function BriefingContextSection() {
  return (
    <div className={`border-t pt-4 ${CARD_DIVIDER}`}>
      <p className={`mb-2 ${SECTION_LABEL}`}>AI Briefing Context</p>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        This selected anomaly will be used as structured context for the AI executive
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
    <div
      className={`shrink-0 flex flex-wrap items-center justify-between gap-3 border-t pt-4 ${CARD_DIVIDER}`}
    >
      <p className="text-xs text-[var(--text-muted)]">Uses selected event context</p>
      <Button
        variant="primary"
        loading={loading}
        disabled={loading}
        onClick={onGenerate}
        className="shrink-0 text-sm"
      >
        <IconSparkline size={16} />
        {loading ? "Generating AI briefing…" : "Generate AI Briefing"}
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
  const scoreClass = metricValueClass(severity);

  return (
    <Card
      title="Selected Event Context"
      fillHeight
      className="h-full w-full max-h-[calc(53vh-100px)] overflow-hidden"
    >
      {!hasSelection && (
        <div className="empty-state h-full min-h-[140px]">
          <div className="empty-state-icon">
            <IconPointer size={18} />
          </div>
          <p className="empty-state-title">No anomaly selected</p>
          <p className="empty-state-hint">
            Select an event from the queue to prepare an AI briefing.
          </p>
        </div>
      )}

      {hasSelection && selectedRecord && (
        <div className="flex h-full min-h-0 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center text-sm font-medium text-[var(--text-primary)] ${METRIC_CELL}`}
                >
                  {ticker.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`${TYPE_TICKER} text-lg tracking-tight`}>
                      {ticker}
                    </p>
                    {severity && <SeverityIndicator severity={severity} />}
                  </div>
                  <p className="truncate text-sm text-[var(--text-muted)]">{companyName}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                    {formatDate(String(selectedRecord.date))}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={SECTION_LABEL}>Anomaly Score</p>
                <p className={`text-xl ${scoreClass}`}>
                  {formatScore(selectedRecord.anomaly_score)}
                </p>
              </div>
            </div>

            {types.length > 0 && (
              <div className={`border-t pt-3 ${CARD_DIVIDER}`}>
                <AnomalyTypeTags types={types} />
              </div>
            )}

            <div className={`border-t pt-4 ${CARD_DIVIDER}`}>
              <p className={`mb-3 ${SECTION_LABEL}`}>Signal Metrics</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {METRICS.map((spec) => (
                  <MetricCell
                    key={spec.label}
                    label={spec.label}
                    value={metricValue(selectedRecord, spec)}
                    mono={spec.mono}
                    className="px-2 py-1.5"
                  />
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
