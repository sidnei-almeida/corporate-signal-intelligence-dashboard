"use client";

import { useMemo, useState } from "react";
import { AlertBudgetControl } from "@/components/dashboard/AlertBudgetControl";
import { AnomalyFilters } from "@/components/dashboard/AnomalyFilters";
import { AnomalyTypeChart } from "@/components/dashboard/AnomalyTypeChart";
import { CompanyAnomalyTimeline } from "@/components/dashboard/CompanyAnomalyTimeline";
import { SelectedAnomalyDetails } from "@/components/dashboard/SelectedAnomalyDetails";
import { TopAnomaliesTable } from "@/components/dashboard/TopAnomaliesTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAnomaliesData } from "@/hooks/useAnomaliesData";
import { filterAnomalyRecords } from "@/lib/anomalyFilters";
import type { AnomalyRecord } from "@/lib/types";
import { formatTicker } from "@/lib/formatters";

export default function AnomaliesPage() {
  const {
    loading,
    queueLoading,
    error,
    records,
    anomalyTypes,
    companies,
    budget,
    budgetPct,
    changeBudget,
    refresh,
  } = useAnomaliesData(200);

  const [tickerFilter, setTickerFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<AnomalyRecord | null>(
    null,
  );

  const tickers = useMemo(
    () =>
      [...new Set(records.map((r) => formatTicker(r.ticker)).filter(Boolean))].sort(),
    [records],
  );

  const filteredRecords = useMemo(
    () =>
      filterAnomalyRecords(records, {
        ticker: tickerFilter,
        severity: severityFilter,
        anomalyType: typeFilter,
      }),
    [records, tickerFilter, severityFilter, typeFilter],
  );

  const timelineTicker = selectedRecord?.ticker
    ? String(selectedRecord.ticker)
    : tickerFilter;

  const timelineRecords = useMemo(() => {
    if (!timelineTicker) return [];
    return records.filter(
      (r) => formatTicker(r.ticker) === formatTicker(timelineTicker),
    );
  }, [records, timelineTicker]);

  const handleSelect = (record: AnomalyRecord) => {
    setSelectedRecord(record);
    if (record.ticker) setTickerFilter(String(record.ticker));
  };

  if (loading) {
    return <LoadingState message="Loading anomaly events…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="dashboard-page-content flex w-full max-w-none flex-col gap-4 2xl:gap-5">
      <AlertBudgetControl
        budgetPct={budgetPct}
        budget={budget}
        onChange={(pct) => void changeBudget(pct)}
        disabled={queueLoading}
      />

      <AnomalyFilters
        tickers={tickers.length > 0 ? tickers : companies.map((c) => c.ticker)}
        ticker={tickerFilter}
        severity={severityFilter}
        anomalyType={typeFilter}
        onTickerChange={setTickerFilter}
        onSeverityChange={setSeverityFilter}
        onAnomalyTypeChange={setTypeFilter}
      />

      <div className="grid w-full grid-cols-12 items-stretch gap-4">
        <div className="flex min-w-0 col-span-5">
          <AnomalyTypeChart types={anomalyTypes} fillHeight />
        </div>
        <div className="flex min-w-0 col-span-7">
          <SelectedAnomalyDetails record={selectedRecord} fillHeight />
        </div>
      </div>

      <TopAnomaliesTable
        records={filteredRecords}
        selectedRecord={selectedRecord}
        onSelect={handleSelect}
      />

      {timelineTicker && (
        <CompanyAnomalyTimeline
          ticker={timelineTicker}
          records={timelineRecords}
          selectedRecord={selectedRecord}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
