"use client";

import { useMemo, useState } from "react";
import { AnomalyEventSelector } from "@/components/dashboard/AnomalyEventSelector";
import { BriefingEventContext } from "@/components/dashboard/BriefingEventContext";
import { ExecutiveMemo } from "@/components/dashboard/ExecutiveMemo";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useBriefingsPageData } from "@/hooks/useBriefingsPageData";
import { ApiError, generateBriefingFromRecord } from "@/lib/api";
import { filterAnomalyRecords } from "@/lib/anomalyFilters";
import { normalizeBriefingMarkdown } from "@/lib/briefingNormalize";
import type { AnomalyRecord, BriefingResponse } from "@/lib/types";
import {
  anomalyRecordsMatch,
  formatAnomalyTypeLabel,
  formatScore,
  formatTicker,
  getAnomalySeverity,
  splitAnomalyTypes,
  toFiniteNumber,
} from "@/lib/formatters";

function sortByScore(records: AnomalyRecord[]): AnomalyRecord[] {
  return [...records]
    .filter((r) => r.is_anomaly !== false)
    .sort(
      (a, b) =>
        (toFiniteNumber(a.anomaly_score) ?? 0) -
        (toFiniteNumber(b.anomaly_score) ?? 0),
    );
}

export default function BriefingsPage() {
  const {
    companies,
    records,
    loading,
    listLoading,
    error,
    tickerFilter,
    setTickerFilter,
    refresh,
  } = useBriefingsPageData();

  const [severityFilter, setSeverityFilter] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(
    null,
  );
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);
  const [briefingGeneratedAt, setBriefingGeneratedAt] = useState<Date | null>(
    null,
  );

  const filteredRecords = useMemo(
    () =>
      filterAnomalyRecords(records, {
        ticker: "",
        severity: severityFilter,
        anomalyType: "",
        typeSearch,
      }),
    [records, severityFilter, typeSearch],
  );

  const sortedFiltered = useMemo(
    () => sortByScore(filteredRecords),
    [filteredRecords],
  );

  const activeAnomaly = useMemo(() => {
    if (sortedFiltered.length === 0) return null;
    if (
      selectedAnomaly &&
      sortedFiltered.some((r) => anomalyRecordsMatch(r, selectedAnomaly))
    ) {
      return selectedAnomaly;
    }
    return sortedFiltered[0];
  }, [sortedFiltered, selectedAnomaly]);

  const handleSelect = (record: AnomalyRecord) => {
    setSelectedAnomaly(record);
    setBriefing(null);
    setBriefingError(null);
    setBriefingGeneratedAt(null);
  };

  const handleTickerChange = (ticker: string) => {
    setTickerFilter(ticker);
    setBriefing(null);
    setBriefingError(null);
    setBriefingGeneratedAt(null);
  };

  const handleGenerateBriefing = async () => {
    if (!activeAnomaly?.ticker || !activeAnomaly?.date) return;

    setBriefingLoading(true);
    setBriefingError(null);
    try {
      const company = companies.find(
        (c) => formatTicker(c.ticker) === formatTicker(activeAnomaly.ticker),
      );
      const result = await generateBriefingFromRecord(activeAnomaly, company);
      const severity = getAnomalySeverity(activeAnomaly.anomaly_score);
      const typeLabels = splitAnomalyTypes(
        String(activeAnomaly.anomaly_type ?? ""),
      ).map(formatAnomalyTypeLabel);

      setBriefing({
        ...result,
        briefing: normalizeBriefingMarkdown(
          result.briefing,
          severity,
          typeLabels,
          formatScore(activeAnomaly.anomaly_score),
        ),
      });
      setBriefingGeneratedAt(new Date());
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "AI briefing generation failed. Ensure GROQ_API_KEY is configured on the API.";
      setBriefingError(message);
      setBriefing(null);
    } finally {
      setBriefingLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading AI briefing workspace…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="w-full max-w-none">
      <section className="grid grid-cols-1 gap-5 2xl:grid-cols-12 2xl:items-stretch">
        <div className="min-w-0 2xl:col-span-4">
          <AnomalyEventSelector
            companies={companies}
            records={sortedFiltered}
            selectedRecord={activeAnomaly}
            onSelect={handleSelect}
            tickerFilter={tickerFilter}
            severityFilter={severityFilter}
            typeSearch={typeSearch}
            onTickerFilterChange={handleTickerChange}
            onSeverityFilterChange={setSeverityFilter}
            onTypeSearchChange={setTypeSearch}
            listLoading={listLoading}
            fillHeight
          />
        </div>

        <div className="min-w-0 2xl:col-span-8">
          <BriefingEventContext
            selectedRecord={activeAnomaly}
            companies={companies}
            loading={briefingLoading}
            onGenerate={() => void handleGenerateBriefing()}
          />
        </div>
      </section>

      <section className="mt-5 w-full">
        <ExecutiveMemo
          selectedRecord={activeAnomaly}
          briefing={briefing}
          loading={briefingLoading}
          error={briefingError}
          generatedAt={briefingGeneratedAt}
          onGenerate={() => void handleGenerateBriefing()}
        />
      </section>
    </div>
  );
}
