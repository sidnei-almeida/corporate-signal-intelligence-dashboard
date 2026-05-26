/** Ticker → SVG filename in /public/logos/ */

export const COMPANY_LOGO_FILES: Record<string, string> = {
  AAPL: "apple-13.svg",
  AMD: "amd-logo-1.svg",
  AMZN: "amazon-simple.svg",
  GOOGL: "google-g-2015.svg",
  INTC: "intel.svg",
  META: "meta-3.svg",
  MSFT: "microsoft-5.svg",
  NVDA: "nvidia.svg",
  ORCL: "oracle-corporation-logo.svg",
  TSLA: "tesla-pure.svg",
};

/**
 * Logos still needing CSS boost on dark UI (wordmarks / residual dark fills).
 * Prefer editing SVG fills in public/logos when possible.
 */
export const COMPANY_LOGO_ON_DARK_FIX = new Set<string>([]);

export function getCompanyLogoSrc(ticker: string): string | null {
  const key = ticker.trim().toUpperCase();
  const file = COMPANY_LOGO_FILES[key];
  return file ? `/logos/${file}` : null;
}

export function hasCompanyLogoFile(ticker: string): boolean {
  return ticker.trim().toUpperCase() in COMPANY_LOGO_FILES;
}
