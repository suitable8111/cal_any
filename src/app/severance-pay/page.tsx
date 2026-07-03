import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { SeverancePayCalculator } from "@/components/calculators/SeverancePayCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/severance-pay")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/severance-pay" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function SeverancePayPage() {
  return (
    <CalculatorShell meta={meta}>
      <SeverancePayCalculator />
    </CalculatorShell>
  );
}
