import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ColorConverterCalculator } from "@/components/calculators/ColorConverterCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/color-converter")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/color-converter" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function ColorConverterPage() {
  return (
    <CalculatorShell meta={meta}>
      <ColorConverterCalculator />
    </CalculatorShell>
  );
}
