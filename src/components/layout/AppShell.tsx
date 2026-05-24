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
    <div className="min-h-screen w-full bg-[#05070A] text-slate-100">
      <Sidebar />
      <div className="flex min-h-screen w-full max-w-none flex-col lg:pl-64">
        <Header health={health} modelInfo={modelInfo} />
        <main className="w-full max-w-none flex-1 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
