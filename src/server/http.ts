/**
 * Response helpers shared by the route handlers.
 *
 * The client's error path reads `detail` off a failed response, which is the shape the
 * FastAPI service used. Keeping it means `src/lib/api.ts` did not have to change when the
 * backend moved in here.
 */

import { NextResponse } from "next/server";

export function json<T>(payload: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(payload, {
    ...init,
    headers: { "Cache-Control": "no-store", ...init?.headers },
  });
}

export function errorResponse(status: number, detail: string): NextResponse {
  return json({ detail }, { status });
}

/** Read a numeric query parameter, falling back when it is absent or unparseable. */
export function numberParam(
  params: URLSearchParams,
  name: string,
  fallback: number,
): number {
  const raw = params.get(name);
  if (raw === null) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Clamp a caller-supplied row limit so one request cannot ask for the whole panel. */
export function limitParam(params: URLSearchParams, fallback: number, max = 1000): number {
  return Math.max(1, Math.min(max, Math.trunc(numberParam(params, "limit", fallback))));
}
