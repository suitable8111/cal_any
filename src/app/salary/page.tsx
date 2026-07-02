import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { SalaryCalculator } from "@/components/calculators/SalaryCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/salary")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/salary" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function SalaryPage() {
  return (
    <CalculatorShell meta={meta}>
      <SalaryCalculator />
    </CalculatorShell>
  );
}
