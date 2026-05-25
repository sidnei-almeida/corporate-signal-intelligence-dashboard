import type { ComponentType, ReactNode, SVGProps } from "react";

export interface DashboardIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  children: ReactNode;
}

export function DashboardIcon({
  size = 16,
  children,
  className = "",
  viewBox = "0 0 16 16",
  ...props
}: DashboardIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Nav: overview — four metric bars */
export function IconOverview({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M2 12V8M5.5 12V5M9 12V9M13 12V3" {...stroke} />
    </DashboardIcon>
  );
}

/** Nav: anomalies — line chart with spike */
export function IconAnomalies({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M2 11L5 8L8 9L11 4L14 6" {...stroke} />
      <circle cx="11" cy="4" r="1" fill="currentColor" />
    </DashboardIcon>
  );
}

/** Nav: companies — issuer bars */
export function IconCompanies({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M3 12V9M7 12V4M11 12V7M14 12V6" {...stroke} />
    </DashboardIcon>
  );
}

/** Nav: briefings — document + sparkline */
export function IconBriefings({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M4 2.5h6.5a1 1 0 0 1 1 1V13.5H4V2.5Z" {...stroke} />
      <path d="M6 10.5h4M6 8.5L8.5 7L11 8.5" {...stroke} />
    </DashboardIcon>
  );
}

export const NAV_ICON_BY_HREF: Record<string, DashboardIconComponent> = {
  "/": IconOverview,
  "/anomalies": IconAnomalies,
  "/companies": IconCompanies,
  "/briefings": IconBriefings,
};

/** KPI: monitored universe */
export function IconKpiUniverse({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M2 12h12M4 12V8M8 12V5M12 12V9" {...stroke} />
    </DashboardIcon>
  );
}

/** KPI: anomaly count */
export function IconKpiAnomalies({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M2 10.5L5.5 7L8.5 8.5L11 3.5L14 6" {...stroke} />
    </DashboardIcon>
  );
}

/** KPI: rate */
export function IconKpiRate({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M8 3v10M5.5 5.5A3.5 3.5 0 1 1 10.5 5.5" {...stroke} />
    </DashboardIcon>
  );
}

/** KPI: highest risk */
export function IconKpiRisk({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M3 4.5L8 11l5-6.5" {...stroke} />
    </DashboardIcon>
  );
}

/** KPI: model / pipeline status */
export function IconKpiModel({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M3 8h2l1.5-3L8 11l1.5-2H13" {...stroke} />
    </DashboardIcon>
  );
}

export function IconArrowRight({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M3 8h9M9 5l3 3-3 3" {...stroke} />
    </DashboardIcon>
  );
}

export function IconChevronDown({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M4 6l4 4 4-4" {...stroke} />
    </DashboardIcon>
  );
}

export function IconCopy({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M5.5 3.5h5a1 1 0 0 1 1 1v5.5h-5a1 1 0 0 1-1-1V3.5Z" {...stroke} />
      <path d="M3.5 6.5h5a1 1 0 0 1 1 1v5.5h-5a1 1 0 0 1-1-1V6.5Z" {...stroke} />
    </DashboardIcon>
  );
}

export function IconRefresh({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M11.5 3.5A5 5 0 1 0 13 8" {...stroke} />
      <path d="M13 3.5v2h-2" {...stroke} />
    </DashboardIcon>
  );
}

export function IconSparkline({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M2 10L5.5 7.5L8 9L11 5L14 7" {...stroke} />
    </DashboardIcon>
  );
}

export function IconPointer({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M4 3.5l7.5 3.5-3 1.5-.5 3.5-2-2.5-2 1.5Z" {...stroke} />
    </DashboardIcon>
  );
}

export function IconEye({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M2.5 8s2-3.5 5.5-3.5S13.5 8 13.5 8s-2 3.5-5.5 3.5S2.5 8 2.5 8Z" {...stroke} />
      <circle cx="8" cy="8" r="1.5" {...stroke} />
    </DashboardIcon>
  );
}

export function IconTable({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M3 3.5h10v9H3v-9ZM3 7h10M7 3.5v9" {...stroke} />
    </DashboardIcon>
  );
}

export function IconShield({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <path d="M8 2.5l4.5 2v4c0 2.8-2 4.5-4.5 5-2.5-.5-4.5-2.2-4.5-5v-4L8 2.5Z" {...stroke} />
    </DashboardIcon>
  );
}

export function IconAlert({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <circle cx="8" cy="8" r="5.5" {...stroke} />
      <path d="M8 5.5v3M8 10.5h.01" {...stroke} />
    </DashboardIcon>
  );
}

export function IconCheck({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <circle cx="8" cy="8" r="5.5" {...stroke} />
      <path d="M5.5 8l1.8 1.8L10.5 6.2" {...stroke} />
    </DashboardIcon>
  );
}

export function IconModelEngine({ className, size }: { className?: string; size?: number }) {
  return (
    <DashboardIcon className={className} size={size}>
      <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" {...stroke} />
      <path d="M6 6h4M6 8h2.5M6 10h4" {...stroke} />
    </DashboardIcon>
  );
}

export type DashboardIconComponent = ComponentType<{
  className?: string;
  size?: number;
}>;
