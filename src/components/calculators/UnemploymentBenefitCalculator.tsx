"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { formatKRW, formatNumber, parseNumber } from "@/lib/utils";

/** 구직급여 1일 상한액 (2025년 기준 66,000원 — 2026년 고시 확정 전까지 동일 가정) */
const DAILY_CAP = 66_000;
/** 2026년 최저시급 */
const MIN_HOURLY_WAGE = 10_320;

type AgeGroup = "under50" | "over50";
type InsuredPeriod = "p1" | "p2" | "p3" | "p4" | "p5";
type DailyHours = "8" | "7" | "6" | "5" | "4";

/** 소정급여일수 표 (2019.10.1 이후 이직자 기준) */
const BENEFIT_DAYS: Record<InsuredPeriod, { under50: number; over50: number }> =
  {
    p1: { under50: 120, over50: 120 },
    p2: { under50: 150, over50: 180 },
    p3: { under50: 180, over50: 210 },
    p4: { under50: 210, over50: 240 },
    p5: { under50: 240, over50: 270 },
  };

const PERIOD_OPTIONS: Array<{ label: string; value: InsuredPeriod }> = [
  { label: "1년 미만", value: "p1" },
  { label: "1~3년", value: "p2" },
  { label: "3~5년", value: "p3" },
  { label: "5~10년", value: "p4" },
  { label: "10년 이상", value: "p5" },
];

export function UnemploymentBenefitCalculator() {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("under50");
  const [period, setPeriod] = useState<InsuredPeriod>("p2");
  const [hours, setHours] = useState<DailyHours>("8");
  const [wageStr, setWageStr] = useState("");

  const monthlyWage = parseNumber(wageStr);

  const result = useMemo(() => {
    if (monthlyWage <= 0) return null;

    // 평균임금일액 = 퇴직 전 3개월 임금총액 ÷ 3개월 일수(약 91일)
    const avgDailyWage = (monthlyWage * 3) / 91;
    const baseDaily = avgDailyWage * 0.6;

    const h = Number(hours);
    const dailyFloor = Math.min(MIN_HOURLY_WAGE * 0.8 * h, DAILY_CAP);
    const dailyBenefit = Math.min(Math.max(baseDaily, dailyFloor), DAILY_CAP);

    const days = BENEFIT_DAYS[period][ageGroup];
    const total = dailyBenefit * days;

    return {
      avgDailyWage,
      baseDaily,
      dailyFloor,
      dailyBenefit,
      capped: baseDaily > DAILY_CAP,
      floored: baseDaily < dailyFloor,
      days,
      total,
    };
  }, [monthlyWage, hours, period, ageGroup]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label>퇴사(이직) 당시 만 나이</Label>
            <OptionGroup
              options={[
                { label: "50세 미만", value: "under50" },
                { label: "50세 이상 · 장애인", value: "over50" },
              ]}
              value={ageGroup}
              onChange={setAgeGroup}
            />
          </div>

          <div>
            <Label>고용보험 가입기간</Label>
            <OptionGroup
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
              columns={5}
              className="max-sm:grid-cols-3"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="monthlyWage">
                퇴직 전 3개월 월평균 임금 (세전, 원)
              </Label>
              <Input
                id="monthlyWage"
                inputMode="numeric"
                placeholder="예: 3,000,000"
                value={
                  monthlyWage > 0 ? monthlyWage.toLocaleString("ko-KR") : ""
                }
                onChange={(e) => setWageStr(e.target.value)}
              />
            </div>
            <div>
              <Label>1일 소정근로시간</Label>
              <OptionGroup
                options={[
                  { label: "8시간+", value: "8" },
                  { label: "7시간", value: "7" },
                  { label: "6시간", value: "6" },
                  { label: "5시간", value: "5" },
                  { label: "4시간↓", value: "4" },
                ]}
                value={hours}
                onChange={setHours}
                columns={5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label="1일 평균임금"
            value={`${formatKRW(result.avgDailyWage)} 원`}
            sub="퇴직 전 3개월 임금 ÷ 91일"
          />
          <StatRow
            label="평균임금의 60%"
            value={`${formatKRW(result.baseDaily)} 원`}
          />
          <StatRow
            label="구직급여 1일 지급액"
            value={`${formatKRW(result.dailyBenefit)} 원`}
            sub={
              result.capped
                ? `상한액 ${formatKRW(DAILY_CAP)}원 적용`
                : result.floored
                  ? `하한액 ${formatKRW(result.dailyFloor)}원 적용`
                  : undefined
            }
          />
          <StatRow
            label="소정급여일수"
            value={`${result.days}일`}
            sub={`약 ${Math.round(result.days / 30)}개월`}
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="총 예상 수령액"
            value={`${formatKRW(result.total)} 원`}
            highlight
          />
          <div className="mt-4">
            <ShareButton
              title="실업급여 계산 결과"
              text={`구직급여 1일 ${formatKRW(result.dailyBenefit)}원 × ${result.days}일 = 총 ${formatKRW(result.total)}원 예상!`}
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 text-base font-semibold">
            소정급여일수 표 (2019.10 이후 이직자)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">고용보험 가입기간</th>
                  <th className="py-2 pr-3 font-medium">50세 미만</th>
                  <th className="py-2 font-medium">50세 이상 · 장애인</th>
                </tr>
              </thead>
              <tbody>
                {PERIOD_OPTIONS.map((opt) => (
                  <tr
                    key={opt.value}
                    className={
                      opt.value === period
                        ? "border-b border-border/50 bg-accent/60 font-semibold"
                        : "border-b border-border/50"
                    }
                  >
                    <td className="py-2 pr-3">{opt.label}</td>
                    <td className="py-2 pr-3">
                      {BENEFIT_DAYS[opt.value].under50}일
                    </td>
                    <td className="py-2">{BENEFIT_DAYS[opt.value].over50}일</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 안내
          </h2>
          <p>
            구직급여 1일 지급액은{" "}
            <b className="text-foreground">퇴직 전 평균임금의 60%</b>이며,
            1일 상한액 {formatKRW(DAILY_CAP)}원과 하한액(최저시급의 80% ×
            소정근로시간, 2026년 최저시급 {formatNumber(MIN_HOURLY_WAGE)}원
            기준)이 적용됩니다.
          </p>
          <p className="mt-2">
            실업급여는 <b className="text-foreground">비자발적 이직</b>(권고사직·
            계약만료·폐업 등) 등 수급 요건을 충족하고, 이직 전 18개월 중
            피보험 단위기간이 180일 이상이어야 받을 수 있습니다. 정확한 수급
            자격과 금액은 고용24(고용센터)에서 확인하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
