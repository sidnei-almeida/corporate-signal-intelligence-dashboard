"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getAnomalySummary,
  getAnomalyTypes,
  getCompanies,
  getTopAnomalies,
} from "@/lib/api";
import type {
  AnomalyRecord,
  AnomalySummary,
  AnomalyTypeCount,
  Company,
} from "@/lib/types";

export function useOverviewData(topLimit = 5) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [summaries, setSummaries] = useState<AnomalySummary[]>([]);
  const [anomalyTypes, setAnomalyTypes] = useState<AnomalyTypeCount[]>([]);
  const [topAnomalies, setTopAnomalies] = useState<AnomalyRecord[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [companiesRes, summaryRes, typesRes, topRes] = await Promise.all([
        getCompanies(),
        getAnomalySummary(),
        getAnomalyTypes(),
        getTopAnomalies(topLimit),
      ]);
      setCompanies(companiesRes);
      setSummaries(summaryRes);
      setAnomalyTypes(typesRes);
      setTopAnomalies(topRes.records);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to load overview data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [topLimit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only page bootstrap
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bootstrap
  }, []);

  return {
    loading,
    error,
    companies,
    summaries,
    anomalyTypes,
    topAnomalies,
    refresh,
  };
}
