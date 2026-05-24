"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AnomalyRecord } from "@/lib/types";
import {
  formatDate,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  primaryAnomalyType,
  severityStyles,
  splitAnomalyTypes,
  toFiniteNumber,
} from "@/lib/formatters";

interface TopAnomaliesPreviewProps {
  records: AnomalyRecord[];
  limit?: number;
}

const thClass =
  "pb-3 pt-1 text-left text-xs font-semibold uppercase tracking-wider text-slate-500";
const tdClass =
  "py-2.5 pr-4 text-xs leading-normal text-slate-300 2xl:py-3 2xl:text-sm";

export function TopAnomaliesPreview({
  records,
  limit = 12,
}: TopAnomaliesPreviewProps) {
  const sorted = [...records]
    .sort(
      (a, b) =>
        (toFiniteNumber(a.anomaly_score) ?? 0) -
        (toFiniteNumber(b.anomaly_score) ?? 0),
    )
    .slice(0, limit);

  return (
    <Card
      title="Top 12 Anomaly Events"
      subtitle="Highest-risk signals ranked by anomaly score"
      action={
        <Link
          href="/anomalies"
          className="flex items-center gap-1 text-xs font-medium text-cyan-400 transition hover:text-cyan-300 2xl:text-sm"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
      fillHeight
      className="h-full w-full"
    >
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500">No anomaly events available.</p>
      ) : (
        <div className="-mx-1 flex min-h-0 flex-1 flex-col px-1">
          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm">
                <tr className="border-b border-white/5">
                  <th className={thClass}>Ticker</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Score</th>
                  <th className={thClass}>Severity</th>
                  <th className={thClass}>Type</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((record, index) => {
                  const severity = getAnomalySeverity(record.anomaly_score);
                  const types = splitAnomalyTypes(
                    String(record.anomaly_type ?? ""),
                  );
                  const typeLabel =
                    types.length > 0
                      ? types[0].replace(/_/g, " ")
                      : primaryAnomalyType(record.anomaly_type).replace(
                          /_/g,
                          " ",
                        );

                  return (
                    <tr
                      key={`${record.ticker}-${record.date}-${index}`}
                      className="border-b border-white/5 transition hover:bg-white/[0.02]"
                    >
                      <td className={`${tdClass} font-semibold text-slate-100`}>
                        <Link
                          href="/anomalies"
                          className="block hover:text-cyan-200"
                        >
                          {formatTicker(record.ticker)}
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <Link href="/anomalies" className="block">
                          {formatDate(String(record.date))}
                        </Link>
                      </td>
                      <td className={`${tdClass} font-mono text-cyan-300`}>
                        <Link href="/anomalies" className="block">
                          {formatScore(record.anomaly_score)}
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <Link href="/anomalies" className="block">
                          <Badge className={severityStyles(severity)}>
                            {severity}
                          </Badge>
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <Link
                          href="/anomalies"
                          className="block max-w-[200px] truncate text-slate-400"
                          title={typeLabel}
                        >
                          {typeLabel}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
