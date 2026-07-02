import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { SavingsInterestCalculator } from "@/components/calculators/SavingsInterestCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/savings-interest")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/savings-interest" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function SavingsInterestPage() {
  return (
    <CalculatorShell meta={meta}>
      <SavingsInterestCalculator />
    </CalculatorShell>
  );
}
