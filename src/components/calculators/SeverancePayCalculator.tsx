"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { formatKRW, formatNumber, parseNumber } from "@/lib/utils";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** 퇴사일 직전 3개월의 실제 일수 (89~92일) */
function lastThreeMonthDays(leaveDate: Date): number {
  const start = new Date(leaveDate);
  start.setMonth(start.getMonth() - 3);
  return daysBetween(start, leaveDate);
}

interface SeveranceResult {
  serviceDays: number;
  serviceYears: number;
  periodDays: number;
  totalWage: number;
  avgDailyWage: number;
  severance: number;
  eligible: boolean;
}

function calcSeverance(
  joinDate: Date,
  leaveDate: Date,
  monthlyWage: number,
  annualBonus: number,
  annualLeavePay: number
): SeveranceResult | null {
  const serviceDays = daysBetween(joinDate, leaveDate);
  if (serviceDays <= 0) return null;

  const periodDays = lastThreeMonthDays(leaveDate);
  // 평균임금 = (3개월 임금총액 + 연간 상여금×3/12 + 연차수당×3/12) / 3개월 일수
  const totalWage = monthlyWage * 3 + annualBonus * 0.25 + annualLeavePay * 0.25;
  const avgDailyWage = totalWage / periodDays;
  const severance = avgDailyWage * 30 * (serviceDays / 365);

  return {
    serviceDays,
    serviceYears: serviceDays / 365,
    periodDays,
    totalWage,
    avgDailyWage,
    severance,
    eligible: serviceDays >= 365,
  };
}

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function SeverancePayCalculator() {
  const [joinStr, setJoinStr] = useState("");
  const [leaveStr, setLeaveStr] = useState(toDateInput(new Date()));
  const [wageStr, setWageStr] = useState("");
  const [bonusStr, setBonusStr] = useState("");
  const [leavePayStr, setLeavePayStr] = useState("");

  const monthlyWage = parseNumber(wageStr);
  const annualBonus = parseNumber(bonusStr);
  const annualLeavePay = parseNumber(leavePayStr);

  const result = useMemo(() => {
    if (!joinStr || !leaveStr || monthlyWage <= 0) return null;
    const join = new Date(joinStr);
    const leave = new Date(leaveStr);
    if (Number.isNaN(join.getTime()) || Number.isNaN(leave.getTime()))
      return null;
    return calcSeverance(join, leave, monthlyWage, annualBonus, annualLeavePay);
  }, [joinStr, leaveStr, monthlyWage, annualBonus, annualLeavePay]);

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
              <Label htmlFor="leaveDate">퇴사일 (마지막 근무 다음 날)</Label>
              <Input
                id="leaveDate"
                type="date"
                value={leaveStr}
                onChange={(e) => setLeaveStr(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="monthlyWage">
              퇴직 전 3개월 월평균 임금 (세전, 원)
            </Label>
            <Input
              id="monthlyWage"
              inputMode="numeric"
              placeholder="예: 3,200,000 (기본급+수당 포함)"
              value={monthlyWage > 0 ? monthlyWage.toLocaleString("ko-KR") : ""}
              onChange={(e) => setWageStr(e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="annualBonus">연간 상여금 총액 (선택, 원)</Label>
              <Input
                id="annualBonus"
                inputMode="numeric"
                placeholder="예: 4,000,000"
                value={
                  annualBonus > 0 ? annualBonus.toLocaleString("ko-KR") : ""
                }
                onChange={(e) => setBonusStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="annualLeavePay">
                연차수당 (지난 1년, 선택, 원)
              </Label>
              <Input
                id="annualLeavePay"
                inputMode="numeric"
                placeholder="예: 600,000"
                value={
                  annualLeavePay > 0
                    ? annualLeavePay.toLocaleString("ko-KR")
                    : ""
                }
                onChange={(e) => setLeavePayStr(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && !result.eligible && (
        <ResultBox>
          <p className="text-sm leading-relaxed">
            재직일수가{" "}
            <b>
              {formatNumber(result.serviceDays)}일 (약{" "}
              {result.serviceYears.toFixed(1)}년)
            </b>
            로 1년 미만입니다. 계속근로기간이 1년 미만이거나 4주 평균 주
            15시간 미만 근무한 경우에는 법정 퇴직금 지급 대상이 아닙니다.
          </p>
        </ResultBox>
      )}

      {result && result.eligible && (
        <ResultBox>
          <StatRow
            label="재직 기간"
            value={`${formatNumber(result.serviceDays)}일`}
            sub={`약 ${result.serviceYears.toFixed(1)}년`}
          />
          <StatRow
            label="퇴직 전 3개월 임금총액 (상여·연차수당 반영)"
            value={`${formatKRW(result.totalWage)} 원`}
          />
          <StatRow
            label="1일 평균임금"
            value={`${formatKRW(result.avgDailyWage)} 원`}
            sub={`3개월 일수 ${result.periodDays}일 기준`}
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="예상 퇴직금 (세전)"
            value={`${formatKRW(result.severance)} 원`}
            highlight
          />
          <div className="mt-4">
            <ShareButton
              title="퇴직금 계산 결과"
              text={`재직 ${result.serviceYears.toFixed(1)}년, 예상 퇴직금은 ${formatKRW(result.severance)}원!`}
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            퇴직금 계산 방법
          </h2>
          <p>
            법정 퇴직금은{" "}
            <b className="text-foreground">
              1일 평균임금 × 30일 × (재직일수 ÷ 365)
            </b>
            로 계산합니다. 1일 평균임금은 퇴직일 이전 3개월간 지급된 임금총액
            (연간 상여금과 연차수당은 3/12만 산입)을 그 기간의 총 일수로 나눈
            금액입니다.
          </p>
          <p className="mt-2">
            평균임금이 통상임금보다 낮으면 통상임금을 기준으로 계산하며, 퇴직
            소득세를 공제하기 전 <b className="text-foreground">세전 금액</b>
            입니다. 회사 규정(누진제 등)에 따라 실제 지급액은 더 많을 수
            있으므로 정확한 금액은 회사 인사팀 또는 고용노동부 퇴직금
            계산기로 확인하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
