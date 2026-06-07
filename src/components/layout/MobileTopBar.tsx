"use client";

import { ProductMark } from "@/components/brand";
import type { HealthResponse, ModelInfo } from "@/lib/types";

interface MobileTopBarProps {
  health: HealthResponse | null;
  modelInfo: ModelInfo | null;
}

export function MobileTopBar({ health, modelInfo }: MobileTopBarProps) {
  const apiOk = health?.status === "ok";
  const databaseOk = Boolean(health?.data_source);
  const modelOk = modelInfo?.model_exists ?? health?.model_available;

  return (
    <div id="mob-dash-nav" className="mob-dash-nav" aria-label="Dashboard">
      <div className="mob-brand">
        <ProductMark size={16} className="mob-brand-icon shrink-0" />
        <div>
          <div className="mob-brand-main">CORPORATE SIGNAL</div>
          <div className="mob-brand-sub">INTELLIGENCE</div>
        </div>
      </div>
      <div className="mob-nav-status" aria-label="System status">
        <span
          className={`mob-status-dot api${apiOk ? " mob-status-dot--ok" : ""}`}
          title={apiOk ? "API online" : "API degraded"}
        />
        <span
          className={`mob-status-dot db${databaseOk ? " mob-status-dot--ok" : ""}`}
          title={databaseOk ? "Database synced" : "Database unavailable"}
        />
        <span
          className={`mob-status-dot model${modelOk ? " mob-status-dot--ok" : ""}`}
          title={modelOk ? "Model ready" : "Model unavailable"}
        />
      </div>
    </div>
  );
}
