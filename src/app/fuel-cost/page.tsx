import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { FuelCostCalculator } from "@/components/calculators/FuelCostCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/fuel-cost")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/fuel-cost" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function FuelCostPage() {
  return (
    <CalculatorShell meta={meta}>
      <FuelCostCalculator />
    </CalculatorShell>
  );
}
