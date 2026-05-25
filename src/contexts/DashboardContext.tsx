"use client";

import { createContext, useContext, type ReactNode } from "react";
import { BootScreen } from "@/components/boot/BootScreen";
import { AppShell } from "@/components/layout/AppShell";
import { useDashboardCore } from "@/hooks/useDashboardCore";
import type { HealthResponse, ModelInfo } from "@/lib/types";

interface DashboardContextValue {
  health: HealthResponse | null;
  modelInfo: ModelInfo | null;
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const {
    health,
    modelInfo,
    ready,
    loading,
    retrying,
    error,
    bootPhase,
    bootMessage,
    bootAttempt,
    refresh,
  } = useDashboardCore();

  if (!ready) {
    return (
      <BootScreen
        phase={error ? "error" : bootPhase}
        message={bootMessage}
        attempt={bootAttempt}
        error={error}
        onRetry={() => void refresh()}
        retrying={retrying || (loading && !error)}
      />
    );
  }

  return (
    <DashboardContext.Provider value={{ health, modelInfo, refresh }}>
      <AppShell health={health} modelInfo={modelInfo}>
        {children}
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
