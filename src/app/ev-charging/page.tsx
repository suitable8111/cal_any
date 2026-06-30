import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { EvChargingCalculator } from "@/components/calculators/EvChargingCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/ev-charging")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/ev-charging" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function EvChargingPage() {
  return (
    <CalculatorShell meta={meta}>
      <EvChargingCalculator />
    </CalculatorShell>
  );
}
