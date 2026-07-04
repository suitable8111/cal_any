import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { BodyFatCalculator } from "@/components/calculators/BodyFatCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/body-fat")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/body-fat" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function BodyFatPage() {
  return (
    <CalculatorShell meta={meta}>
      <BodyFatCalculator />
    </CalculatorShell>
  );
}
