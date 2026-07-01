import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { DdayCalculator } from "@/components/calculators/DdayCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/dday")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/dday" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function DdayPage() {
  return (
    <CalculatorShell meta={meta}>
      <DdayCalculator />
    </CalculatorShell>
  );
}
