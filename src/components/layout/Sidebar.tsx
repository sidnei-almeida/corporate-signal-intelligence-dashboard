"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductMark } from "@/components/brand";
import { NAV_ICON_BY_HREF } from "@/components/icons";
import {
  APP_NAME,
  DASHBOARD_NAV,
  SIDEBAR_FOOTER_SOURCES,
  SIDEBAR_FOOTER_STACK,
} from "@/lib/constants";

export const SIDEBAR_WIDTH_PX = 232;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)]"
      style={{ width: SIDEBAR_WIDTH_PX }}
    >
      <div className="flex h-full flex-col px-3 py-5">
        <header className="mb-7 border-b border-[var(--border-card)] px-1 pb-5">
          <div className="flex items-center gap-2.5">
            <ProductMark size={24} className="shrink-0 text-[var(--accent-primary)]" />
            <p className="text-sm font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
              {APP_NAME}
            </p>
          </div>
        </header>

        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {DASHBOARD_NAV.map(({ label, href }) => {
            const Icon = NAV_ICON_BY_HREF[href];
            const active = isActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                className={`group flex h-10 items-center gap-2.5 rounded-md px-3 text-[13px] font-medium transition-colors duration-150 ${
                  active ? "nav-active" : "nav-inactive border border-transparent"
                }`}
              >
                {Icon ? (
                  <Icon
                    size={15}
                    className={`shrink-0 transition-colors ${
                      active
                        ? "text-[var(--accent-primary)]"
                        : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                    }`}
                  />
                ) : null}
                {label}
              </Link>
            );
          })}
        </nav>

        <footer className="mt-auto border-t border-[var(--border-card)] px-1 pt-4">
          <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
            {SIDEBAR_FOOTER_SOURCES}
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
            {SIDEBAR_FOOTER_STACK}
          </p>
        </footer>
      </div>
    </aside>
  );
}
