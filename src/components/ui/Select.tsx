"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { TYPE_LABEL } from "@/lib/typography";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  label?: string;
  className?: string;
}

interface ParsedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

function parseOptions(children: ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{
      value?: string;
      disabled?: boolean;
      children?: ReactNode;
    }>;
    if (el.type !== "option") return;

    options.push({
      value: String(el.props.value ?? ""),
      label: el.props.children,
      disabled: el.props.disabled,
    });
  });

  return options;
}

function ChevronIcon() {
  return (
    <svg
      className="custom-select-chevron"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden
    >
      <path
        fill="currentColor"
        fillOpacity="0.5"
        d="M6 8L1 3h10z"
      />
    </svg>
  );
}

export function Select({
  children,
  label,
  className = "",
  id,
  value = "",
  onChange,
  disabled,
  name,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : generatedId);
  const listboxId = `${selectId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const options = parseOptions(children);
  const stringValue = value == null ? "" : String(value);
  const selectedOption =
    options.find((o) => o.value === stringValue) ?? options[0];
  const displayLabel = selectedOption?.label ?? stringValue;

  const enabledOptions = options.filter((o) => !o.disabled);

  const fireChange = useCallback(
    (nextValue: string) => {
      onChange?.({
        target: { value: nextValue, name: name ?? "" },
        currentTarget: { value: nextValue, name: name ?? "" },
      } as ChangeEvent<HTMLSelectElement>);
    },
    [onChange, name],
  );

  const selectValue = useCallback(
    (nextValue: string) => {
      fireChange(nextValue);
      setOpen(false);
      setHighlightIndex(-1);
    },
    [fireChange],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          const idx = enabledOptions.findIndex((o) => o.value === stringValue);
          setHighlightIndex(idx >= 0 ? idx : 0);
        } else if (highlightIndex >= 0 && enabledOptions[highlightIndex]) {
          selectValue(enabledOptions[highlightIndex].value);
        }
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        setHighlightIndex(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          const idx = enabledOptions.findIndex((o) => o.value === stringValue);
          setHighlightIndex(idx >= 0 ? idx : 0);
        } else {
          setHighlightIndex((i) =>
            i < enabledOptions.length - 1 ? i + 1 : 0,
          );
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          const idx = enabledOptions.findIndex((o) => o.value === stringValue);
          setHighlightIndex(idx >= 0 ? idx : enabledOptions.length - 1);
        } else {
          setHighlightIndex((i) =>
            i > 0 ? i - 1 : enabledOptions.length - 1,
          );
        }
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      className={`custom-select flex flex-col gap-1 ${className}`}
    >
      {label ? (
        <label id={`${selectId}-label`} htmlFor={`${selectId}-trigger`} className={TYPE_LABEL}>
          {label}
        </label>
      ) : null}

      <select
        name={name}
        value={stringValue}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={onChange}
      >
        {children}
      </select>

      <button
        type="button"
        id={`${selectId}-trigger`}
        className="custom-select-trigger"
        disabled={disabled}
        data-open={open}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={label ? `${selectId}-label` : undefined}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
          if (!open) {
            const idx = enabledOptions.findIndex((o) => o.value === stringValue);
            setHighlightIndex(idx >= 0 ? idx : 0);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <span className="min-w-0 truncate">{displayLabel}</span>
        <ChevronIcon />
      </button>

      {open && !disabled ? (
        <ul
          id={listboxId}
          role="listbox"
          className="custom-select-menu"
          aria-labelledby={label ? `${selectId}-label` : undefined}
        >
          {options.map((option, index) => {
            const enabledIndex = enabledOptions.indexOf(option);
            const isHighlighted =
              enabledIndex >= 0 && enabledIndex === highlightIndex;

            return (
              <li key={`${option.value}-${index}`} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === stringValue}
                  data-selected={option.value === stringValue}
                  className="custom-select-option"
                  disabled={option.disabled}
                  onMouseEnter={() => {
                    if (!option.disabled && enabledIndex >= 0) {
                      setHighlightIndex(enabledIndex);
                    }
                  }}
                  onClick={() => {
                    if (!option.disabled) selectValue(option.value);
                  }}
                  onFocus={() => {
                    if (!option.disabled && enabledIndex >= 0) {
                      setHighlightIndex(enabledIndex);
                    }
                  }}
                  style={
                    isHighlighted && !option.disabled
                      ? {
                          backgroundColor: "rgba(0, 212, 255, 0.12)",
                          color: "#00d4ff",
                        }
                      : undefined
                  }
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
