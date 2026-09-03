import type { AnomalyRecord, AnomalySeverity } from "./types";
import { formatTicker, severityOf, splitAnomalyTypes } from "./formatters";

export interface AnomalyFilterState {
  ticker: string;
  severity: string;
  anomalyType: string;
  typeSearch?: string;
}

export function filterAnomalyRecords(
  records: AnomalyRecord[],
  filters: AnomalyFilterState,
): AnomalyRecord[] {
  return records.filter((record) => {
    if (filters.ticker) {
      if (formatTicker(record.ticker) !== formatTicker(filters.ticker)) {
        return false;
      }
    }
    if (filters.severity) {
      // The tier the API attached, falling back to the local cutoffs, so the filter and
      // the badge in the row can never disagree.
      if (severityOf(record) !== (filters.severity as AnomalySeverity)) {
        return false;
      }
    }
    if (filters.anomalyType) {
      const types = splitAnomalyTypes(String(record.anomaly_type ?? ""));
      if (!types.includes(filters.anomalyType)) {
        return false;
      }
    }
    if (filters.typeSearch?.trim()) {
      const hay = String(record.anomaly_type ?? "").toLowerCase();
      if (!hay.includes(filters.typeSearch.trim().toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}
