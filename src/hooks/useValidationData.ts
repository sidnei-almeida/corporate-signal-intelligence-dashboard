"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getAttribution,
  getDetectorBenchmark,
  getRegimeBehaviour,
  getValidationProtocol,
  getWalkForward,
} from "@/lib/api";
import type {
  DetectorMetric,
  RegimeBehaviour,
  ShapAttribution,
  ValidationProtocol,
  WalkForwardYear,
} from "@/lib/types";

export function useValidationData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<ValidationProtocol | null>(null);
  const [detectors, setDetectors] = useState<DetectorMetric[]>([]);
  const [walkForward, setWalkForward] = useState<WalkForwardYear[]>([]);
  const [attribution, setAttribution] = useState<ShapAttribution[]>([]);
  const [drivers, setDrivers] = useState<{ driver: string; share_pct: number }[]>([]);
  const [regime, setRegime] = useState<RegimeBehaviour[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The protocol and the benchmark are the page; the rest are sections that can be
      // absent without making the page meaningless.
      const [protocolRes, detectorsRes] = await Promise.all([
        getValidationProtocol(),
        getDetectorBenchmark(),
      ]);
      setProtocol(protocolRes);
      setDetectors(detectorsRes.records);

      const [walkRes, attributionRes, regimeRes] = await Promise.allSettled([
        getWalkForward(),
        getAttribution(),
        getRegimeBehaviour(),
      ]);
      if (walkRes.status === "fulfilled") setWalkForward(walkRes.value.records);
      if (attributionRes.status === "fulfilled") {
        setAttribution(attributionRes.value.features);
        setDrivers(attributionRes.value.drivers);
      }
      if (regimeRes.status === "fulfilled") setRegime(regimeRes.value.records);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to load the validation protocol.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only page bootstrap
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bootstrap
  }, []);

  return {
    loading,
    error,
    protocol,
    detectors,
    walkForward,
    attribution,
    drivers,
    regime,
    refresh,
  };
}
