import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { DueDateCalculator } from "@/components/calculators/DueDateCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/due-date")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/due-date" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function DueDatePage() {
  return (
    <CalculatorShell meta={meta}>
      <DueDateCalculator />
    </CalculatorShell>
  );
}
