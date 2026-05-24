export function LoadingState({ message = "Loading intelligence data…" }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-start justify-center gap-4 sm:items-center sm:text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
