import type { Metadata } from "next";
import { CalculatorGrid } from "@/components/CalculatorGrid";
import { ResponsiveAdFitBanner } from "@/components/ads/ResponsiveAdFitBanner";
import { siteConfig } from "@/lib/site";
import { calculators } from "@/lib/calculators";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function HomePage() {
  // 구조화된 데이터 (JSON-LD) — 검색 노출 강화
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    hasPart: calculators.map((c) => ({
      "@type": "WebApplication",
      name: c.title,
      applicationCategory: "UtilityApplication",
      url: `${siteConfig.url}${c.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 헤더 바로 아래 가로형 배너 (데스크톱 728x90 / 모바일 320x100) */}
      <ResponsiveAdFitBanner
        desktop={{ slot: "header", width: 728, height: 90 }}
        mobile={{ slot: "headerMobile", width: 320, height: 100 }}
        className="mb-8"
      />

      <section className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          생활에 필요한 모든 계산,
          <br className="sm:hidden" />{" "}
          <span className="text-primary">한 곳에서</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          만 나이부터 부동산 세금, 교통 범칙금, 전기차 충전요금까지. 복잡한
          계산을 빠르고 정확하게 무료로 해결하세요.
        </p>
      </section>

      <CalculatorGrid />
    </div>
  );
}
