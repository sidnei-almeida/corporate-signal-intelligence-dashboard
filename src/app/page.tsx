"use client";

import Link from "next/link";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { AnomalyTypeChart } from "@/components/dashboard/AnomalyTypeChart";
import { CompanyRiskRankingChart } from "@/components/dashboard/CompanyRiskRankingChart";
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
    refresh,
  } = useOverviewData(12);

  if (loading) {
    return <LoadingState message="Loading overview…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="flex w-full max-w-none flex-col gap-4 2xl:gap-5">
      <ExecutiveOverview
        companies={companies}
        summaries={summaries}
        health={health}
      />

      <div className="grid w-full grid-cols-2 items-start gap-5">
        <div className="min-w-0">
          <AnomalyTypeChart types={anomalyTypes} />
        </div>
        <div className="min-w-0">
          <CompanyRiskRankingChart summaries={summaries} limit={12} />
        </div>
      </div>

      <div className="grid w-full grid-cols-12 items-stretch gap-5">
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
