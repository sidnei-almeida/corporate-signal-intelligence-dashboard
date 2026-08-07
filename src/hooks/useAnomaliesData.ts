"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, getAlertQueue, getAnomalyTypes, getCompanies } from "@/lib/api";
import type {
  AlertBudget,
  AnomalyRecord,
  AnomalyTypeCount,
  Company,
} from "@/lib/types";

export const DEFAULT_BUDGET_PCT = 1;

/**
 * The alert queue, driven by the budget rather than a fixed row count.
 *
 * Changing the budget re-thresholds the queue server-side; the reference data (types,
 * companies) is fetched once and left alone.
 */
export function useAnomaliesData(limit = 50) {
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<AnomalyRecord[]>([]);
  const [anomalyTypes, setAnomalyTypes] = useState<AnomalyTypeCount[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [budget, setBudget] = useState<AlertBudget | null>(null);
  const [budgetPct, setBudgetPct] = useState<number>(DEFAULT_BUDGET_PCT);

  const loadQueue = useCallback(
    async (pct: number) => {
      const queueRes = await getAlertQueue({ budgetPct: pct, limit });
      setRecords(queueRes.records);
      setBudget(queueRes.budget ?? null);
    },
    [limit],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [, typesRes, companiesRes] = await Promise.all([
        loadQueue(budgetPct),
        getAnomalyTypes(),
        getCompanies(),
      ]);
      setAnomalyTypes(typesRes);
      setCompanies(companiesRes);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load the alert queue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [budgetPct, loadQueue]);

  const changeBudget = useCallback(
    async (pct: number) => {
      setBudgetPct(pct);
      setQueueLoading(true);
      setError(null);
      try {
        await loadQueue(pct);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to re-threshold the queue.";
        setError(message);
      } finally {
        setQueueLoading(false);
      }
    },
    [loadQueue],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only page bootstrap
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bootstrap
  }, []);

  return {
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
  };
}
