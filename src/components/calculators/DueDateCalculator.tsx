"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { parseNumber } from "@/lib/utils";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * MS_PER_DAY);
}

function fmt(d: Date): string {
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

/** 시기별 주요 검사 (임신 주수 기준) */
const CHECKUPS: Array<{ weeks: number; label: string }> = [
  { weeks: 10, label: "1차 기형아 검사 (NT 초음파, 10~13주)" },
  { weeks: 16, label: "2차 기형아 검사 (쿼드 검사, 15~20주)" },
  { weeks: 20, label: "정밀 초음파 (20~24주)" },
  { weeks: 24, label: "임신성 당뇨 검사 (24~28주)" },
  { weeks: 36, label: "막달 검사 (36주~)" },
];

export function DueDateCalculator() {
  const [lmpStr, setLmpStr] = useState("");
  const [cycleStr, setCycleStr] = useState("28");

  const cycle = Math.round(parseNumber(cycleStr)) || 28;

  const result = useMemo(() => {
    if (!lmpStr) return null;
    const lmp = new Date(lmpStr);
    if (Number.isNaN(lmp.getTime())) return null;

    // 네겔레 법칙: LMP + 280일, 주기가 28일과 다르면 차이만큼 보정
    const dueDate = addDays(lmp, 280 + (cycle - 28));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lmpDay = new Date(lmp);
    lmpDay.setHours(0, 0, 0, 0);

    const daysPregnant = Math.floor(
      (today.getTime() - lmpDay.getTime()) / MS_PER_DAY
    );
    const weeks = Math.floor(daysPregnant / 7);
    const days = daysPregnant % 7;
    const daysLeft = Math.ceil(
      (dueDate.getTime() - today.getTime()) / MS_PER_DAY
    );

    const trimester = weeks < 14 ? 1 : weeks < 28 ? 2 : 3;
    const valid = daysPregnant >= 0 && daysPregnant <= 320;

    return { dueDate, daysPregnant, weeks, days, daysLeft, trimester, valid };
  }, [lmpStr, cycle]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="lmp">마지막 생리 시작일</Label>
              <Input
                id="lmp"
                type="date"
                value={lmpStr}
                onChange={(e) => setLmpStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cycle">평균 생리 주기 (일)</Label>
              <Input
                id="cycle"
                inputMode="numeric"
                placeholder="예: 28"
                value={cycleStr}
                onChange={(e) => setCycleStr(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label="출산예정일"
            value={fmt(result.dueDate)}
            highlight
          />
          {result.valid && (
            <>
              <StatRow
                label="현재 임신 주수"
                value={`${result.weeks}주 ${result.days}일`}
                sub={`임신 ${Math.floor(result.weeks / 4) + 1}개월차`}
              />
              <StatRow
                label="삼분기"
                value={`${result.trimester}삼분기`}
                sub={
                  result.trimester === 1
                    ? "~13주: 초기"
                    : result.trimester === 2
                      ? "14~27주: 중기"
                      : "28주~: 후기"
                }
              />
              <StatRow
                label="출산까지"
                value={`D-${result.daysLeft}`}
                sub={`약 ${Math.floor(result.daysLeft / 7)}주 남음`}
              />
            </>
          )}
          <div className="mt-4">
            <ShareButton
              title="출산예정일 계산 결과"
              text={
                result.valid
                  ? `출산예정일은 ${fmt(result.dueDate)}, 현재 ${result.weeks}주 ${result.days}일차!`
                  : `출산예정일은 ${fmt(result.dueDate)}!`
              }
            />
          </div>
        </ResultBox>
      )}

      {result && result.valid && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-3 text-base font-semibold">
              시기별 주요 검사 일정
            </h2>
            <ul className="space-y-2 text-sm">
              {CHECKUPS.map((c) => {
                const passed = result.weeks >= c.weeks;
                return (
                  <li
                    key={c.weeks}
                    className={
                      passed
                        ? "text-muted-foreground line-through decoration-border"
                        : "text-foreground"
                    }
                  >
                    <span className="mr-2 font-medium">{c.weeks}주~</span>
                    {c.label}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              검사 시기는 병원과 산모 상태에 따라 달라질 수 있습니다. 담당
              의사의 안내를 따르세요.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 안내
          </h2>
          <p>
            출산예정일은 네겔레 법칙에 따라{" "}
            <b className="text-foreground">
              마지막 생리 시작일 + 280일(40주)
            </b>
            로 계산하며, 생리 주기가 28일과 다르면 그 차이만큼 보정합니다.
            실제 분만일은 예정일 ±2주 범위가 일반적이며, 초기 초음파로 측정한
            아기 크기 기준 예정일이 더 정확할 수 있으니 산부인과 진료 결과를
            우선하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
