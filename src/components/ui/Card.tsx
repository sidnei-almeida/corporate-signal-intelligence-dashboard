import type { ReactNode } from "react";

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
      className={`w-full max-w-none rounded-xl border border-white/[0.08] bg-zinc-950/70 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm ${
        fillHeight ? "flex h-full flex-col" : ""
      } ${className}`}
    >
      {(title || subtitle || action) && (
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/5 px-4 py-4 sm:px-5 2xl:px-6">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-wide text-slate-100 md:text-base">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-slate-500 2xl:text-sm">{subtitle}</p>
            )}
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
