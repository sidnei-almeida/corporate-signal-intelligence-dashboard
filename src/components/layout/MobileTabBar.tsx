"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ICON_BY_HREF } from "@/components/icons";
import { DASHBOARD_NAV } from "@/lib/constants";
import { forceChartResize } from "@/lib/chartResize";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav id="mob-dash-tabs" className="mob-dash-tabs" aria-label="Main navigation">
      {DASHBOARD_NAV.map(({ label, href }) => {
        const Icon = NAV_ICON_BY_HREF[href];
        const active = isActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            className={`mob-dtab${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
            onClick={() => window.setTimeout(forceChartResize, 50)}
          >
            {Icon ? <Icon size={16} /> : null}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
