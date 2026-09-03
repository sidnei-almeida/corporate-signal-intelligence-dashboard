import { json } from "@/server/http";
import { PANEL_STATS } from "@/server/panel";
import { isGroqConfigured } from "@/server/briefings";

/**
 * Service health.
 *
 * The database fields are kept in the payload because the client still reads them, but
 * they are now always false: the panel ships with the build, so there is no external
 * store to be connected to or populated from.
 */
export function GET() {
  return json({
    status: "ok",
    service: "Corporate Signal Intelligence",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    data_source: "embedded",
    database_configured: false,
    database_connected: false,
    database_populated: false,
    model_available: true,
    briefings_available: isGroqConfigured(),
    rows: PANEL_STATS.totalRows,
    tickers: PANEL_STATS.tickers.length,
  });
}
