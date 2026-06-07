"use client";

import Link from "next/link";
import { CompanyIcon } from "@/components/company-icons/CompanyIcon";
import type { AnomalyRecord, AnomalySeverity } from "@/lib/types";
import {
  formatAnomalyTypeLabel,
  formatDate,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  primaryAnomalyType,
  splitAnomalyTypes,
} from "@/lib/formatters";

interface MobileAnomalyEventListProps {
  records: AnomalyRecord[];
  onSelect?: (record: AnomalyRecord) => void;
  linkHref?: string;
}

function severityClass(severity: AnomalySeverity): string {
  return severity.toLowerCase();
}

function typeLabelFor(record: AnomalyRecord): string {
  const types = splitAnomalyTypes(String(record.anomaly_type ?? ""));
  return types.length > 0
    ? formatAnomalyTypeLabel(types[0])
    : formatAnomalyTypeLabel(primaryAnomalyType(record.anomaly_type));
}

function MobileEventCard({
  record,
  index,
  onSelect,
  linkHref,
}: {
  record: AnomalyRecord;
  index: number;
  onSelect?: (record: AnomalyRecord) => void;
  linkHref: string;
}) {
  const ticker = formatTicker(record.ticker);
  const severity = getAnomalySeverity(record.anomaly_score);
  const meta = `${formatDate(String(record.date))} · ${typeLabelFor(record)}`;
  const content = (
    <>
      <CompanyIcon ticker={ticker} size={24} className="ticker-logo shrink-0" />
      <div className="event-info min-w-0 flex-1">
        <div className="event-ticker">{ticker}</div>
        <div className="event-meta">{meta}</div>
      </div>
      <div className="event-right shrink-0">
        <div className="event-score">{formatScore(record.anomaly_score)}</div>
        <div className={`event-severity ${severityClass(severity)}`}>
          {severity}
        </div>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className="mob-event-card"
        onClick={() => onSelect(record)}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={linkHref}
      className="mob-event-card"
      key={`${ticker}-${record.date}-${index}`}
    >
      {content}
    </Link>
  );
}

export function MobileAnomalyEventList({
  records,
  onSelect,
  linkHref = "/anomalies",
}: MobileAnomalyEventListProps) {
  if (records.length === 0) return null;

  return (
    <div id="mob-events-list" className="mob-events-list">
      {records.map((record, index) => (
        <MobileEventCard
          key={`${record.ticker}-${record.date}-${index}`}
          record={record}
          index={index}
          onSelect={onSelect}
          linkHref={linkHref}
        />
      ))}
    </div>
  );
}
