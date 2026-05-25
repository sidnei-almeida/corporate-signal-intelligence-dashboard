import type { ReactNode } from "react";
import { CARD_HEADER_DIVIDER, CARD_SHELL } from "@/lib/cardVisuals";
import { TYPE_CARD_SUBTITLE, TYPE_CARD_TITLE } from "@/lib/typography";

interface CardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  /** Stretch card body to fill grid row height */
  fillHeight?: boolean;
}

export function Card({
  children,
  className = "",
  id,
  title,
  subtitle,
  action,
  fillHeight = false,
}: CardProps) {
  return (
    <section
      id={id}
      className={`card-surface ${CARD_SHELL} ${
        fillHeight ? "flex h-full flex-col" : ""
      } ${className}`}
    >
      {(title || subtitle || action) && (
        <header
          className={`flex shrink-0 items-start justify-between gap-4 px-4 py-4 sm:px-5 2xl:px-6 ${CARD_HEADER_DIVIDER}`}
        >
          <div className="min-w-0">
            {title && <h2 className={TYPE_CARD_TITLE}>{title}</h2>}
            {subtitle && <p className={TYPE_CARD_SUBTITLE}>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div
        className={`p-4 sm:p-5 2xl:p-6 ${
          fillHeight ? "flex min-h-0 flex-1 flex-col" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}
