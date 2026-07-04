import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { CustomsDutyCalculator } from "@/components/calculators/CustomsDutyCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/customs-duty")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/customs-duty" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function CustomsDutyPage() {
  return (
    <CalculatorShell meta={meta}>
      <CustomsDutyCalculator />
    </CalculatorShell>
  );
}
