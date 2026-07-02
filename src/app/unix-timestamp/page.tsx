import type { Metadata } from "next";
import { CalculatorShell } from "@/components/CalculatorShell";
import { UnixTimestampCalculator } from "@/components/calculators/UnixTimestampCalculator";
import { getCalculator } from "@/lib/calculators";

const meta = getCalculator("/unix-timestamp")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.seo,
  alternates: { canonical: "/unix-timestamp" },
  openGraph: { title: meta.title, description: meta.seo },
};

export default function UnixTimestampPage() {
  return (
    <CalculatorShell meta={meta}>
      <UnixTimestampCalculator />
    </CalculatorShell>
  );
}
