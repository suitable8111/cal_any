import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ElectricityBillCalculator } from "@/components/calculators/ElectricityBillCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/electricity-bill")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/electricity-bill" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function ElectricityBillPage() {
  return (
    <CalculatorShell meta={meta}>
      <ElectricityBillCalculator />
    </CalculatorShell>
  );
}
