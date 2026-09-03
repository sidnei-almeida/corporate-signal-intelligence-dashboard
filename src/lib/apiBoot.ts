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

// The API is served by this deployment, so a failure here is a real failure rather than
// a container still starting. A couple of quick retries cover a serverless cold start;
// beyond that, retrying only delays the error the user needs to see.
const WAKE_INTERVAL_MS = 600;
const MAX_WAKE_ATTEMPTS = 5;

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
 * Polls /health until the in-app API answers, then reads the model metadata.
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

  let health: HealthResponse | null = null;
  let lastError: ApiError | null = null;

  for (let attempt = 1; attempt <= MAX_WAKE_ATTEMPTS; attempt++) {
    if (signal?.aborted) {
      throw new ApiError("Connection cancelled.", 0, "/health");
    }

    onProgress?.({
      phase: "waking",
      attempt,
      message: attempt === 1 ? "Starting API" : `Starting API (${attempt})`,
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
      new ApiError("The API did not respond. Please retry.", 0, "/health")
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

  // The remaining steps are presentational. Health and model metadata now answer in a
  // few milliseconds, so without a short pause the boot sequence would flash past before
  // it could be read.
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
