import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { StockAverageCalculator } from "@/components/calculators/StockAverageCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/stock-average")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/stock-average" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function StockAveragePage() {
  return (
    <CalculatorShell meta={meta}>
      <StockAverageCalculator />
    </CalculatorShell>
  );
}
