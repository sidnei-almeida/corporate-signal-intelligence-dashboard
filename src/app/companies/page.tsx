"use client";

import { useMemo, useState } from "react";
import { CompanySelector } from "@/components/dashboard/CompanySelector";
import { CompanyProfileCard } from "@/components/dashboard/CompanyProfileCard";
import { CompanySignalBreakdown } from "@/components/dashboard/CompanySignalBreakdown";
import { MonitoredUniverseRanking } from "@/components/dashboard/MonitoredUniverseRanking";
import { CompanyAnomalyTimeline } from "@/components/dashboard/CompanyAnomalyTimeline";
import { TopCompanyEvents } from "@/components/dashboard/TopCompanyEvents";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useCompanyIntelligence } from "@/hooks/useCompanyIntelligence";
import type { AnomalyRecord } from "@/lib/types";
import { anomalyRecordsMatch, formatTicker, toFiniteNumber } from "@/lib/formatters";

export default function CompaniesPage() {
  const {
    loading,
    error,
    companies,
    summaries,
    selectedTicker,
    setSelectedTicker,
    profile,
    tickerAnomalies,
    profileLoading,
    refresh,
  } = useCompanyIntelligence();

  const [selectedRecord, setSelectedRecord] = useState<AnomalyRecord | null>(
    null,
  );

  const selectedCompanyName = useMemo(() => {
    if (!selectedTicker) return null;
    return (
      companies.find((c) => formatTicker(c.ticker) === formatTicker(selectedTicker))
        ?.company_name ?? null
    );
  }, [companies, selectedTicker]);

  const defaultRecord = useMemo(() => {
    if (!selectedTicker || tickerAnomalies.length === 0) return null;
    return (
      [...tickerAnomalies]
        .filter((r) => r.is_anomaly !== false)
        .sort(
          (a, b) =>
            (toFiniteNumber(a.anomaly_score) ?? 0) -
            (toFiniteNumber(b.anomaly_score) ?? 0),
        )[0] ?? null
    );
  }, [selectedTicker, tickerAnomalies]);

  const activeRecord = useMemo(() => {
    if (!selectedTicker || tickerAnomalies.length === 0) return null;
    if (
      selectedRecord &&
      tickerAnomalies.some((r) => anomalyRecordsMatch(r, selectedRecord))
    ) {
      return selectedRecord;
    }
    return defaultRecord;
  }, [selectedTicker, tickerAnomalies, selectedRecord, defaultRecord]);

  if (loading) {
    return <LoadingState message="Loading company intelligence…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="dashboard-page-content flex w-full max-w-none flex-col gap-4 2xl:gap-5">
      <CompanySelector
        companies={companies}
        selectedTicker={selectedTicker}
        onSelect={(ticker) => {
          setSelectedTicker(ticker);
          setSelectedRecord(null);
        }}
      />

      <div className="grid w-full grid-cols-12 items-stretch gap-5">
        <div className="flex min-w-0 col-span-4">
          <CompanyProfileCard
            profile={selectedTicker ? profile : null}
            summaries={summaries}
            companyName={selectedCompanyName}
            tickerAnomalies={selectedTicker ? tickerAnomalies : []}
            loading={profileLoading && Boolean(selectedTicker)}
            fillHeight
          />
        </div>
        <div className="flex min-w-0 col-span-8">
          <CompanyAnomalyTimeline
            ticker={selectedTicker}
            records={selectedTicker ? tickerAnomalies : []}
            selectedRecord={activeRecord}
            onSelect={setSelectedRecord}
            loading={profileLoading}
            fillHeight
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-12 items-stretch gap-5">
        <div className="flex min-w-0 col-span-4">
          <CompanySignalBreakdown
            ticker={selectedTicker}
            records={selectedTicker ? tickerAnomalies : []}
            loading={profileLoading}
            fillHeight
          />
        </div>
        <div className="min-w-0 col-span-8">
          <TopCompanyEvents
            ticker={selectedTicker}
            records={selectedTicker ? tickerAnomalies : []}
            selectedRecord={activeRecord}
            onSelect={setSelectedRecord}
            loading={profileLoading}
          />
        </div>
      </div>

      <MonitoredUniverseRanking
        summaries={summaries}
        highlightTicker={selectedTicker}
      />
    </div>
  );
}
