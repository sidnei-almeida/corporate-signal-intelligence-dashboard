import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

const variants = {
  primary:
    "bg-[var(--accent-primary)] text-[#050507] hover:bg-[#33ddff] border border-[var(--border-default)] font-display font-medium shadow-[0_0_20px_var(--accent-primary-glow)] transition-colors duration-150",
  secondary:
    "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] backdrop-blur-md font-display font-medium transition-colors duration-150",
  ghost:
    "bg-transparent text-[var(--text-muted)] hover:bg-[rgba(0,212,255,0.06)] hover:text-[var(--text-primary)] border border-transparent font-display font-medium transition-colors duration-150",
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent-primary)]" />
      )}
      {children}
    </button>
  );
}
