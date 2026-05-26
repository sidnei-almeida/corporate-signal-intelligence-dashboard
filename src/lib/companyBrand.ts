/** Warm-harmonized issuer palette — aligned with dashboard amber accent */

export interface CompanyBrandColors {
  primary: string;
  secondary: string;
  tertiary?: string;
  quaternary?: string;
}

/** Muted, institutional tones — no neon brand colors */
export const COMPANY_BRAND: Record<string, CompanyBrandColors> = {
  AAPL: { primary: "#e8e4dc", secondary: "#9aab72" },
  MSFT: {
    primary: "#d97a2b",
    secondary: "#c4783a",
    tertiary: "#8f8460",
    quaternary: "#b5763a",
  },
  GOOGL: {
    primary: "#e8b060",
    secondary: "#d97a2b",
    tertiary: "#c4783a",
    quaternary: "#8f8460",
  },
  META: { primary: "#8b9fd4", secondary: "#d97a2b" },
  AMZN: { primary: "#d97a2b", secondary: "#e8b060" },
  TSLA: { primary: "#c45c42", secondary: "#e8a080" },
  NVDA: { primary: "#6fa882", secondary: "#d97a2b" },
  INTC: { primary: "#6b8eb8", secondary: "#d4a574" },
  AMD: { primary: "#c44d4d", secondary: "#e8a080" },
  ORCL: { primary: "#b85c38", secondary: "#d97a2b" },
};

export const BRAND_FALLBACK: CompanyBrandColors = {
  primary: "#d97a2b",
  secondary: "#a4abb3",
};

export function getCompanyBrand(ticker: string): CompanyBrandColors {
  const key = ticker.trim().toUpperCase();
  return COMPANY_BRAND[key] ?? BRAND_FALLBACK;
}
