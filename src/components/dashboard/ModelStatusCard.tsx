import { ArrowRight, CheckCircle2, Cpu } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
  "Briefing",
] as const;

const SIGNAL_STACK = [
  { label: "Market Data", value: "Stooq" },
  { label: "Corporate Filings", value: "SEC EDGAR" },
  { label: "Anomaly Model", value: "Isolation Forest" },
  { label: "Briefing Layer", value: "Groq" },
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
            className={`shrink-0 rounded-lg border p-2 ${
              modelReady
                ? "border-cyan-500/25 bg-cyan-500/10"
                : "border-amber-500/25 bg-amber-500/10"
            }`}
          >
            <Cpu
              className={`h-4 w-4 ${modelReady ? "text-cyan-400" : "text-amber-400"}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-3.5 w-3.5 ${modelReady ? "text-emerald-400" : "text-amber-400"}`}
              />
              <span className="text-sm font-medium text-slate-100">
                {modelReady ? "Model operational" : "Model unavailable"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge
                className={
                  modelReady
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }
              >
                {modelReady ? "Artifact loaded" : "Artifact missing"}
              </Badge>
              <Badge className="border-white/10 bg-zinc-900 text-slate-400">
                {dataSource} source
              </Badge>
              <Badge
                className={
                  apiOnline
                    ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-300"
                    : "border-rose-500/25 bg-rose-500/10 text-rose-300"
                }
              >
                API {apiOnline ? "Online" : "Degraded"}
              </Badge>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <Metric label="Engine" value="Isolation Forest" />
          <Metric label="Type" value={String(typeLabel)} />
          <Metric label="Features" value={String(features)} mono />
          <Metric label="Output" value="Score + Type" />
          <Metric label="Briefing" value="Groq" />
          <Metric label="Backend" value="FastAPI" />
          <Metric label="Briefing model" value={briefingModel} />
          <Metric label="Artifact" value={String(artifactLabel)} truncate />
        </dl>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Pipeline flow
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {PIPELINE_STEPS.map((step, index) => (
              <span key={step} className="flex items-center gap-1">
                <span className="rounded-md border border-white/10 bg-zinc-900/80 px-2 py-0.5 text-[10px] text-slate-300">
                  {step}
                </span>
                {index < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight className="h-3 w-3 shrink-0 text-slate-600" />
                )}
              </span>
            ))}
          </div>
        </div>

        <div className={fillHeight ? "flex min-h-0 flex-1 flex-col" : ""}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Signal stack
          </p>
          <ul
            className={`space-y-1.5 rounded-xl border border-white/5 bg-zinc-900/40 px-3 py-2.5 ${
              fillHeight ? "flex-1" : ""
            }`}
          >
            {SIGNAL_STACK.map(({ label, value }) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-200">{value}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 border-t border-white/5 pt-1.5 text-xs">
              <span className="text-slate-500">Database</span>
              <span className="font-medium text-cyan-300/90">{dataSource}</span>
            </li>
            <li className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">Deployment</span>
              <span className="font-medium text-slate-200">Render · FastAPI</span>
            </li>
          </ul>
        </div>

        <p
          className={`text-[11px] leading-relaxed text-slate-600 ${
            fillHeight ? "mt-auto shrink-0" : ""
          }`}
        >
          Pipeline transforms market, filing, and financial signals into anomaly
          scores and executive context.
        </p>
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-zinc-900/50 px-2.5 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-xs text-slate-200 ${mono ? "font-mono tabular-nums" : ""} ${truncate ? "truncate" : ""}`}
        title={truncate ? value : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
