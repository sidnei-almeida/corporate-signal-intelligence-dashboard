import type { SelectHTMLAttributes, ReactNode } from "react";
import { TYPE_LABEL } from "@/lib/typography";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  label?: string;
  className?: string;
}

export function Select({ children, label, className = "", id, ...props }: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label
          htmlFor={selectId}
          className={TYPE_LABEL}
        >
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`input-surface rounded-lg px-3 py-2 text-sm ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
