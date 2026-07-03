import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { UnemploymentBenefitCalculator } from "@/components/calculators/UnemploymentBenefitCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/unemployment-benefit")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/unemployment-benefit" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function UnemploymentBenefitPage() {
  return (
    <CalculatorShell meta={meta}>
      <UnemploymentBenefitCalculator />
    </CalculatorShell>
  );
}
