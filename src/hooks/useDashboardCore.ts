"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, getHealth, getModelInfo } from "@/lib/api";
import type { HealthResponse, ModelInfo } from "@/lib/types";

export function useDashboardCore() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, modelRes] = await Promise.all([
        getHealth(),
        getModelInfo(),
      ]);
      setHealth(healthRes);
      setModelInfo(modelRes);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to connect to the intelligence API.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only API bootstrap
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bootstrap
  }, []);

  return { health, modelInfo, loading, error, refresh };
}
