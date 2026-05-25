"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getCompanies,
  getTickerAnomalies,
  getTopAnomalies,
} from "@/lib/api";
import type { AnomalyRecord, Company } from "@/lib/types";

const TOP_LIMIT = 50;

export function useBriefingsPageData() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [records, setRecords] = useState<AnomalyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickerFilter, setTickerFilter] = useState("");

  const loadTop = useCallback(async () => {
    const topRes = await getTopAnomalies(TOP_LIMIT);
    setRecords(topRes.records);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const companiesRes = await getCompanies();
      setCompanies(companiesRes);
      await loadTop();
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
  }, [loadTop]);

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
          const topRes = await getTopAnomalies(TOP_LIMIT);
          if (!cancelled) setRecords(topRes.records);
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
