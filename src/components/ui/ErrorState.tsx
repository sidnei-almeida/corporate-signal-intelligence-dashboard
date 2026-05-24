import { AlertTriangle } from "lucide-react";
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
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-rose-500/20 bg-rose-950/20 px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-rose-400" />
      <div>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        <p className="mt-2 max-w-lg text-sm text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
