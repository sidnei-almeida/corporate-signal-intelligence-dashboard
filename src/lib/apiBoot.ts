import { ApiError, getHealth, getModelInfo } from "@/lib/api";
import type { HealthResponse, ModelInfo } from "@/lib/types";

export type BootPhase =
  | "checking"
  | "waking"
  | "verifying"
  | "loading"
  | "preparing"
  | "ready"
  | "error";

const WAKE_INTERVAL_MS = 3_500;
const MAX_WAKE_ATTEMPTS = 45;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface BootProgress {
  phase: BootPhase;
  attempt: number;
  message: string;
}

export interface BootResult {
  health: HealthResponse;
  modelInfo: ModelInfo;
}

/**
 * Polls /health until Render responds 200 (cold-start wake-up).
 */
export async function wakeIntelligenceApi(
  onProgress?: (progress: BootProgress) => void,
  signal?: AbortSignal,
): Promise<BootResult> {
  onProgress?.({
    phase: "checking",
    attempt: 0,
    message: "Checking backend",
  });

  await sleep(500);

  let health: HealthResponse | null = null;
  let lastError: ApiError | null = null;

  for (let attempt = 1; attempt <= MAX_WAKE_ATTEMPTS; attempt++) {
    if (signal?.aborted) {
      throw new ApiError("Connection cancelled.", 0, "/health");
    }

    onProgress?.({
      phase: "waking",
      attempt,
      message: attempt === 1 ? "Waking API" : `Waking API (${attempt})`,
    });

    try {
      health = await getHealth();
      lastError = null;
      break;
    } catch (err) {
      lastError =
        err instanceof ApiError
          ? err
          : new ApiError("Unable to reach the monitoring API.", 0, "/health");

      if (attempt < MAX_WAKE_ATTEMPTS) {
        await sleep(WAKE_INTERVAL_MS);
      }
    }
  }

  if (!health) {
    throw (
      lastError ??
      new ApiError(
        "The API did not respond in time. The Render service may still be starting — please retry.",
        0,
        "/health",
      )
    );
  }

  onProgress?.({
    phase: "verifying",
    attempt: 0,
    message: "Verifying anomaly model",
  });

  let modelInfo: ModelInfo;
  try {
    modelInfo = await getModelInfo();
  } catch {
    modelInfo = { model_exists: false };
  }

  onProgress?.({
    phase: "loading",
    attempt: 0,
    message: "Loading market signals",
  });

  await sleep(300);

  onProgress?.({
    phase: "preparing",
    attempt: 0,
    message: "Preparing AI briefing service",
  });

  await sleep(300);

  onProgress?.({
    phase: "ready",
    attempt: 0,
    message: "Ready",
  });

  return { health, modelInfo };
}
