import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { calculators, type CalculatorMeta } from "@/lib/calculators";
import { cn } from "@/lib/utils";

const MAX_ITEMS = 3;

/**
 * 결과 하단에 노출되는 관련 계산기 추천 섹션.
 * 같은 카테고리 계산기를 우선 노출하고, 부족하면 다른 카테고리로 채웁니다.
 */
export function RelatedCalculators({ current }: { current: CalculatorMeta }) {
  const sameCategory = calculators.filter(
    (c) => c.category === current.category && c.slug !== current.slug
  );
  const others = calculators.filter(
    (c) => c.category !== current.category && c.slug !== current.slug
  );
  const items = [...sameCategory, ...others].slice(0, MAX_ITEMS);

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">
        관련 계산기
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((c) => (
          <Link
            key={c.slug}
            href={c.slug}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
                c.accent
              )}
            />
            <div className="relative">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-background/70 text-xl shadow-sm">
                {c.emoji}
              </div>
              <h3 className="flex items-center gap-1 text-sm font-semibold tracking-tight">
                {c.title}
                <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {c.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
