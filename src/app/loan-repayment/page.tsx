import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { LoanRepaymentCalculator } from "@/components/calculators/LoanRepaymentCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/loan-repayment")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/loan-repayment" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function LoanRepaymentPage() {
  return (
    <CalculatorShell meta={meta}>
      <LoanRepaymentCalculator />
    </CalculatorShell>
  );
}
