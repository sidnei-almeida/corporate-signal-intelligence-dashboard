"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, FileText, Radar } from "lucide-react";
import { APP_NAME, DASHBOARD_NAV } from "@/lib/constants";

const navIcons = [Radar, BarChart3, Building2, FileText] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 shrink-0 border-r border-white/5 bg-zinc-950/95 backdrop-blur-sm lg:flex lg:flex-col">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Navigation
          </p>
          <p className="mt-1 text-xs text-slate-400">{APP_NAME}</p>
        </div>
        <nav className="flex flex-col gap-1">
          {DASHBOARD_NAV.map(({ label, href }, index) => {
            const Icon = navIcons[index] ?? Radar;
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "border border-cyan-500/25 bg-cyan-500/10 text-cyan-100"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? "text-cyan-400" : "text-cyan-500/70"}`}
                />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-white/5 bg-zinc-900/50 p-3 text-[11px] leading-relaxed text-slate-500">
          Stooq · SEC EDGAR · Isolation Forest · Groq briefings
        </div>
      </div>
    </aside>
  );
}
