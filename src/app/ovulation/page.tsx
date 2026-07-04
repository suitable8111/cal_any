import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { OvulationCalculator } from "@/components/calculators/OvulationCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/ovulation")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/ovulation" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function OvulationPage() {
  return (
    <CalculatorShell meta={meta}>
      <OvulationCalculator />
    </CalculatorShell>
  );
}
