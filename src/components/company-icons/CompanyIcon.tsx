import { formatTicker } from "@/lib/formatters";
import {
  COMPANY_LOGO_ON_DARK_FIX,
  getCompanyLogoSrc,
  hasCompanyLogoFile,
} from "@/lib/companyLogos";
import { getCompanyBrand } from "@/lib/companyBrand";
import { COMPANY_ICON_MAP, IconIssuer } from "@/components/company-icons/icons";

export type CompanyIconVariant = "brand" | "mono";

interface CompanyIconProps {
  ticker: string;
  size?: number;
  className?: string;
  variant?: CompanyIconVariant;
}

export function CompanyIcon({
  ticker,
  size = 18,
  className = "",
  variant = "brand",
}: CompanyIconProps) {
  const key = formatTicker(ticker);
  const logoSrc = variant === "brand" ? getCompanyLogoSrc(key) : null;

  if (logoSrc) {
    const darkFix = COMPANY_LOGO_ON_DARK_FIX.has(key);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoSrc}
        alt=""
        width={size}
        height={size}
        className={[
          "company-logo-img",
          `company-logo-img--${key.toLowerCase()}`,
          darkFix ? "company-logo-img--on-dark" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  const Icon = COMPANY_ICON_MAP[key] ?? IconIssuer;
  const brand = variant === "brand" ? getCompanyBrand(key) : undefined;

  return (
    <Icon
      size={size}
      brand={brand}
      className={`company-icon company-icon--${variant} ${className}`.trim()}
      aria-hidden
    />
  );
}

export function hasCompanyIcon(ticker: string): boolean {
  const key = formatTicker(ticker);
  return hasCompanyLogoFile(key) || key in COMPANY_ICON_MAP;
}
