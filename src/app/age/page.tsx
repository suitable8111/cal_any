import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { AgeCalculator } from "@/components/calculators/AgeCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/age")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/age" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function AgePage() {
  return (
    <CalculatorShell meta={meta}>
      <AgeCalculator />
    </CalculatorShell>
  );
}
