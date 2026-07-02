import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { OneRepMaxCalculator } from "@/components/calculators/OneRepMaxCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/one-rep-max")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/one-rep-max" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function OneRepMaxPage() {
  return (
    <CalculatorShell meta={meta}>
      <OneRepMaxCalculator />
    </CalculatorShell>
  );
}
