import { formatAnomalyTypeLabel } from "@/lib/formatters";
import { ANOMALY_TYPE_CHIP } from "@/lib/badgeStyles";

interface AnomalyTypeTagsProps {
  types: string[];
  /** inline: "Price spike · Volume spike" — chips: subtle neutral badges */
  variant?: "inline" | "chips";
  className?: string;
  maxItems?: number;
}

export function AnomalyTypeTags({
  types,
  variant = "chips",
  className = "",
  maxItems,
}: AnomalyTypeTagsProps) {
  const labels = (maxItems ? types.slice(0, maxItems) : types).map(formatAnomalyTypeLabel);

  if (labels.length === 0) return null;

  if (variant === "inline") {
    return (
      <span className={`text-xs leading-relaxed text-[var(--text-tertiary)] ${className}`}>
        {labels.join(" · ")}
      </span>
    );
  }

  return (
    <span className={`flex flex-wrap gap-1.5 ${className}`}>
      {labels.map((label) => (
        <span key={label} className={ANOMALY_TYPE_CHIP}>
          {label}
        </span>
      ))}
    </span>
  );
}
