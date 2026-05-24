import { Select } from "@/components/ui/Select";
import type { Company } from "@/lib/types";
import { formatAnomalyRate, formatTicker } from "@/lib/formatters";

interface CompanySelectorProps {
  companies: Company[];
  selectedTicker: string;
  onSelect: (ticker: string) => void;
}

export function CompanySelector({
  companies,
  selectedTicker,
  onSelect,
}: CompanySelectorProps) {
  const sorted = [...companies].sort((a, b) =>
    a.ticker.localeCompare(b.ticker),
  );

  return (
    <Select
      label="Monitored Company"
      value={selectedTicker}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Select ticker…</option>
      {sorted.map((c) => (
        <option key={c.ticker} value={c.ticker}>
          {formatTicker(c.ticker)}
          {c.anomaly_rate != null
            ? ` · ${formatAnomalyRate(c.anomaly_rate)} anomaly rate`
            : ""}
        </option>
      ))}
    </Select>
  );
}
