import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { RealEstateTaxCalculator } from "@/components/calculators/RealEstateTaxCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/real-estate-tax")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/real-estate-tax" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function RealEstateTaxPage() {
  return (
    <CalculatorShell meta={meta}>
      <RealEstateTaxCalculator />
    </CalculatorShell>
  );
}
