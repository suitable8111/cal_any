"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { calculators } from "@/lib/calculators";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CalculatorGrid() {
  const [query, setQuery] = useState("");

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

  return (
    <div>
      {/* 실시간 검색 바 */}
      <div className="relative mx-auto mb-8 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="계산기 검색 (예: 나이, 취득세, 과속, 충전)"
          className="h-14 pl-12 text-base"
          aria-label="계산기 검색"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          “{query}”에 해당하는 계산기가 없습니다.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {filtered.map((c) => (
            <Link
              key={c.slug}
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
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-background/70 text-2xl shadow-sm">
                  {c.emoji}
                </div>
                <h3 className="flex items-center gap-1 text-lg font-semibold tracking-tight">
                  {c.title}
                  <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {c.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
