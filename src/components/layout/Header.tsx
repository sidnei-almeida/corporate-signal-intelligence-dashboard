"use client";

import { usePathname } from "next/navigation";
import { APP_NAME, ROUTE_META } from "@/lib/constants";
import type { HealthResponse, ModelInfo } from "@/lib/types";

interface HeaderProps {
  health: HealthResponse | null;
  modelInfo: ModelInfo | null;
}

export function Header({ health, modelInfo }: HeaderProps) {
  const pathname = usePathname();
  const routeMeta = ROUTE_META[pathname] ?? ROUTE_META["/"];
  const apiOk = health?.status === "ok";
  const modelOk = modelInfo?.model_exists ?? health?.model_available;
  const databaseOk = Boolean(health?.data_source);

  return (
    <header className="dashboard-page-header dashboard-hero sticky top-0 z-20">
      <div className="dashboard-page-header-content dashboard-hero-content">
        <div className="hero-copy">
          <span className="hero-eyebrow">{APP_NAME}</span>

          <h1>{routeMeta.title}</h1>

          <p className="hero-subtitle">{routeMeta.subtitle}</p>

          <div className="hero-context">
            {routeMeta.context.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="hero-status">
          <span className={apiOk ? undefined : "hero-status-off"}>
            {apiOk ? "API online" : "API degraded"}
          </span>
          {health?.data_source && (
            <span className={databaseOk ? undefined : "hero-status-off"}>
              Database synced
            </span>
          )}
          <span className={modelOk ? undefined : "hero-status-off"}>
            {modelOk ? "Model ready" : "Model unavailable"}
          </span>
        </div>
      </div>
    </header>
  );
}
