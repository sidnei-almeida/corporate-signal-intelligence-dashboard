import { METRIC_CELL, SECTION_LABEL, SECTION_VALUE } from "@/lib/cardVisuals";
import { TYPE_DATA_ACCENT } from "@/lib/typography";

interface MetricCellProps {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
  truncate?: boolean;
  className?: string;
}

export function MetricCell({
  label,
  value,
  highlight,
  mono,
  truncate,
  className = "",
}: MetricCellProps) {
  const valueClass = highlight
    ? `${TYPE_DATA_ACCENT} mt-1 text-sm`
    : mono
      ? `${SECTION_VALUE} mt-1`
      : `${SECTION_VALUE} mt-1`;

  return (
    <div className={`${METRIC_CELL} px-2.5 py-2 ${className}`}>
      <dt className={`spec-label ${SECTION_LABEL}`}>{label}</dt>
      <dd
        className={`spec-value ${valueClass} ${truncate ? "truncate" : ""}`}
        title={truncate ? value : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
