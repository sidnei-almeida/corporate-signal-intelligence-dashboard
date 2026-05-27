import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { HealthResponse, ModelInfo } from "@/lib/types";

interface AppShellProps {
  children: ReactNode;
  health: HealthResponse | null;
  modelInfo: ModelInfo | null;
}

export function AppShell({ children, health, modelInfo }: AppShellProps) {
  return (
    <div className="app-shell app-enter relative min-h-screen w-full text-[var(--text-primary)]">
      <Sidebar />
      <div className="dashboard-desktop-canvas relative z-10 flex min-h-screen w-full max-w-none flex-col pl-[232px]">
        <Header health={health} modelInfo={modelInfo} />
        <main className="dashboard-workspace w-full max-w-none flex-1 px-8 py-6 2xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
