"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { formatKRW, formatNumber, parseNumber } from "@/lib/utils";

/** 2026년 최저시급 */
const MIN_HOURLY_WAGE = 10_320;
/** 월 평균 주수 (365 ÷ 7 ÷ 12) */
const WEEKS_PER_MONTH = 4.345;

export function WeeklyHolidayPayCalculator() {
  const [hourlyStr, setHourlyStr] = useState(String(MIN_HOURLY_WAGE));
  const [hoursStr, setHoursStr] = useState("");

  const hourly = parseNumber(hourlyStr);
  const weeklyHours = parseNumber(hoursStr);

  const result = useMemo(() => {
    if (hourly <= 0 || weeklyHours <= 0) return null;

    const eligible = weeklyHours >= 15;
    // 주휴시간 = (1주 소정근로시간 ÷ 40) × 8, 40시간 초과분은 산입 안 함
    const holidayHours = (Math.min(weeklyHours, 40) / 40) * 8;
    const holidayPay = eligible ? holidayHours * hourly : 0;
    const basePay = hourly * weeklyHours;
    const weeklyTotal = basePay + holidayPay;
    const monthlyEstimate = weeklyTotal * WEEKS_PER_MONTH;
    // 주 40시간 근무 시 월 환산 기준시간 209시간과 일치
    const effectiveHourly = weeklyTotal / weeklyHours;

    return {
      eligible,
      holidayHours,
      holidayPay,
      basePay,
      weeklyTotal,
      monthlyEstimate,
      effectiveHourly,
    };
  }, [hourly, weeklyHours]);

  const belowMinWage = hourly > 0 && hourly < MIN_HOURLY_WAGE;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="hourly">시급 (원)</Label>
              <Input
                id="hourly"
                inputMode="numeric"
                placeholder={`예: ${MIN_HOURLY_WAGE.toLocaleString("ko-KR")}`}
                value={hourly > 0 ? hourly.toLocaleString("ko-KR") : ""}
                onChange={(e) => setHourlyStr(e.target.value)}
              />
              {belowMinWage && (
                <p className="mt-1.5 text-xs text-red-500">
                  2026년 최저시급({formatNumber(MIN_HOURLY_WAGE)}원)보다
                  낮습니다.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="weeklyHours">1주 소정근로시간 (시간)</Label>
              <Input
                id="weeklyHours"
                inputMode="decimal"
                placeholder="예: 20 (주 5일 × 4시간)"
                value={hoursStr}
                onChange={(e) => setHoursStr(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && !result.eligible && (
        <ResultBox>
          <p className="text-sm leading-relaxed">
            1주 소정근로시간이 <b>{formatNumber(weeklyHours, 1)}시간</b>으로 주
            15시간 미만입니다. 주휴수당은{" "}
            <b>1주 소정근로시간 15시간 이상 + 소정근로일 개근</b> 시
            지급되므로, 이 경우 주휴수당 지급 대상이 아닙니다.
          </p>
          <div className="my-3 border-t border-border" />
          <StatRow
            label="주급 (주휴수당 없음)"
            value={`${formatKRW(result.basePay)} 원`}
          />
          <StatRow
            label="월 예상급여"
            value={`${formatKRW(result.monthlyEstimate)} 원`}
            sub={`주급 × ${WEEKS_PER_MONTH}주`}
          />
        </ResultBox>
      )}

      {result && result.eligible && (
        <ResultBox>
          <StatRow
            label="주휴시간"
            value={`${formatNumber(result.holidayHours, 1)}시간`}
            sub="(주 근로시간 ÷ 40) × 8, 최대 8시간"
          />
          <StatRow
            label="주휴수당 (1주)"
            value={`${formatKRW(result.holidayPay)} 원`}
            highlight
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="기본 주급"
            value={`${formatKRW(result.basePay)} 원`}
            sub={`시급 × ${formatNumber(weeklyHours, 1)}시간`}
          />
          <StatRow
            label="주급 합계 (주휴 포함)"
            value={`${formatKRW(result.weeklyTotal)} 원`}
          />
          <StatRow
            label="월 예상급여"
            value={`${formatKRW(result.monthlyEstimate)} 원`}
            sub={`주급 × ${WEEKS_PER_MONTH}주 (세전)`}
          />
          <StatRow
            label="주휴 포함 실질 시급"
            value={`${formatKRW(result.effectiveHourly)} 원`}
          />
          <div className="mt-4">
            <ShareButton
              title="주휴수당 계산 결과"
              text={`시급 ${formatKRW(hourly)}원 · 주 ${formatNumber(weeklyHours, 1)}시간 근무 시 주휴수당은 ${formatKRW(result.holidayPay)}원, 월 예상급여는 ${formatKRW(result.monthlyEstimate)}원!`}
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            주휴수당이란?
          </h2>
          <p>
            1주 소정근로시간이 15시간 이상이고 소정근로일을 개근하면, 1주에
            1일 이상의 <b className="text-foreground">유급휴일</b>이 부여됩니다
            (근로기준법 제55조). 이때 지급되는 하루치 임금이 주휴수당으로,{" "}
            <b className="text-foreground">
              (1주 소정근로시간 ÷ 40) × 8 × 시급
            </b>
            으로 계산합니다.
          </p>
          <p className="mt-2">
            주 40시간 이상 근무해도 주휴시간은 8시간이 최대이며, 지각·조퇴는
            개근에 영향을 주지 않지만 결근한 주에는 주휴수당이 발생하지
            않습니다. 월 예상급여는 4대보험·소득세 공제 전 세전 금액입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
