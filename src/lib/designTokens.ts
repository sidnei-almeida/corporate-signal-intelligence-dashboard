/** Central design tokens — use with CSS variables from globals.css */

import {
  CARD_DIVIDER,
  INLINE_TEXT_TAG,
  METRIC_CELL,
  PIPELINE_ARROW,
  PIPELINE_STEP,
  SECTION_LABEL,
  SECTION_VALUE,
  STATUS_DOT_OK,
  STATUS_PILL_OK,
  VALUE_CRITICAL,
  VALUE_KPI,
  VALUE_POSITIVE,
} from "@/lib/cardVisuals";
import {
  TYPE_CARD_SUBTITLE,
  TYPE_CARD_TITLE,
  TYPE_DATA,
  TYPE_DATA_ACCENT,
  TYPE_LABEL,
  TYPE_METRIC,
  TYPE_SECTION_VALUE,
  TYPE_TABLE_BODY,
  TYPE_TABLE_DATA,
  TYPE_TABLE_HEAD,
  TYPE_TICKER,
  TYPE_VALUE_CRITICAL,
  TYPE_VALUE_POSITIVE,
} from "@/lib/typography";

export const SELECTED_ROW =
  "row-selected border transition-colors";

export const SELECTED_ROW_INSET =
  "row-selected border transition-colors";

export const HOVER_ROW = "table-row-hover";

export const ACCENT_VALUE = `${TYPE_DATA_ACCENT} tabular-nums`;

export const ACCENT_TEXT = "text-accent";

export const LINK_ACCENT =
  "text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]";

export const SURFACE_MUTED =
  "bg-[rgba(255,255,255,0.03)] border border-[rgba(0,212,255,0.08)]";

export const METRIC_BOX = METRIC_CELL;

export const DIVIDER = CARD_DIVIDER;

export {
  CARD_DIVIDER,
  INLINE_TEXT_TAG,
  METRIC_CELL,
  PIPELINE_ARROW,
  PIPELINE_STEP,
  SECTION_LABEL,
  SECTION_VALUE,
  STATUS_DOT_OK,
  STATUS_PILL_OK,
  TYPE_CARD_SUBTITLE,
  TYPE_CARD_TITLE,
  TYPE_DATA,
  TYPE_DATA_ACCENT,
  TYPE_LABEL,
  TYPE_METRIC,
  TYPE_SECTION_VALUE,
  TYPE_TABLE_BODY,
  TYPE_TABLE_DATA,
  TYPE_TABLE_HEAD,
  TYPE_TICKER,
  TYPE_VALUE_CRITICAL,
  TYPE_VALUE_POSITIVE,
  VALUE_CRITICAL,
  VALUE_KPI,
  VALUE_POSITIVE,
};
