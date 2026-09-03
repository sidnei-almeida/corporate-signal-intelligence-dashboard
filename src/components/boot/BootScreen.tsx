"use client";

import { ProductMark } from "@/components/brand";
import { Button } from "@/components/ui/Button";
import { APP_BOOT_FOOTER, APP_NAME, APP_TAGLINE } from "@/lib/constants";
import type { BootPhase } from "@/lib/apiBoot";

interface BootScreenProps {
  phase: BootPhase;
  message: string;
  attempt: number;
  error: string | null;
  onRetry: () => void;
  retrying?: boolean;
}

const STEPS: { id: BootPhase; label: string }[] = [
  { id: "checking", label: "Checking backend" },
  { id: "waking", label: "Starting API" },
  { id: "verifying", label: "Verifying anomaly model" },
  { id: "loading", label: "Loading market signals" },
  { id: "preparing", label: "Preparing AI briefing service" },
];

const PHASE_ORDER: BootPhase[] = [
  "checking",
  "waking",
  "verifying",
  "loading",
  "preparing",
  "ready",
];

function stepIndex(phase: BootPhase): number {
  if (phase === "error") return 1;
  if (phase === "ready") return STEPS.length;
  const idx = PHASE_ORDER.indexOf(phase);
  return idx >= 0 ? Math.min(idx, STEPS.length - 1) : 0;
}

function progressPercent(phase: BootPhase, attempt: number): number {
  if (phase === "ready") return 100;
  if (phase === "preparing") return 92;
  if (phase === "loading") return 78;
  if (phase === "verifying") return 62;
  if (phase === "waking") return Math.min(18 + attempt * 1.2, 55);
  if (phase === "checking") return 8;
  return 12;
}

export function BootScreen({
  phase,
  message,
  attempt,
  error,
  onRetry,
  retrying = false,
}: BootScreenProps) {
  const isError = Boolean(error);
  const activeStep = stepIndex(phase);
  const progress = progressPercent(phase, attempt);
  const exiting = phase === "ready" && !isError;

  return (
    <div
      className={`boot-screen fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center px-6 ${
        exiting ? "boot-exit" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-busy={!isError && !exiting}
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <ProductMark size={40} className="text-[var(--accent-primary)]" />

        <h1 className="mt-6 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          {APP_NAME}
        </h1>
        <p className="type-page-subtitle mt-2 max-w-sm">
          {APP_TAGLINE}
        </p>

        <div className="mt-10 w-full">
          <div className="h-px w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-px rounded-full bg-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-primary-glow)] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <ol className="mt-8 w-full space-y-2 text-left">
          {STEPS.map((step, index) => {
            const done = index < activeStep;
            const current = index === activeStep && !isError && phase !== "ready";
            return (
              <li
                key={step.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  done
                    ? "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
                    : current
                      ? "border-[var(--border-subtle)] bg-[var(--nav-active-bg)] text-[var(--text-primary)]"
                      : "border-transparent text-[var(--text-tertiary)]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium ${
                    done
                      ? "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--accent-teal)]"
                      : current
                        ? "border-[var(--accent-teal)] text-[var(--accent-teal)]"
                        : "border-[var(--border)] text-[var(--text-tertiary)]"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : index + 1}
                </span>
                <span className="font-medium">{step.label}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 min-h-[3.5rem] w-full">
          {isError ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--critical-bg)] px-4 py-4 text-left">
              <p className="text-sm font-medium text-[var(--critical-text)]">
                Unable to connect to monitoring API
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {error}
              </p>
              <Button
                className="mt-4 w-full sm:w-auto"
                onClick={onRetry}
                loading={retrying}
              >
                Retry connection
              </Button>
            </div>
          ) : (
            <p className="text-sm font-medium text-[var(--text-primary)]">{message}</p>
          )}
        </div>

        {!isError && (
          <p className="mt-6 max-w-xs text-xs leading-relaxed text-[var(--text-tertiary)]">
            {APP_BOOT_FOOTER}
          </p>
        )}
      </div>
    </div>
  );
}
