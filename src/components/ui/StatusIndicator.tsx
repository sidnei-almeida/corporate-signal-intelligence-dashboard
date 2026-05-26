import { STATUS_DOT_OK } from "@/lib/cardVisuals";
import { STATUS_BADGE, STATUS_BADGE_OK } from "@/lib/badgeStyles";

interface StatusIndicatorProps {
  ok: boolean;
  label: string;
  className?: string;
}

export function StatusIndicator({ ok, label, className = "" }: StatusIndicatorProps) {
  const badgeClass = ok ? STATUS_BADGE_OK : STATUS_BADGE;
  return (
    <span className={`${badgeClass} ${className}`}>
      <span
        className={
          ok
            ? STATUS_DOT_OK
            : "h-[5px] w-[5px] shrink-0 rounded-full bg-[rgba(245,243,238,0.35)]"
        }
        aria-hidden
      />
      {label}
    </span>
  );
}
