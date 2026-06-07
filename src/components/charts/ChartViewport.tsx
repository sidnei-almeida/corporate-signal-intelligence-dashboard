"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ResponsiveContainer } from "recharts";
import { useMobileBreakpoint } from "@/hooks/useMobileBreakpoint";
import { forceChartResize, MOBILE_CHART_HEIGHT_PX } from "@/lib/chartResize";

export interface ChartViewportContext {
  isMobile: boolean;
  yAxisWidth: (desktopWidth: number, mobileWidth?: number) => number;
  tickFontSize: (desktopSize: number, mobileSize?: number) => number;
}

interface ChartViewportProps {
  children: (ctx: ChartViewportContext) => ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Tailwind height classes for desktop (769px+). */
  desktopClassName?: string;
  mobileHeight?: number;
}

const DEFAULT_DESKTOP_CLASS = "h-[280px] md:h-[320px] 2xl:h-[360px]";

function measureNodeWidth(node: HTMLElement): number {
  const own = Math.floor(node.getBoundingClientRect().width);
  if (own > 0) return own;

  let parent: HTMLElement | null = node.parentElement;
  while (parent) {
    const parentWidth = Math.floor(parent.getBoundingClientRect().width);
    if (parentWidth > 0) return parentWidth;
    parent = parent.parentElement;
  }

  if (typeof window !== "undefined") {
    return Math.max(0, window.innerWidth - 32);
  }

  return 0;
}

export function ChartViewport({
  children,
  className = "",
  style,
  desktopClassName = DEFAULT_DESKTOP_CLASS,
  mobileHeight = MOBILE_CHART_HEIGHT_PX,
}: ChartViewportProps) {
  const isMobile = useMobileBreakpoint();
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  const measureWidth = useCallback(() => {
    const node = containerRef.current;
    if (!node) return 0;
    return measureNodeWidth(node);
  }, []);

  const publishWidth = useCallback((width: number) => {
    if (width > 0) {
      setChartWidth((prev) => (prev === width ? prev : width));
    }
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const node = containerRef.current;
    if (!node) return;

    const sync = () => {
      publishWidth(measureWidth());
      forceChartResize();
    };

    const observer = new ResizeObserver(sync);
    observer.observe(node);

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(sync);
    });

    const t100 = window.setTimeout(sync, 100);
    const t300 = window.setTimeout(sync, 300);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(t100);
      window.clearTimeout(t300);
    };
  }, [isMobile, mobileHeight, measureWidth, publishWidth]);

  useEffect(() => {
    if (isMobile && chartWidth > 0) {
      forceChartResize();
    }
  }, [isMobile, chartWidth, mobileHeight]);

  const ctx: ChartViewportContext = {
    isMobile,
    yAxisWidth: (desktopWidth, mobileWidth = 90) =>
      isMobile ? mobileWidth : desktopWidth,
    tickFontSize: (desktopSize, mobileSize = 10) =>
      isMobile ? mobileSize : desktopSize,
  };

  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className={`chart-embedded chart-viewport w-full max-w-full ${className}`}
        data-chart-viewport
        style={{
          ["--mobile-chart-height" as string]: `${mobileHeight}px`,
          height: mobileHeight,
          minHeight: mobileHeight,
          maxHeight: mobileHeight,
          width: "100%",
          maxWidth: "100%",
          ...style,
        }}
      >
        {chartWidth > 0 ? (
          <ResponsiveContainer
            key={`mobile-chart-${chartWidth}-${mobileHeight}`}
            width={chartWidth}
            height={mobileHeight}
            debounce={32}
          >
            {children(ctx)}
          </ResponsiveContainer>
        ) : (
          <div
            className="chart-viewport-placeholder"
            style={{ width: "100%", height: mobileHeight }}
            aria-hidden
          />
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`chart-embedded chart-viewport w-full ${desktopClassName} ${className}`}
      data-chart-viewport
      style={style}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children(ctx)}
      </ResponsiveContainer>
    </div>
  );
}
