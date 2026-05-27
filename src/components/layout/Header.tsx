"use client";

import { usePathname } from "next/navigation";
import { APP_NAME, APP_TAGLINE, ROUTE_META } from "@/lib/constants";
import {
  TYPE_PAGE_SUBTITLE,
  TYPE_PAGE_TITLE,
} from "@/lib/typography";
import type { HealthResponse, ModelInfo } from "@/lib/types";
import { StatusIndicator } from "@/components/ui/StatusIndicator";

interface HeaderProps {
  health: HealthResponse | null;
  modelInfo: ModelInfo | null;
}

export function Header({ health, modelInfo }: HeaderProps) {
  const pathname = usePathname();
  const routeMeta = ROUTE_META[pathname] ?? ROUTE_META["/"];
  const apiOk = health?.status === "ok";
  const modelOk = modelInfo?.model_exists ?? health?.model_available;

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
      <div className="flex w-full max-w-none flex-col gap-4 px-8 py-5 2xl:px-10 2xl:py-6">
        <div className="flex flex-row flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="label-caps">{APP_NAME}</p>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)]">
              {APP_TAGLINE}
            </p>
            <h1 className={`${TYPE_PAGE_TITLE} mt-3`}>{routeMeta.title}</h1>
            <p className={`${TYPE_PAGE_SUBTITLE} mt-2 max-w-4xl`}>
              {routeMeta.subtitle}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <StatusIndicator ok={apiOk} label={apiOk ? "API online" : "API degraded"} />
            {health?.data_source && (
              <StatusIndicator ok label={`${String(health.data_source)}`} />
            )}
            <StatusIndicator
              ok={Boolean(modelOk)}
              label={modelOk ? "Model ready" : "Model unavailable"}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
