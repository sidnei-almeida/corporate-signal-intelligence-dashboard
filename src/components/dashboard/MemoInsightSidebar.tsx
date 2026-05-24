"use client";

import type { ReactNode } from "react";
import { Eye, ShieldAlert, Table2 } from "lucide-react";
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
      <div className="mb-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
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
    <aside className="flex flex-col gap-5 border-t border-white/5 pt-5 xl:border-t-0 xl:border-l xl:pl-6 xl:pt-0">
      <InsightSection
        title="Risk Interpretation"
        icon={<ShieldAlert className="h-3.5 w-3.5 text-rose-400/80" />}
      >
        <p className="text-sm leading-relaxed text-slate-400">{riskText}</p>
      </InsightSection>

      <InsightSection
        title="Recommended Monitoring"
        icon={<Eye className="h-3.5 w-3.5 text-cyan-400/80" />}
        className="border-t border-white/5 pt-5"
      >
        <ul className="space-y-2">
          {monitoring.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm leading-snug text-slate-400 before:mt-1.5 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-cyan-500/60 before:content-['']"
            >
              {item}
            </li>
          ))}
        </ul>
      </InsightSection>

      <InsightSection
        title="Evidence Snapshot"
        icon={<Table2 className="h-3.5 w-3.5 text-slate-400" />}
        className="border-t border-white/5 pt-5"
      >
        <dl className="space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-slate-500">Score</dt>
            <dd className="font-mono text-slate-200">
              {formatScore(record.anomaly_score)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-slate-500">Return</dt>
            <dd className="text-slate-200">{formatPercent(record.daily_return)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-slate-500">Vol Z</dt>
            <dd className="font-mono text-slate-200">{volZ}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-slate-500">Filings</dt>
            <dd className="font-mono text-slate-200">{filings}</dd>
          </div>
        </dl>
      </InsightSection>
    </aside>
  );
}
