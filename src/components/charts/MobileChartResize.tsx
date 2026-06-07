"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { forceChartResize } from "@/lib/chartResize";

/** Keeps Recharts in sync after route changes, orientation, and tab navigation. */
export function MobileChartResize() {
  const pathname = usePathname();

  useEffect(() => {
    forceChartResize();
    const settle = window.setTimeout(forceChartResize, 100);
    return () => window.clearTimeout(settle);
  }, [pathname]);

  useEffect(() => {
    const onOrientation = () => {
      window.setTimeout(forceChartResize, 300);
    };

    forceChartResize();
    window.addEventListener("orientationchange", onOrientation);
    window.addEventListener("resize", forceChartResize);

    return () => {
      window.removeEventListener("orientationchange", onOrientation);
      window.removeEventListener("resize", forceChartResize);
    };
  }, []);

  return null;
}
