/**
 * Product mark — line chart with highlighted anomaly point.
 * Favicon: src/app/icon.svg (same artwork, Forest Dawn palette).
 * Source SVG: src/components/brand/product-mark.svg
 */

interface ProductMarkProps {
  className?: string;
  size?: number;
}

export function ProductMark({
  className = "text-[var(--accent)]",
  size = 28,
}: ProductMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect
        x="5"
        y="7"
        width="22"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.32"
      />
      <line
        x1="7"
        y1="13"
        x2="25"
        y2="13"
        stroke="currentColor"
        strokeWidth="0.65"
        opacity="0.14"
      />
      <line
        x1="7"
        y1="18"
        x2="25"
        y2="18"
        stroke="currentColor"
        strokeWidth="0.65"
        opacity="0.14"
      />
      <line
        x1="11"
        y1="7"
        x2="11"
        y2="25"
        stroke="currentColor"
        strokeWidth="0.65"
        opacity="0.1"
      />
      <line
        x1="21"
        y1="7"
        x2="21"
        y2="25"
        stroke="currentColor"
        strokeWidth="0.65"
        opacity="0.1"
      />
      <path
        d="M8 20.5 L12.5 17.5 L16 18.5 L20 10.5 L24 13.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <circle cx="20" cy="10.5" r="2.35" fill="currentColor" />
      <circle
        cx="20"
        cy="10.5"
        r="4.25"
        stroke="currentColor"
        strokeWidth="0.85"
        opacity="0.38"
      />
    </svg>
  );
}
