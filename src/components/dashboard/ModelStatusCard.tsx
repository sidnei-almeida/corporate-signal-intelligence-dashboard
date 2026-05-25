import { IconArrowRight, IconCheck, IconModelEngine } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { MetricCell } from "@/components/ui/MetricCell";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import {
  CARD_DIVIDER,
  METRIC_CELL,
  PIPELINE_ARROW,
  PIPELINE_STEP,
  SECTION_LABEL,
  SECTION_VALUE,
} from "@/lib/cardVisuals";
import { TYPE_DATA_ACCENT } from "@/lib/typography";
import type { HealthResponse, ModelInfo } from "@/lib/types";

interface ModelStatusCardProps {
  modelInfo: ModelInfo | null;
  health?: HealthResponse | null;
  fillHeight?: boolean;
}

const PIPELINE_STEPS = [
  "Market Signals",
  "SEC Filings",
  "Feature Engine",
  "ML Score",
  "AI Briefing",
] as const;

const SIGNAL_STACK = [
  { label: "Market Data", value: "Stooq" },
  { label: "Corporate Filings", value: "SEC EDGAR" },
  { label: "Anomaly Model", value: "Isolation Forest" },
  { label: "AI Briefing Layer", value: "Groq" },
] as const;

function formatDataSource(source?: string): string {
  if (!source) return "Database";
  const lower = source.toLowerCase();
  if (lower === "database") return "PostgreSQL";
  if (lower === "csv") return "CSV";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function ModelStatusCard({
  modelInfo,
  health,
  fillHeight = false,
}: ModelStatusCardProps) {
  if (!modelInfo) return null;

  const apiOnline = health?.status === "ok";
  const modelReady = modelInfo.model_exists ?? health?.model_available ?? false;
  const dataSource = formatDataSource(health?.data_source);
  const artifactLabel = modelReady
    ? modelInfo.artifact_status ?? "Available"
    : "Unavailable";
  const typeLabel = modelInfo.model_type ?? "Pipeline";
  const features = modelInfo.expected_feature_count ?? "—";
  const briefingModel = "Groq configured";

  return (
    <Card
      title="ML Pipeline"
      subtitle="System & model status"
      fillHeight={fillHeight}
      className={fillHeight ? "h-full w-full" : "h-fit w-full"}
    >
      <div
        className={`flex flex-col gap-4 ${fillHeight ? "min-h-0 flex-1" : ""}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`shrink-0 rounded-md border p-2 ${METRIC_CELL} ${
              modelReady
                ? "row-selected border"
                : "border-[var(--high-border)] bg-[var(--high-bg)]"
            }`}
          >
            <IconModelEngine
              size={16}
              className={modelReady ? "text-[#00D4FF]" : "text-[var(--high-text)]"}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <IconCheck
                size={14}
                className={modelReady ? "text-[#00D4FF]" : "text-[var(--high-text)]"}
              />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {modelReady ? "Model operational" : "Model unavailable"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <StatusIndicator
                ok={modelReady}
                label={modelReady ? "Artifact loaded" : "Artifact missing"}
              />
              <span className="text-xs text-[var(--text-muted)]">{dataSource} source</span>
              <StatusIndicator
                ok={apiOnline}
                label={`API ${apiOnline ? "Online" : "Degraded"}`}
              />
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <MetricCell label="Engine" value="Isolation Forest" />
          <MetricCell label="Type" value={String(typeLabel)} />
          <MetricCell label="Features" value={String(features)} mono />
          <MetricCell label="Output" value="Score + Type" />
          <MetricCell label="AI Briefing" value="Groq" />
          <MetricCell label="Backend" value="FastAPI" />
          <MetricCell label="AI model" value={briefingModel} />
          <MetricCell label="Artifact" value={String(artifactLabel)} truncate />
        </dl>

        <div>
          <p className={`mb-2 ${SECTION_LABEL}`}>Pipeline flow</p>
          <div className="flex flex-wrap items-center gap-1">
            {PIPELINE_STEPS.map((step, index) => (
              <span key={step} className="flex items-center gap-1">
                <span className={PIPELINE_STEP}>{step}</span>
                {index < PIPELINE_STEPS.length - 1 && (
                  <IconArrowRight size={12} className={PIPELINE_ARROW} />
                )}
              </span>
            ))}
          </div>
        </div>

        <div className={fillHeight ? "flex min-h-0 flex-1 flex-col" : ""}>
          <p className={`mb-2 ${SECTION_LABEL}`}>Signal stack</p>
          <ul
            className={`space-y-1.5 ${METRIC_CELL} px-3 py-2.5 ${
              fillHeight ? "flex-1" : ""
            }`}
          >
            {SIGNAL_STACK.map(({ label, value }) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className={SECTION_LABEL}>{label}</span>
                <span className={SECTION_VALUE}>{value}</span>
              </li>
            ))}
            <li
              className={`flex items-center justify-between gap-3 border-t pt-1.5 text-xs ${CARD_DIVIDER}`}
            >
              <span className={SECTION_LABEL}>Database</span>
              <span className={TYPE_DATA_ACCENT}>{dataSource}</span>
            </li>
            <li className="flex items-center justify-between gap-3 text-xs">
              <span className={SECTION_LABEL}>Deployment</span>
              <span className={SECTION_VALUE}>Render · FastAPI</span>
            </li>
          </ul>
        </div>

        <p
          className={`text-[11px] leading-relaxed text-[var(--text-muted)] ${
            fillHeight ? "mt-auto shrink-0" : ""
          }`}
        >
          Pipeline transforms market, filing, and financial signals into anomaly
          scores and AI briefing context.
        </p>
      </div>
    </Card>
  );
}
