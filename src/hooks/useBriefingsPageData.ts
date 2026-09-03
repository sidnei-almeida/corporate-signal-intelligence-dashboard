"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getAllAnomalies,
  getCompanies,
  getTickerAnomalies,
} from "@/lib/api";
import type { AnomalyRecord, Company } from "@/lib/types";

/**
 * The unfiltered list is the whole flagged set, not a ranked head.
 *
 * A head of the score ranking is entirely "critical" — the tier cutoffs are quantiles of
 * the same score — so seeding the list from it made the severity filter look broken:
 * every tier but critical came back empty until a ticker filter switched the source to
 * the full per-issuer history.
 */
const LIST_LIMIT = 1000;

export function useBriefingsPageData() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [records, setRecords] = useState<AnomalyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickerFilter, setTickerFilter] = useState("");

  const loadAll = useCallback(async () => {
    const res = await getAllAnomalies(LIST_LIMIT);
    setRecords(res.records);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const companiesRes = await getCompanies();
      setCompanies(companiesRes);
      await loadAll();
      setTickerFilter("");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to load anomaly events for AI briefings.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loadAll]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only page bootstrap
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bootstrap
  }, []);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    async function loadList() {
      setListLoading(true);
      try {
        if (!tickerFilter) {
          const allRes = await getAllAnomalies(LIST_LIMIT);
          if (!cancelled) setRecords(allRes.records);
        } else {
          const res = await getTickerAnomalies(tickerFilter);
          if (!cancelled) setRecords(res.records);
        }
      } catch {
        if (!cancelled) setRecords([]);
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }

    void loadList();
    return () => {
      cancelled = true;
    };
  }, [tickerFilter, loading]);

  return {
    companies,
    records,
    loading,
    listLoading,
    error,
    tickerFilter,
    setTickerFilter,
    refresh,
  };
}
