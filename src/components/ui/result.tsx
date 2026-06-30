import { cn } from "@/lib/utils";

export function ResultBox({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-accent/40 p-5",
        className
      )}
      {...props}
    />
  );
}

interface StatRowProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  sub?: string;
}

export function StatRow({ label, value, highlight, sub }: StatRowProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 border-b border-border/60 py-2.5 last:border-0",
        highlight && "border-0"
      )}
    >
      <span
        className={cn(
          "text-sm",
          highlight ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      <span className="text-right">
        <span
          className={cn(
            highlight
              ? "text-xl font-bold text-primary"
              : "text-base font-medium text-foreground"
          )}
        >
          {value}
        </span>
        {sub && (
          <span className="block text-xs text-muted-foreground">{sub}</span>
        )}
      </span>
    </div>
  );
}
