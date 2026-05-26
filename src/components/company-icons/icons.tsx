import type { ReactNode, SVGProps } from "react";
import {
  BRAND_FALLBACK,
  getCompanyBrand,
  type CompanyBrandColors,
} from "@/lib/companyBrand";

export interface CompanyIconGlyphProps extends SVGProps<SVGSVGElement> {
  size?: number;
  brand?: CompanyBrandColors;
}

function Glyph({
  size = 18,
  className = "",
  children,
  viewBox = "0 0 24 24",
  ...props
}: CompanyIconGlyphProps & { children: ReactNode }) {
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

const s = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconIssuer({
  size,
  className,
  brand = BRAND_FALLBACK,
}: CompanyIconGlyphProps) {
  return (
    <Glyph size={size} className={className}>
      <path d="M4 20V8l8-4 8 4v12" {...s} stroke={brand.secondary} />
      <path d="M9 20v-6h6v6" {...s} stroke={brand.primary} />
      <path d="M4 8l8 4 8-4" {...s} stroke={brand.primary} strokeOpacity={0.7} />
    </Glyph>
  );
}

export function IconAapl({ size, className, brand }: CompanyIconGlyphProps) {
  const c = brand ?? getCompanyBrand("AAPL");
  return (
    <Glyph size={size} className={className}>
      <path
        d="M15.8 11.2c.1-1.8 1.5-2.7 1.6-2.8-1-.1-1.7-.5-2.2-1.2-.5-.7-.8-1.7-.8-2.7 0-1 .2-1.9.8-2.7-.8-.1-1.6.4-2 1-.5.6-.8 1.5-.7 2.4-.7-.1-1.4.3-1.7 1-.4.8-.3 1.9.2 2.7.3.5.9 1.1 1.6 1 .6-.1.9-.4 1.7-.4s1.1.4 1.8.4c.7-.1 1.2-.5 1.6-1 .4-.6.6-1.3.6-2-.7-.3-1.4-.7-1.9-1.3z"
        fill={c.primary}
      />
      <path
        d="M13.5 19.8c-.5.9-1.3 1.6-2.2 1.5-1-.1-1.2-.6-2.3-.6-1.1 0-1.3.6-2.3.7-1 .1-1.8-.7-2.3-1.7-1.2-2.1-1-5 .4-6.2.7-.8 1.7-1.2 2.6-1.1.7.1 1.3.4 2 .4.6 0 1.4-.5 2.3-.4 1 .1 1.7.5 2.2 1.2-1.9 1.1-1.6 4 .4 4.9z"
        fill={c.primary}
      />
      <path
        d="M16.2 5.8c.6-.7 1-1.7.9-2.7-.9.1-1.9.6-2.5 1.3-.6.7-1.1 1.8-.9 2.8 1 .1 2-.5 2.5-1.4z"
        fill={c.secondary}
      />
    </Glyph>
  );
}

export function IconMsft({ size, className, brand }: CompanyIconGlyphProps) {
  const c = brand ?? getCompanyBrand("MSFT");
  return (
    <Glyph size={size} className={className}>
      <rect x="3" y="3" width="8.5" height="8.5" rx="0.5" fill={c.primary} />
      <rect x="12.5" y="3" width="8.5" height="8.5" rx="0.5" fill={c.secondary} />
      <rect x="3" y="12.5" width="8.5" height="8.5" rx="0.5" fill={c.tertiary ?? c.secondary} />
      <rect
        x="12.5"
        y="12.5"
        width="8.5"
        height="8.5"
        rx="0.5"
        fill={c.quaternary ?? c.primary}
        fillOpacity={0.75}
      />
    </Glyph>
  );
}

/** Google "G" — warm quad-tone (no saturated brand blue/red/green) */
export function IconGoogl({ size, className, brand }: CompanyIconGlyphProps) {
  const c = brand ?? getCompanyBrand("GOOGL");
  return (
    <Glyph size={size} className={className}>
      <path
        d="M12 4a8 8 0 1 0 0 16c2.2 0 4.2-.9 5.6-2.3l-2-2A5 5 0 1 1 12 7c1.4 0 2.6.5 3.6 1.4l2.7-2.7C16.2 4.5 14.2 4 12 4z"
        fill={c.primary}
      />
      <path
        d="M21.6 12.3H12v3h5.4a5 5 0 0 1-2.1 3.3l2 2c2-1.8 3.2-4.5 3.2-7.6 0-.6-.1-1.1-.2-1.7z"
        fill={c.secondary}
      />
      <path
        d="M12 21c2.7 0 5-1 6.6-2.6l-2-2A5 5 0 0 1 12 17c-1.5 0-2.8-.6-3.8-1.6l-2.7 2.7C8.2 19.5 10 21 12 21z"
        fill={c.tertiary ?? c.secondary}
      />
      <path
        d="M5.4 14.7A5 5 0 0 1 5 12c0-.9.2-1.8.5-2.6L3.2 7.1A8 8 0 0 0 4 12a8 8 0 0 0 1.4 4.7l2-2z"
        fill={c.quaternary ?? c.primary}
      />
      <path d="M5 12h7V9H5v3z" fill={c.primary} fillOpacity={0.9} />
    </Glyph>
  );
}

export function IconMeta({ size, className, brand }: CompanyIconGlyphProps) {
  const c = brand ?? getCompanyBrand("META");
  return (
    <Glyph size={size} className={className}>
      <path
        d="M8.5 12c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5-1.8 4.5-4 4.5-4-2-4-4.5z"
        {...s}
        stroke={c.primary}
        fill={c.primary}
        fillOpacity={0.15}
      />
      <path
        d="M15.5 12c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5-1.8 4.5-4 4.5-4-2-4-4.5z"
        {...s}
        stroke={c.secondary}
        fill={c.secondary}
        fillOpacity={0.12}
      />
    </Glyph>
  );
}

export function IconAmzn({ size, className, brand }: CompanyIconGlyphProps) {
  const c = brand ?? getCompanyBrand("AMZN");
  return (
    <Glyph size={size} className={className}>
      <path
        d="M4 16.5c2.8-1 5.8-1.5 8.8-1.5"
        stroke={c.primary}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M14.5 15l4.5 1.5-1.8-4"
        stroke={c.primary}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 8.5h11c0-2.2-2.8-3.8-5.5-3.8S6.5 6.3 6.5 8.5z"
        {...s}
        stroke={c.secondary}
      />
      <path d="M12 5.2v2" {...s} stroke={c.secondary} strokeOpacity={0.6} />
    </Glyph>
  );
}

/** Tesla "T" emblem */
export function IconTsla({ size, className, brand }: CompanyIconGlyphProps) {
  const c = brand ?? getCompanyBrand("TSLA");
  return (
    <Glyph size={size} className={className}>
      <path d="M12 4v16" stroke={c.primary} strokeWidth={2} strokeLinecap="round" />
      <path d="M6.5 4h11" stroke={c.primary} strokeWidth={2} strokeLinecap="round" />
      <path
        d="M8.5 4c0-1.2 1.6-2.2 3.5-2.2s3.5 1 3.5 2.2"
        {...s}
        stroke={c.secondary}
        fill={c.secondary}
        fillOpacity={0.2}
      />
    </Glyph>
  );
}

/** NVIDIA eye mark */
export function IconNvda({ size, className, brand }: CompanyIconGlyphProps) {
  const c = brand ?? getCompanyBrand("NVDA");
  return (
    <Glyph size={size} className={className}>
      <path
        d="M12 5.5c3.8 0 6.8 2 6.8 4.5S15.8 14.5 12 14.5 5.2 12.5 5.2 10 8.2 5.5 12 5.5z"
        {...s}
        stroke={c.primary}
        fill={c.primary}
        fillOpacity={0.12}
      />
      <path
        d="M12 8.2c1.8 0 3.2.9 3.2 2s-1.4 2-3.2 2-3.2-.9-3.2-2 1.4-2 3.2-2z"
        fill={c.secondary}
        fillOpacity={0.85}
      />
      <circle cx="12" cy="10.2" r="0.9" fill={c.primary} />
    </Glyph>
  );
}

export function IconIntc({ size, className, brand }: CompanyIconGlyphProps) {
  const c = brand ?? getCompanyBrand("INTC");
  return (
    <Glyph size={size} className={className}>
      <ellipse cx="12" cy="12" rx="9" ry="6" {...s} stroke={c.primary} fill={c.primary} fillOpacity={0.1} />
      <ellipse cx="12" cy="12" rx="5" ry="3.2" fill={c.secondary} fillOpacity={0.55} />
      <path d="M7 12h10" stroke={c.primary} strokeOpacity={0.35} strokeWidth={1} />
    </Glyph>
  );
}

export function IconAmd({ size, className, brand }: CompanyIconGlyphProps) {
  const c = brand ?? getCompanyBrand("AMD");
  return (
    <Glyph size={size} className={className}>
      <rect x="4" y="6" width="3" height="12" rx="0.5" fill={c.primary} />
      <path
        d="M9 12h9l-4.5-5.5L9 12zm0 0l4.5 5.5L18 12H9z"
        fill={c.secondary}
      />
    </Glyph>
  );
}

export function IconOrcl({ size, className, brand }: CompanyIconGlyphProps) {
  const c = brand ?? getCompanyBrand("ORCL");
  return (
    <Glyph size={size} className={className}>
      <ellipse cx="12" cy="12" rx="9" ry="4" {...s} stroke={c.primary} fill={c.primary} fillOpacity={0.15} />
      <ellipse
        cx="12"
        cy="12"
        rx="9"
        ry="4"
        {...s}
        stroke={c.secondary}
        fill={c.secondary}
        fillOpacity={0.08}
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9"
        ry="4"
        {...s}
        stroke={c.primary}
        fill={c.primary}
        fillOpacity={0.05}
        transform="rotate(120 12 12)"
      />
    </Glyph>
  );
}

export type CompanyIconComponent = typeof IconIssuer;

export const COMPANY_ICON_MAP: Record<string, CompanyIconComponent> = {
  AAPL: IconAapl,
  MSFT: IconMsft,
  GOOGL: IconGoogl,
  META: IconMeta,
  AMZN: IconAmzn,
  TSLA: IconTsla,
  NVDA: IconNvda,
  INTC: IconIntc,
  AMD: IconAmd,
  ORCL: IconOrcl,
};
