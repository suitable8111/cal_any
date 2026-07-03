import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ResponsiveAdFitBanner } from "@/components/ads/ResponsiveAdFitBanner";
import { RelatedCalculators } from "@/components/RelatedCalculators";
import type { CalculatorMeta } from "@/lib/calculators";

interface CalculatorShellProps {
  meta: CalculatorMeta;
  children: React.ReactNode;
}

/**
 * 모든 계산기 페이지가 공유하는 레이아웃 셸.
 * - 헤더 바로 아래 가로형 광고
 * - 본문 + (데스크톱) 사이드바 광고 2단 레이아웃
 */
export function CalculatorShell({ meta, children }: CalculatorShellProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* 1. 헤더 바로 아래 가로형 배너 (데스크톱 728x90 / 모바일 320x100) */}
      <ResponsiveAdFitBanner
        desktop={{ slot: "header", width: 728, height: 90 }}
        mobile={{ slot: "headerMobile", width: 320, height: 100 }}
        className="mb-6"
      />

      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> 전체 계산기
      </Link>

      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-2xl">
          {meta.emoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{meta.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.description}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {children}
          {/* 관련 계산기 추천 — 내부 순환(페이지/세션) 증가 목적 */}
          <RelatedCalculators current={meta} />
        </div>

        {/* 3. 사이드바 광고 (데스크톱 전용, sticky) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <AdFitBanner slot="sidebar" width={250} height={250} />
          </div>
        </aside>
      </div>
    </div>
  );
}
