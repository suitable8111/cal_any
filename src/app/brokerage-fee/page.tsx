import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { BrokerageFeeCalculator } from "@/components/calculators/BrokerageFeeCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/brokerage-fee")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/brokerage-fee" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function BrokerageFeePage() {
  return (
    <CalculatorShell meta={meta}>
      <BrokerageFeeCalculator />
    </CalculatorShell>
  );
}
