import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { UnitConverterCalculator } from "@/components/calculators/UnitConverterCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/unit-converter")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/unit-converter" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function UnitConverterPage() {
  return (
    <CalculatorShell meta={meta}>
      <UnitConverterCalculator />
    </CalculatorShell>
  );
}
