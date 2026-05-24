import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = "", children, ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </span>
      )}
      <select
        className={`rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
