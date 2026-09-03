"use client";

import Link from "next/link";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { AnomalyTypeChart } from "@/components/dashboard/AnomalyTypeChart";
import { PrecisionGainPanel } from "@/components/dashboard/PrecisionGainPanel";
import { ModelStatusCard } from "@/components/dashboard/ModelStatusCard";
import { TopAnomaliesPreview } from "@/components/dashboard/TopAnomaliesPreview";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { useOverviewData } from "@/hooks/useOverviewData";

export default function OverviewPage() {
  const { health, modelInfo } = useDashboardContext();
  const {
    loading,
    error,
    companies,
    summaries,
    anomalyTypes,
    topAnomalies,
    protocol,
    budget,
    refresh,
  } = useOverviewData(12);

  if (loading) {
    return <LoadingState message="Loading overview…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="dashboard-page-content flex w-full max-w-none flex-col gap-4 2xl:gap-5">
      <ExecutiveOverview
        companies={companies}
        summaries={summaries}
        health={health}
        protocol={protocol}
        budget={budget}
      />

      <div className="grid w-full grid-cols-2 items-stretch gap-5 charts-row charts-grid">
        <div className="flex min-w-0">
          <AnomalyTypeChart types={anomalyTypes} fillHeight />
        </div>
        <div className="flex min-w-0">
          <PrecisionGainPanel protocol={protocol} fillHeight />
        </div>
      </div>

      <div className="bottom-row bottom-grid grid w-full grid-cols-12 items-stretch gap-5">
        <div className="flex min-w-0 col-span-8">
          <TopAnomaliesPreview records={topAnomalies} />
        </div>
        <div className="flex min-w-0 col-span-4">
          <ModelStatusCard
            modelInfo={modelInfo}
            health={health}
            fillHeight
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
        <Link href="/anomalies" className="link-accent hover:text-value-accent">
          Investigate anomalies →
        </Link>
        <Link href="/companies" className="link-accent hover:text-value-accent">
          Company intelligence →
        </Link>
        <Link href="/briefings" className="link-accent hover:text-value-accent">
          Generate AI briefing →
        </Link>
      </div>
    </div>
  );
}
