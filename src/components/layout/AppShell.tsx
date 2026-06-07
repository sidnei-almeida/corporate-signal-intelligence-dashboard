import type { ReactNode } from "react";
import { MobileChartResize } from "@/components/charts/MobileChartResize";
import { Header } from "./Header";
import { MobileTabBar } from "./MobileTabBar";
import { MobileTopBar } from "./MobileTopBar";
import { Sidebar } from "./Sidebar";
import type { HealthResponse, ModelInfo } from "@/lib/types";

interface AppShellProps {
  children: ReactNode;
  health: HealthResponse | null;
  modelInfo: ModelInfo | null;
}

export function AppShell({ children, health, modelInfo }: AppShellProps) {
  return (
    <div className="app-shell app-root app-enter relative min-h-screen w-full text-[var(--text-primary)]">
      <MobileChartResize />
      <Sidebar />
      <MobileTopBar health={health} modelInfo={modelInfo} />
      <div
        className="dashboard-desktop-canvas dashboard-hero-shell app-wrapper relative z-10 flex min-h-screen w-full max-w-none flex-col pl-[232px]"
        data-layout="main"
      >
        <Header health={health} modelInfo={modelInfo} />
        <main className="dashboard-workspace dashboard-body page-content main-content w-full max-w-none flex-1 px-8 py-6 2xl:px-10">
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
