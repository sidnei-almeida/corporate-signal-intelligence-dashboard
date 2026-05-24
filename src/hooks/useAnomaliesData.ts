"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getAnomalyTypes,
  getCompanies,
  getTopAnomalies,
} from "@/lib/api";
import type { AnomalyRecord, AnomalyTypeCount, Company } from "@/lib/types";

export function useAnomaliesData(limit = 50) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<AnomalyRecord[]>([]);
  const [anomalyTypes, setAnomalyTypes] = useState<AnomalyTypeCount[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [topRes, typesRes, companiesRes] = await Promise.all([
        getTopAnomalies(limit),
        getAnomalyTypes(),
        getCompanies(),
      ]);
      setRecords(topRes.records);
      setAnomalyTypes(typesRes);
      setCompanies(companiesRes);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to load anomaly events.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only page bootstrap
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bootstrap
  }, []);

  return { loading, error, records, anomalyTypes, companies, refresh };
}
