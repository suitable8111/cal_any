"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { formatKRW, formatNumber, parseNumber } from "@/lib/utils";

/** 월 통상임금 산정 기준시간 (주 40시간 근무) */
const MONTHLY_STANDARD_HOURS = 209;

/** 두 날짜 사이의 만 개월 수 */
function fullMonthsBetween(from: Date, to: Date): number {
  let months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
}

/** 만 근속연수 */
function fullYearsBetween(from: Date, to: Date): number {
  return Math.floor(fullMonthsBetween(from, to) / 12);
}

/** 근속연수(만)별 연차 발생 일수 — 근로기준법 제60조 */
function annualLeaveDays(serviceYears: number): number {
  if (serviceYears < 1) return 0;
  return Math.min(15 + Math.floor((serviceYears - 1) / 2), 25);
}

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function AnnualLeaveCalculator() {
  const [joinStr, setJoinStr] = useState("");
  const [baseStr, setBaseStr] = useState(toDateInput(new Date()));
  const [wageStr, setWageStr] = useState("");
  const [unusedStr, setUnusedStr] = useState("");

  const monthlyWage = parseNumber(wageStr);
  const unusedDays = parseNumber(unusedStr);

  const result = useMemo(() => {
    if (!joinStr || !baseStr) return null;
    const join = new Date(joinStr);
    const base = new Date(baseStr);
    if (Number.isNaN(join.getTime()) || Number.isNaN(base.getTime()))
      return null;
    if (base <= join) return null;

    const months = fullMonthsBetween(join, base);
    const years = Math.floor(months / 12);

    // 1년 미만: 1개월 개근 시 1일 (최대 11일)
    const monthlyLeave = years < 1 ? Math.min(months, 11) : 0;
    const yearlyLeave = annualLeaveDays(years);

    return { months, years, monthlyLeave, yearlyLeave };
  }, [joinStr, baseStr]);

  const leavePay = useMemo(() => {
    if (monthlyWage <= 0 || unusedDays <= 0) return null;
    const dailyPay = (monthlyWage / MONTHLY_STANDARD_HOURS) * 8;
    return { dailyPay, total: dailyPay * unusedDays };
  }, [monthlyWage, unusedDays]);

  const yearTable = useMemo(() => {
    const rows: Array<{ years: number; days: number }> = [];
    for (let y = 1; y <= 21; y += 2) {
      rows.push({ years: y, days: annualLeaveDays(y) });
    }
    return rows;
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="joinDate">입사일</Label>
              <Input
                id="joinDate"
                type="date"
                value={joinStr}
                onChange={(e) => setJoinStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="baseDate">기준일</Label>
              <Input
                id="baseDate"
                type="date"
                value={baseStr}
                onChange={(e) => setBaseStr(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="monthlyWage">월 통상임금 (선택, 원)</Label>
              <Input
                id="monthlyWage"
                inputMode="numeric"
                placeholder="연차수당 계산용 · 예: 3,000,000"
                value={
                  monthlyWage > 0 ? monthlyWage.toLocaleString("ko-KR") : ""
                }
                onChange={(e) => setWageStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="unused">미사용 연차 (선택, 일)</Label>
              <Input
                id="unused"
                inputMode="numeric"
                placeholder="예: 5"
                value={unusedStr}
                onChange={(e) => setUnusedStr(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label="근속 기간"
            value={
              result.years >= 1
                ? `만 ${result.years}년 ${result.months % 12}개월`
                : `${result.months}개월`
            }
          />
          {result.years < 1 ? (
            <StatRow
              label="발생 연차 (월 단위, 개근 가정)"
              value={`${result.monthlyLeave}일`}
              sub="1개월 개근 시 1일, 최대 11일"
              highlight
            />
          ) : (
            <StatRow
              label="올해 발생 연차 (개근 가정)"
              value={`${result.yearlyLeave}일`}
              sub={`만 ${result.years}년 근속 기준, 최대 25일`}
              highlight
            />
          )}
          {leavePay && (
            <>
              <div className="my-2 border-t border-border" />
              <StatRow
                label="1일 통상임금"
                value={`${formatKRW(leavePay.dailyPay)} 원`}
                sub={`월 통상임금 ÷ ${MONTHLY_STANDARD_HOURS}시간 × 8시간`}
              />
              <StatRow
                label={`미사용 연차수당 (${formatNumber(unusedDays)}일)`}
                value={`${formatKRW(leavePay.total)} 원`}
                highlight
              />
            </>
          )}
          <div className="mt-4">
            <ShareButton
              title="연차 계산 결과"
              text={
                result.years >= 1
                  ? `만 ${result.years}년 근속, 올해 발생 연차는 ${result.yearlyLeave}일!`
                  : `입사 ${result.months}개월차, 발생 연차는 ${result.monthlyLeave}일!`
              }
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 text-base font-semibold">
            근속연수별 연차 발생 일수
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">근속연수 (만)</th>
                  <th className="py-2 font-medium">연차 일수</th>
                </tr>
              </thead>
              <tbody>
                {yearTable.map((row) => (
                  <tr
                    key={row.years}
                    className={
                      result &&
                      result.years >= row.years &&
                      result.years < row.years + 2
                        ? "border-b border-border/50 bg-accent/60 font-semibold"
                        : "border-b border-border/50"
                    }
                  >
                    <td className="py-2 pr-3">
                      {row.years}~{row.years + 1}년
                    </td>
                    <td className="py-2">{row.days}일</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3">21년 이상</td>
                  <td className="py-2">25일 (최대)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            연차 유급휴가 기준 (근로기준법 제60조)
          </h2>
          <p>
            1년간 80% 이상 출근하면 <b className="text-foreground">15일</b>의
            유급휴가가 발생하고, 3년 이상 계속 근로하면 2년마다 1일씩
            가산되어 <b className="text-foreground">최대 25일</b>까지
            늘어납니다. 입사 1년 미만에는 1개월 개근 시 1일씩(최대 11일)
            발생합니다.
          </p>
          <p className="mt-2">
            미사용 연차수당은{" "}
            <b className="text-foreground">
              1일 통상임금(월 통상임금 ÷ 209 × 8) × 미사용 일수
            </b>
            로 계산하며, 회사가 연차사용촉진제도를 적법하게 운영한 경우에는
            지급 의무가 없을 수 있습니다. 회계연도 기준으로 연차를 관리하는
            회사는 계산 결과와 다를 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
