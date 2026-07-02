"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { formatKRW, parseNumber } from "@/lib/utils";

const PENSION_RATE = 0.045;
const PENSION_BASE_MIN = 400_000;
const PENSION_BASE_MAX = 6_370_000;
const HEALTH_RATE = 0.03545;
const LONG_TERM_CARE_RATE = 0.1295; // 건강보험료 대비
const EMPLOYMENT_RATE = 0.009;

function earnedIncomeDeduction(annualSalary: number): number {
  if (annualSalary <= 5_000_000) return annualSalary * 0.7;
  if (annualSalary <= 15_000_000)
    return 3_500_000 + (annualSalary - 5_000_000) * 0.4;
  if (annualSalary <= 45_000_000)
    return 7_500_000 + (annualSalary - 15_000_000) * 0.15;
  if (annualSalary <= 100_000_000)
    return 12_000_000 + (annualSalary - 45_000_000) * 0.05;
  return 14_750_000 + (annualSalary - 100_000_000) * 0.02;
}

const TAX_BRACKETS: Array<[number, number, number]> = [
  [14_000_000, 0.06, 0],
  [50_000_000, 0.15, 1_260_000],
  [88_000_000, 0.24, 5_760_000],
  [150_000_000, 0.35, 15_440_000],
  [300_000_000, 0.38, 19_940_000],
  [500_000_000, 0.4, 25_940_000],
  [1_000_000_000, 0.42, 35_940_000],
  [Infinity, 0.45, 65_940_000],
];

function progressiveTax(base: number): number {
  for (const [limit, rate, deduction] of TAX_BRACKETS) {
    if (base <= limit) return Math.max(0, base * rate - deduction);
  }
  return 0;
}

function earnedIncomeTaxCreditLimit(annualSalary: number): number {
  if (annualSalary <= 33_000_000) return 740_000;
  if (annualSalary <= 70_000_000)
    return Math.max(660_000, 740_000 - (annualSalary - 33_000_000) * 0.008);
  if (annualSalary <= 120_000_000)
    return Math.max(500_000, 660_000 - (annualSalary - 70_000_000) * 0.5);
  return Math.max(200_000, 500_000 - (annualSalary - 120_000_000) * 0.5);
}

function earnedIncomeTaxCredit(calculatedTax: number, annualSalary: number): number {
  const raw =
    calculatedTax <= 1_300_000
      ? calculatedTax * 0.55
      : 1_300_000 * 0.55 + (calculatedTax - 1_300_000) * 0.3;
  return Math.min(raw, earnedIncomeTaxCreditLimit(annualSalary));
}

function calcSalary(annualSalary: number, nonTaxableMonthly: number, dependents: number) {
  const monthlyGross = annualSalary / 12;
  const monthlyTaxableBase = Math.max(0, monthlyGross - nonTaxableMonthly);
  const annualTaxableBase = monthlyTaxableBase * 12;

  const pensionBase = Math.min(
    Math.max(monthlyTaxableBase, PENSION_BASE_MIN),
    PENSION_BASE_MAX
  );
  const pension = pensionBase * PENSION_RATE;
  const health = monthlyTaxableBase * HEALTH_RATE;
  const longTermCare = health * LONG_TERM_CARE_RATE;
  const employment = monthlyTaxableBase * EMPLOYMENT_RATE;

  const earnedIncome = annualTaxableBase - earnedIncomeDeduction(annualTaxableBase);
  const personalDeduction = Math.max(1, dependents) * 1_500_000;
  const taxBase = Math.max(0, earnedIncome - personalDeduction);
  const calculatedTax = progressiveTax(taxBase);
  const credit = earnedIncomeTaxCredit(calculatedTax, annualTaxableBase);
  const annualIncomeTax = Math.max(0, calculatedTax - credit);
  const annualLocalTax = annualIncomeTax * 0.1;

  const monthlyIncomeTax = annualIncomeTax / 12;
  const monthlyLocalTax = annualLocalTax / 12;

  const totalDeduction =
    pension + health + longTermCare + employment + monthlyIncomeTax + monthlyLocalTax;
  const netMonthly = monthlyGross - totalDeduction;

  return {
    monthlyGross,
    pension,
    health,
    longTermCare,
    employment,
    monthlyIncomeTax,
    monthlyLocalTax,
    totalDeduction,
    netMonthly,
  };
}

const TABLE_STEP = 1_000_000;
const TABLE_MAX = 150_000_000;

export function SalaryCalculator() {
  const [salaryStr, setSalaryStr] = useState("");
  const [nonTaxableStr, setNonTaxableStr] = useState("200000");
  const [dependentsStr, setDependentsStr] = useState("1");

  const salary = parseNumber(salaryStr);
  const nonTaxable = parseNumber(nonTaxableStr);
  const dependents = Math.max(1, Math.round(parseNumber(dependentsStr)));

  const result = useMemo(
    () => (salary > 0 ? calcSalary(salary, nonTaxable, dependents) : null),
    [salary, nonTaxable, dependents]
  );

  const referenceTable = useMemo(() => {
    const rows = [];
    for (let s = TABLE_STEP; s <= TABLE_MAX; s += TABLE_STEP) {
      const r = calcSalary(s, nonTaxable, dependents);
      rows.push({
        salary: s,
        pension: r.pension,
        health: r.health + r.longTermCare,
        employment: r.employment,
        tax: r.monthlyIncomeTax + r.monthlyLocalTax,
        totalDeduction: r.totalDeduction,
        netMonthly: r.netMonthly,
      });
    }
    return rows;
  }, [nonTaxable, dependents]);

  const nearestSalary =
    salary > 0 ? Math.round(salary / TABLE_STEP) * TABLE_STEP : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label htmlFor="salary">연봉 (세전, 원)</Label>
            <Input
              id="salary"
              inputMode="numeric"
              placeholder="예: 45,000,000"
              value={salary > 0 ? salary.toLocaleString("ko-KR") : ""}
              onChange={(e) => setSalaryStr(e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="nonTaxable">월 비과세액 (원)</Label>
              <Input
                id="nonTaxable"
                inputMode="numeric"
                placeholder="예: 식대 등 200,000"
                value={nonTaxable > 0 ? nonTaxable.toLocaleString("ko-KR") : ""}
                onChange={(e) => setNonTaxableStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dependents">부양가족 수 (본인 포함)</Label>
              <Input
                id="dependents"
                inputMode="numeric"
                placeholder="예: 1"
                value={dependentsStr}
                onChange={(e) => setDependentsStr(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label="월 급여 (세전)"
            value={`${formatKRW(result.monthlyGross)} 원`}
          />
          <StatRow label="국민연금 (4.5%)" value={`- ${formatKRW(result.pension)} 원`} />
          <StatRow
            label="건강보험 (3.545%)"
            value={`- ${formatKRW(result.health)} 원`}
          />
          <StatRow
            label="장기요양보험"
            value={`- ${formatKRW(result.longTermCare)} 원`}
          />
          <StatRow
            label="고용보험 (0.9%)"
            value={`- ${formatKRW(result.employment)} 원`}
          />
          <StatRow
            label="근로소득세"
            value={`- ${formatKRW(result.monthlyIncomeTax)} 원`}
          />
          <StatRow
            label="지방소득세"
            value={`- ${formatKRW(result.monthlyLocalTax)} 원`}
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="공제 합계"
            value={`- ${formatKRW(result.totalDeduction)} 원`}
          />
          <StatRow
            label="예상 월 실수령액"
            value={`${formatKRW(result.netMonthly)} 원`}
            highlight
          />
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 text-base font-semibold">
            연봉별 월 실수령액 참고표 (100만원 단위, 1억 5천만원까지)
          </h2>
          <div className="max-h-[32rem] overflow-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">연봉</th>
                  <th className="py-2 pr-3 font-medium">국민연금</th>
                  <th className="py-2 pr-3 font-medium">건강보험(장기요양)</th>
                  <th className="py-2 pr-3 font-medium">고용보험</th>
                  <th className="py-2 pr-3 font-medium">소득세(지방세)</th>
                  <th className="py-2 pr-3 font-medium">공제 합계</th>
                  <th className="py-2 font-medium">월 실수령액</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {referenceTable.map((row) => (
                  <tr
                    key={row.salary}
                    className={
                      row.salary === nearestSalary
                        ? "border-b border-border/50 bg-accent/60 font-semibold"
                        : "border-b border-border/50"
                    }
                  >
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {(row.salary / 10000).toLocaleString("ko-KR")}만원
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatKRW(row.pension)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatKRW(row.health)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatKRW(row.employment)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatKRW(row.tax)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatKRW(row.totalDeduction)}
                    </td>
                    <td className="py-2 whitespace-nowrap">
                      {formatKRW(row.netMonthly)} 원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            입력한 월 비과세액·부양가족 수 기준으로 계산된 월 공제액이며,
            현재 입력한 연봉과 가장 가까운 행이 강조 표시됩니다. (단위: 원)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 안내 (2026년 기준)
          </h2>
          <p>
            2026년 국민연금·건강보험·장기요양보험·고용보험 요율과 근로소득세
            간이 계산 방식을 반영한 <b className="text-foreground">추정치</b>
            입니다. 자녀세액공제 등 개별 세액공제, 회사별 규정, 실제 원천징수
            세액표는 반영되지 않으므로 정확한 금액은 급여명세서 또는 국세청
            간이세액표를 확인하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
