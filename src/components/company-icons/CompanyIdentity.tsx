import type { ReactNode } from "react";
import { CompanyIcon } from "@/components/company-icons/CompanyIcon";
import { formatTicker } from "@/lib/formatters";
import { TYPE_TICKER } from "@/lib/typography";

interface CompanyIdentityProps {
  ticker: string;
  name?: string | null;
  meta?: ReactNode;
  trailing?: ReactNode;
  size?: "sm" | "md";
  className?: string;
  /** Show logo in a compact card aligned to the ticker row */
  showLogoCard?: boolean;
}

export function CompanyIdentity({
  ticker,
  name,
  meta,
  trailing,
  size = "md",
  className = "",
  showLogoCard = true,
}: CompanyIdentityProps) {
  const iconSize = size === "sm" ? 16 : 22;
  const tickerClass =
    size === "sm"
      ? `${TYPE_TICKER} text-sm font-semibold leading-tight`
      : `${TYPE_TICKER} text-lg font-semibold leading-tight tracking-tight`;

  const logo = (
    <CompanyIcon
      ticker={ticker}
      size={iconSize}
      variant="brand"
      className="company-icon--card"
    />
  );

  return (
    <div
      className={`company-identity company-identity--${size} ${className}`.trim()}
    >
      {showLogoCard ? (
        <div className="company-logo-card ticker-logo company-logo" aria-hidden>
          {logo}
        </div>
      ) : (
        logo
      )}
      <div className="company-identity-body min-w-0">
        <div className="company-identity-primary">
          <span className={`ticker-name company-name ${tickerClass}`}>{formatTicker(ticker)}</span>
          {trailing}
        </div>
        {name ? (
          <p className="company-identity-name truncate">{name}</p>
        ) : null}
        {meta ? <div className="company-identity-meta">{meta}</div> : null}
      </div>
    </div>
  );
}

/** Inline ticker + small brand icon for tables */
export function CompanyTickerCell({
  ticker,
  className = "",
}: {
  ticker: string;
  className?: string;
}) {
  return (
    <span className={`company-ticker-cell ${className}`.trim()}>
      <span className="company-ticker-cell-icon">
        <CompanyIcon ticker={ticker} size={15} variant="brand" />
      </span>
      <span className={`${TYPE_TICKER} font-semibold`}>{formatTicker(ticker)}</span>
    </span>
  );
}
