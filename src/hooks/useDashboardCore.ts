"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  wakeIntelligenceApi,
  type BootPhase,
  type BootProgress,
} from "@/lib/apiBoot";
import type { HealthResponse, ModelInfo } from "@/lib/types";

export function useDashboardCore() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootPhase, setBootPhase] = useState<BootPhase>("checking");
  const [bootMessage, setBootMessage] = useState("Checking backend");
  const [bootAttempt, setBootAttempt] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const handleProgress = useCallback((progress: BootProgress) => {
    if (!mountedRef.current) return;
    setBootPhase(progress.phase);
    setBootMessage(progress.message);
    setBootAttempt(progress.attempt);
  }, []);

  const runBoot = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setRetrying(true);
    setError(null);
    setReady(false);
    setHealth(null);
    setModelInfo(null);
    setBootPhase("checking");
    setBootMessage("Checking backend");
    setBootAttempt(0);

    try {
      const result = await wakeIntelligenceApi(handleProgress, controller.signal);
      if (controller.signal.aborted || !mountedRef.current) return;

      setHealth(result.health);
      setModelInfo(result.modelInfo);
      setBootPhase("ready");
      setBootMessage("Ready");
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (controller.signal.aborted || !mountedRef.current) return;

      setReady(true);
    } catch (err) {
      if (controller.signal.aborted || !mountedRef.current) return;
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to connect to the monitoring API.";
      setError(message);
      setBootPhase("error");
    } finally {
      if (!controller.signal.aborted && mountedRef.current) {
        setLoading(false);
        setRetrying(false);
      }
    }
  }, [handleProgress]);

  useEffect(() => {
    mountedRef.current = true;
    const timer = window.setTimeout(() => {
      void runBoot();
    }, 0);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [runBoot]);

  const refresh = useCallback(async () => {
    await runBoot();
  }, [runBoot]);

  return {
    health,
    modelInfo,
    ready,
    loading,
    retrying,
    error,
    bootPhase,
    bootMessage,
    bootAttempt,
    refresh,
  };
}
