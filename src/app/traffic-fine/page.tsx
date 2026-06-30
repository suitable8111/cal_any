import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { TrafficFineCalculator } from "@/components/calculators/TrafficFineCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/traffic-fine")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/traffic-fine" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function TrafficFinePage() {
  return (
    <CalculatorShell meta={meta}>
      <TrafficFineCalculator />
    </CalculatorShell>
  );
}
