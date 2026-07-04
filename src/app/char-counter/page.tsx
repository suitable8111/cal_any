import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { CharCounterCalculator } from "@/components/calculators/CharCounterCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/char-counter")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/char-counter" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function CharCounterPage() {
  return (
    <CalculatorShell meta={meta}>
      <CharCounterCalculator />
    </CalculatorShell>
  );
}
