"use client";

import type { ReactNode } from "react";
import { IconEye, IconShield, IconTable } from "@/components/icons";
import {
  CARD_DIVIDER,
  SECTION_LABEL,
  SECTION_VALUE,
  metricValueClass,
} from "@/lib/cardVisuals";
import { TYPE_DATA_ACCENT } from "@/lib/typography";
import type { AnomalyRecord } from "@/lib/types";
import {
  formatNumber,
  formatPercent,
  formatScore,
  getAnomalySeverity,
} from "@/lib/formatters";

interface MemoInsightSidebarProps {
  record: AnomalyRecord;
}

function InsightSection({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className={`mb-2.5 flex items-center gap-2 ${SECTION_LABEL}`}>
        {icon}
        {title}
      </div>
      {children}
    </section>
  );
}

export function MemoInsightSidebar({ record }: MemoInsightSidebarProps) {
  const severity = getAnomalySeverity(record.anomaly_score);
  const filings = formatNumber(record.filing_count_30d, 0);
  const volZ = formatNumber(record.volume_zscore_30d, 2);
  const scoreClass = metricValueClass(severity);

  const riskText =
    severity === "Critical"
      ? "Composite anomaly score indicates a high-priority deviation from recent issuer behavior. Treat as an immediate monitoring event."
      : severity === "High"
        ? "Elevated signal strength warrants close review of market, filing, and financial drivers over the next several sessions."
        : "Moderate deviation detected. Continue monitoring for persistence or escalation in related signal types.";

  const monitoring = [
    "Price and volume follow-through over the next 5 sessions",
    filings !== "—" && Number(record.filing_count_30d) >= 2
      ? "SEC filing cadence and 8-K disclosures"
      : null,
    "Peer-relative return and volatility drift",
    "Upcoming earnings and guidance commentary",
  ].filter(Boolean) as string[];

  return (
    <aside
      className={`flex flex-col gap-5 border-t pt-5 xl:border-t-0 xl:border-l xl:pl-6 xl:pt-0 ${CARD_DIVIDER}`}
    >
      <InsightSection
        title="Risk Interpretation"
        icon={<IconShield size={14} className="text-[#FF4560]" />}
      >
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{riskText}</p>
      </InsightSection>

      <InsightSection
        title="Recommended Monitoring"
        icon={<IconEye size={14} className="text-[#00D4FF]" />}
        className={`border-t pt-5 ${CARD_DIVIDER}`}
      >
        <ul className="space-y-2">
          {monitoring.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm leading-snug text-[var(--text-secondary)] before:mt-1.5 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-[rgba(0,212,255,0.15)] before:content-['']"
            >
              {item}
            </li>
          ))}
        </ul>
      </InsightSection>

      <InsightSection
        title="Evidence Snapshot"
        icon={<IconTable size={14} className="text-[var(--text-muted)]" />}
        className={`border-t pt-5 ${CARD_DIVIDER}`}
      >
        <dl className="space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className={SECTION_LABEL}>Score</dt>
            <dd className={scoreClass}>{formatScore(record.anomaly_score)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className={SECTION_LABEL}>Return</dt>
            <dd className={SECTION_VALUE}>{formatPercent(record.daily_return)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className={SECTION_LABEL}>Vol Z</dt>
            <dd className={TYPE_DATA_ACCENT}>{volZ}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className={SECTION_LABEL}>Filings</dt>
            <dd className={SECTION_VALUE}>{filings}</dd>
          </div>
        </dl>
      </InsightSection>
    </aside>
  );
}
