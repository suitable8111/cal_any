import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { HousingSubscriptionCalculator } from "@/components/calculators/HousingSubscriptionCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/housing-subscription")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/housing-subscription" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function HousingSubscriptionPage() {
  return (
    <CalculatorShell meta={meta}>
      <HousingSubscriptionCalculator />
    </CalculatorShell>
  );
}
