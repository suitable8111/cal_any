import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { RentConversionCalculator } from "@/components/calculators/RentConversionCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/rent-conversion")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/rent-conversion" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function RentConversionPage() {
  return (
    <CalculatorShell meta={meta}>
      <RentConversionCalculator />
    </CalculatorShell>
  );
}
