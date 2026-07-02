"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Star } from "lucide-react";
import {
  CATEGORY_LABELS,
  calculators,
  type CalculatorCategory,
  type CalculatorMeta,
} from "@/lib/calculators";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/useFavorites";

const CATEGORY_ORDER: CalculatorCategory[] = [
  "financial",
  "lifestyle",
  "health",
  "dev",
];

function CalculatorCard({
  c,
  favorite,
  onToggleFavorite,
}: {
  c: CalculatorMeta;
  favorite: boolean;
  onToggleFavorite: (slug: string) => void;
}) {
  return (
    <Link
      href={c.slug}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
          c.accent
        )}
      />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(c.slug);
        }}
        aria-label={favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        aria-pressed={favorite}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm transition-colors hover:text-amber-500"
      >
        <Star
          className={cn("h-4 w-4", favorite && "fill-amber-400 text-amber-500")}
        />
      </button>
      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-background/70 text-2xl shadow-sm">
          {c.emoji}
        </div>
        <h3 className="flex items-center gap-1 pr-6 text-lg font-semibold tracking-tight">
          {c.title}
          <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {c.description}
        </p>
      </div>
    </Link>
  );
}

export function CalculatorGrid() {
  const [query, setQuery] = useState("");
  const { isFavorite, toggle } = useFavorites();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return calculators;
    return calculators.filter((c) => {
      const haystack = [c.title, c.description, ...c.keywords]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const favoriteItems = useMemo(
    () => filtered.filter((c) => isFavorite(c.slug)),
    [filtered, isFavorite]
  );

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: filtered.filter((c) => c.category === category),
    })).filter((group) => group.items.length > 0);
  }, [filtered]);

  return (
    <div>
      {/* 실시간 검색 바 */}
      <div className="relative mx-auto mb-8 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="계산기 검색 (예: 예적금, 대출, 나이, 취득세, 과속, 충전)"
          className="h-14 pl-12 text-base"
          aria-label="계산기 검색"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          “{query}”에 해당하는 계산기가 없습니다.
        </p>
      ) : (
        <div className="space-y-10">
          {favoriteItems.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-1.5 text-lg font-bold tracking-tight text-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                즐겨찾기
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {favoriteItems.map((c) => (
                  <CalculatorCard
                    key={c.slug}
                    c={c}
                    favorite={isFavorite(c.slug)}
                    onToggleFavorite={toggle}
                  />
                ))}
              </div>
            </section>
          )}

          {grouped.map(({ category, items }) => (
            <section key={category}>
              <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">
                {CATEGORY_LABELS[category]}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {items.map((c) => (
                  <CalculatorCard
                    key={c.slug}
                    c={c}
                    favorite={isFavorite(c.slug)}
                    onToggleFavorite={toggle}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
