import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { WeeklyHolidayPayCalculator } from "@/components/calculators/WeeklyHolidayPayCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/weekly-holiday-pay")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/weekly-holiday-pay" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function WeeklyHolidayPayPage() {
  return (
    <CalculatorShell meta={meta}>
      <WeeklyHolidayPayCalculator />
    </CalculatorShell>
  );
}
