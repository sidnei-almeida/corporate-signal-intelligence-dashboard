import { IconAlert } from "@/components/icons";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Unable to load dashboard",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--critical-border)] bg-[var(--critical-bg)] px-6 py-12 text-center">
      <IconAlert className="text-[var(--critical-text)]" size={32} />
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
        <p className="mt-2 max-w-lg text-sm text-[var(--text-muted)]">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
