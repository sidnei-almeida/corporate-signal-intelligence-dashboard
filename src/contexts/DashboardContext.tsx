"use client";

import { createContext, useContext, type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDashboardCore } from "@/hooks/useDashboardCore";
import type { HealthResponse, ModelInfo } from "@/lib/types";

interface DashboardContextValue {
  health: HealthResponse | null;
  modelInfo: ModelInfo | null;
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { health, modelInfo, loading, error, refresh } = useDashboardCore();

  return (
    <DashboardContext.Provider value={{ health, modelInfo, refresh }}>
      <AppShell health={health} modelInfo={modelInfo}>
        {loading ? (
          <LoadingState message="Connecting to intelligence API…" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void refresh()} />
        ) : (
          children
        )}
      </AppShell>
    </DashboardContext.Provider>
  );
}

export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext must be used within DashboardProvider");
  }
  return ctx;
}
