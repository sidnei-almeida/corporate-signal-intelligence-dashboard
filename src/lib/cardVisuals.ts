/** Card & inner-surface visual tokens — Tailwind only (globals.css untouched) */

import type { AnomalySeverity } from "@/lib/types";

/** Section / field label (PIPELINE FLOW, ENGINE, etc.) */
export const SECTION_LABEL =
  "font-display text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] leading-[1.25]";

/** Value below a section label */
export const SECTION_VALUE =
  "font-data text-sm font-medium text-[var(--text-primary)]";

/** Inner metric / sub-cells inside cards */
export const METRIC_CELL =
  "rounded-md border border-[rgba(0,212,255,0.08)] bg-[rgba(255,255,255,0.03)] transition-colors duration-150 hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(0,212,255,0.15)]";

/** Pipeline / flow step pill */
export const PIPELINE_STEP =
  "inline-flex items-center rounded-[20px] border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.06)] px-[10px] py-[3px] font-display text-[11px] font-semibold tracking-[0.06em] text-[#00D4FF]";

/** Arrow between pipeline steps */
export const PIPELINE_ARROW = "shrink-0 text-[10px] text-[rgba(0,212,255,0.3)]";

/** Status pill — API Online, Artifact loaded */
export const STATUS_PILL_OK =
  "inline-flex items-center gap-1.5 rounded-[20px] border border-[rgba(0,229,160,0.2)] bg-[rgba(0,229,160,0.08)] px-[10px] py-[2px] font-display text-[10px] font-bold uppercase tracking-[0.08em] text-[#00E5A0]";

export const STATUS_DOT_OK =
  "h-[5px] w-[5px] shrink-0 rounded-full bg-[#00E5A0] shadow-[0_0_6px_#00E5A0]";

/** Inline anomaly-type tags (Price spike, etc.) */
export const INLINE_TEXT_TAG =
  "inline-flex items-center rounded border border-[rgba(0,212,255,0.12)] bg-[rgba(0,212,255,0.06)] px-[7px] py-[2px] font-display text-[10px] font-semibold tracking-[0.05em] text-[rgba(232,237,245,0.7)]";

/** Dividers inside cards */
export const CARD_DIVIDER = "border-[rgba(0,212,255,0.06)]";

/** Key KPI / metric numbers */
export const VALUE_KPI =
  "font-data font-medium text-[#00D4FF] [text-shadow:0_0_20px_rgba(0,212,255,0.35)] tabular-nums";

export const VALUE_CRITICAL =
  "font-data font-medium text-[#FF4560] [text-shadow:0_0_16px_rgba(255,69,96,0.3)] tabular-nums";

export const VALUE_POSITIVE =
  "font-data font-medium text-[#00E5A0] tabular-nums";

/** Main card shell (mirrors .card-surface without editing globals) */
export const CARD_SHELL =
  "relative w-full max-w-none rounded-xl border border-[rgba(0,212,255,0.08)] bg-[rgba(255,255,255,0.028)] backdrop-blur-[12px] transition-[border-color,background] duration-200 ease-in-out hover:border-[rgba(0,212,255,0.15)] hover:bg-[rgba(255,255,255,0.045)]";

export const CARD_HEADER_DIVIDER = `border-b ${CARD_DIVIDER}`;

export function metricValueClass(
  severity?: AnomalySeverity | null,
  options?: { positive?: boolean },
): string {
  if (options?.positive) return VALUE_POSITIVE;
  if (severity === "Critical") return VALUE_CRITICAL;
  return VALUE_KPI;
}
