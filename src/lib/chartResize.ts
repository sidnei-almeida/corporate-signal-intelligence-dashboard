export const MOBILE_CHART_HEIGHT_PX = 200;

/** Recharts listens to window resize — dispatch after mobile layout settles. */
export function forceChartResize(): void {
  if (typeof window === "undefined" || window.innerWidth > 768) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  });
}
