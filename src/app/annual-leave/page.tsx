import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { AnnualLeaveCalculator } from "@/components/calculators/AnnualLeaveCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/annual-leave")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/annual-leave" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function AnnualLeavePage() {
  return (
    <CalculatorShell meta={meta}>
      <AnnualLeaveCalculator />
    </CalculatorShell>
  );
}
