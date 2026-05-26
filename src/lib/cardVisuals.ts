/** Card & inner-surface visual tokens */

import type { AnomalySeverity } from "@/lib/types";

/** Section / field label */
export const SECTION_LABEL =
  "font-display text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] leading-[1.25]";

/** Value below a section label */
export const SECTION_VALUE =
  "font-data text-sm font-medium text-[var(--text-primary)]";

/** Inner metric / sub-cells inside cards */
export const METRIC_CELL =
  "rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-colors duration-150 hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-default)]";

/** Pipeline / flow step — inline text, no pill */
export const PIPELINE_STEP =
  "font-display text-[11px] font-medium tracking-[0.02em] text-[var(--text-secondary)]";

/** Arrow between pipeline steps */
export const PIPELINE_ARROW = "shrink-0 text-[10px] text-[var(--text-muted)]";

/** Status line — dot + label */
export const STATUS_PILL_OK =
  "inline-flex items-center gap-1.5 font-display text-[11px] font-medium tracking-[0.02em] text-[var(--text-secondary)]";

export const STATUS_DOT_OK =
  "h-[5px] w-[5px] shrink-0 rounded-full bg-[rgba(245,243,238,0.55)]";

/** Inline anomaly-type tags */
export const INLINE_TEXT_TAG =
  "inline-flex items-center rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-[7px] py-[2px] font-display text-[10px] font-semibold tracking-[0.05em] text-[var(--text-secondary)]";

/** Dividers inside cards */
export const CARD_DIVIDER = "border-[var(--border-subtle)]";

/** Key KPI / metric numbers */
export const VALUE_KPI =
  "font-data font-medium text-[var(--text-primary)] tabular-nums";

export const VALUE_CRITICAL =
  "font-data font-medium text-[var(--accent-primary)] tabular-nums";

export const VALUE_POSITIVE =
  "font-data font-medium text-[var(--text-primary)] tabular-nums";

/** Card shell — aligns with .card-surface in globals */
export const CARD_SHELL = "";

export const CARD_HEADER_DIVIDER = `border-b ${CARD_DIVIDER}`;

export function metricValueClass(
  severity?: AnomalySeverity | null,
  options?: { positive?: boolean },
): string {
  if (options?.positive) return VALUE_POSITIVE;
  if (severity === "Critical") return VALUE_CRITICAL;
  return VALUE_KPI;
}
