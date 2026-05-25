export function LoadingState({ message = "Loading intelligence data…" }: { message?: string }) {
  return (
    <div className="empty-state min-h-[50vh] w-full">
      <div
        className="empty-state-icon"
        aria-hidden
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border-card)] border-t-[var(--text-secondary)]" />
      </div>
      <p className="empty-state-title">{message}</p>
    </div>
  );
}
