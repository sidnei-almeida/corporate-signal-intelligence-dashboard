"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getAlertBudget,
  getAnomalySummary,
  getAnomalyTypes,
  getCompanies,
  getTopAnomalies,
  getValidationProtocol,
} from "@/lib/api";
import type {
  AlertBudget,
  AnomalyRecord,
  AnomalySummary,
  AnomalyTypeCount,
  Company,
  ValidationProtocol,
} from "@/lib/types";

export function useOverviewData(topLimit = 5) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [summaries, setSummaries] = useState<AnomalySummary[]>([]);
  const [anomalyTypes, setAnomalyTypes] = useState<AnomalyTypeCount[]>([]);
  const [topAnomalies, setTopAnomalies] = useState<AnomalyRecord[]>([]);
  const [protocol, setProtocol] = useState<ValidationProtocol | null>(null);
  const [budget, setBudget] = useState<AlertBudget | null>(null);

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

      // The protocol and budget carry the headline numbers. They are fetched separately
      // and tolerated as missing: a stale deployment without the validation artifacts
      // should still render the queue rather than fail the whole page.
      const [protocolRes, budgetRes] = await Promise.allSettled([
        getValidationProtocol(),
        getAlertBudget(1),
      ]);
      if (protocolRes.status === "fulfilled") setProtocol(protocolRes.value);
      if (budgetRes.status === "fulfilled") setBudget(budgetRes.value);
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
    protocol,
    budget,
    refresh,
  };
}
