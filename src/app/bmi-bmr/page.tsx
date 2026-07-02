import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { BmiBmrCalculator } from "@/components/calculators/BmiBmrCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/bmi-bmr")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/bmi-bmr" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function BmiBmrPage() {
  return (
    <CalculatorShell meta={meta}>
      <BmiBmrCalculator />
    </CalculatorShell>
  );
}
