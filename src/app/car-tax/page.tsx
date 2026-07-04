import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { CarTaxCalculator } from "@/components/calculators/CarTaxCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/car-tax")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/car-tax" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function CarTaxPage() {
  return (
    <CalculatorShell meta={meta}>
      <CarTaxCalculator />
    </CalculatorShell>
  );
}
