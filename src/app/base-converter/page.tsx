import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { BaseConverterCalculator } from "@/components/calculators/BaseConverterCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/base-converter")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/base-converter" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function BaseConverterPage() {
  return (
    <CalculatorShell meta={meta}>
      <BaseConverterCalculator />
    </CalculatorShell>
  );
}
