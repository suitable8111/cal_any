import { getFaq } from "@/lib/faqs";

interface FaqSectionProps {
  slug: string;
}

/**
 * 계산기별 FAQ 섹션 + FAQPage 구조화 데이터(JSON-LD).
 * 검색엔진 리치 결과 노출과 롱테일 키워드 유입을 위한 SEO 콘텐츠입니다.
 */
export function FaqSection({ slug }: FaqSectionProps) {
  const faqs = getFaq(slug);
  if (faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="mt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="mb-4 text-lg font-bold tracking-tight">
        자주 묻는 질문
      </h2>
      <div className="space-y-3">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group rounded-lg border border-border bg-card"
          >
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="mr-2 text-primary">Q.</span>
              {item.q}
            </summary>
            <p className="border-t border-border/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
