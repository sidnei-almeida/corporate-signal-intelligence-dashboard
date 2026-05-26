import { INLINE_TEXT_TAG, STATUS_PILL_OK } from "@/lib/cardVisuals";

export const ANOMALY_TYPE_CHIP = INLINE_TEXT_TAG;

/** Minimal status line — dot + label, no pill */
export const STATUS_BADGE =
  "inline-flex items-center gap-1.5 font-display text-[11px] font-medium tracking-[0.02em] text-[var(--text-muted)]";

export const STATUS_BADGE_OK = STATUS_PILL_OK;
