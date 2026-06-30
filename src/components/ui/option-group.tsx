"use client";

import { cn } from "@/lib/utils";

export interface Option<T extends string> {
  label: string;
  value: T;
  hint?: string;
}

interface OptionGroupProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  columns?: number;
}

/** 버튼형 단일 선택 그룹 (라디오 대체) */
export function OptionGroup<T extends string>({
  options,
  value,
  onChange,
  className,
  columns,
}: OptionGroupProps<T>) {
  return (
    <div
      className={cn("grid gap-2", className)}
      style={{
        gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))`,
      }}
      role="radiogroup"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-center justify-center rounded-md border px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-accent text-accent-foreground ring-1 ring-primary"
                : "border-input bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            <span>{opt.label}</span>
            {opt.hint && (
              <span className="mt-0.5 text-xs font-normal opacity-70">
                {opt.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
