"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  getAnomalySummary,
  getCompanies,
  getCompanyProfile,
  getTickerAnomalies,
} from "@/lib/api";
import type {
  AnomalyRecord,
  AnomalySummary,
  Company,
  CompanyProfile,
} from "@/lib/types";

export function useCompanyIntelligence() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [summaries, setSummaries] = useState<AnomalySummary[]>([]);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [tickerAnomalies, setTickerAnomalies] = useState<AnomalyRecord[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const defaultTickerSet = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [companiesRes, summaryRes] = await Promise.all([
        getCompanies(),
        getAnomalySummary(),
      ]);
      setCompanies(companiesRes);
      setSummaries(summaryRes);
      if (companiesRes.length > 0 && !defaultTickerSet.current) {
        defaultTickerSet.current = true;
        setSelectedTicker(companiesRes[0].ticker);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to load company data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only page bootstrap
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bootstrap
  }, []);

  useEffect(() => {
    if (!selectedTicker) return;

    let cancelled = false;

    async function loadTicker() {
      setProfileLoading(true);
      try {
        const [profileRes, anomaliesRes] = await Promise.all([
          getCompanyProfile(selectedTicker),
          getTickerAnomalies(selectedTicker),
        ]);
        if (!cancelled) {
          setProfile(profileRes);
          setTickerAnomalies(anomaliesRes.records);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setTickerAnomalies([]);
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    void loadTicker();
    return () => {
      cancelled = true;
    };
  }, [selectedTicker]);

  return {
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
  };
}
