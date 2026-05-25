/** Typography — Syne UI, JetBrains Mono data */

import {
  SECTION_LABEL,
  SECTION_VALUE,
  VALUE_CRITICAL,
  VALUE_KPI,
  VALUE_POSITIVE,
} from "@/lib/cardVisuals";

export const TYPE_LABEL = SECTION_LABEL;

export const TYPE_DATA = "font-data";

export const TYPE_TICKER = "font-data font-medium text-[var(--text-primary)]";

export const TYPE_METRIC = `${VALUE_KPI} text-[2.5rem] leading-[1.2]`;

export const TYPE_PAGE_TITLE =
  "font-display text-2xl font-bold tracking-[-0.03em] text-[var(--text-primary)] md:text-3xl";

export const TYPE_PAGE_SUBTITLE =
  "font-display text-sm font-normal leading-relaxed text-[var(--text-secondary)]";

export const TYPE_CARD_TITLE =
  "font-display text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)] md:text-[15px]";

export const TYPE_CARD_SUBTITLE =
  "font-display mt-1 text-xs font-normal leading-relaxed text-[var(--text-muted)] 2xl:text-sm";

export const TYPE_TABLE_HEAD = "table-head-cell";

export const TYPE_TABLE_DATA = "font-data text-[var(--text-secondary)]";

export const TYPE_DATA_ACCENT = VALUE_KPI;

export const TYPE_VALUE_CRITICAL = VALUE_CRITICAL;

export const TYPE_VALUE_POSITIVE = VALUE_POSITIVE;

export const TYPE_SECTION_VALUE = SECTION_VALUE;

export const TYPE_TABLE_BODY = "text-xs leading-normal 2xl:text-sm";
