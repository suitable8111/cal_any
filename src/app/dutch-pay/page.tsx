import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { DutchPayCalculator } from "@/components/calculators/DutchPayCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/dutch-pay")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/dutch-pay" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function DutchPayPage() {
  return (
    <CalculatorShell meta={meta}>
      <DutchPayCalculator />
    </CalculatorShell>
  );
}
