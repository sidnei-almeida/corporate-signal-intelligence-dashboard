"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Brain } from "lucide-react";
import { APP_NAME, DASHBOARD_NAV, ROUTE_META } from "@/lib/constants";
import type { HealthResponse, ModelInfo } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface HeaderProps {
  health: HealthResponse | null;
  modelInfo: ModelInfo | null;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ health, modelInfo }: HeaderProps) {
  const pathname = usePathname();
  const routeMeta = ROUTE_META[pathname] ?? ROUTE_META["/"];
  const apiOk = health?.status === "ok";
  const modelOk = modelInfo?.model_exists ?? health?.model_available;

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[#05070A]/95 backdrop-blur-md">
      <div className="flex w-full max-w-none flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-500/80 md:text-xs">
              {APP_NAME}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl 2xl:text-4xl">
              {routeMeta.title}
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-slate-400 2xl:text-base">
              {routeMeta.subtitle}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Badge
              className={
                apiOk
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
              }
            >
              <Activity className="mr-1 inline h-3 w-3" />
              API {apiOk ? "ONLINE" : "DEGRADED"}
            </Badge>
            {health?.data_source && (
              <Badge className="border-white/10 bg-zinc-900 text-slate-400 uppercase tracking-wide">
                Source: {String(health.data_source).toUpperCase()}
              </Badge>
            )}
            <Badge
              className={
                modelOk
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }
            >
              <Brain className="mr-1 inline h-3 w-3" />
              Model {modelOk ? "READY" : "UNAVAILABLE"}
            </Badge>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-white/5 pt-3 lg:hidden">
          {DASHBOARD_NAV.map(({ label, href }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                    : "border-white/5 bg-zinc-900/60 text-slate-300 hover:border-cyan-500/30 hover:text-cyan-200"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
