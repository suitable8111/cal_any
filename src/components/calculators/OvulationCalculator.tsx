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
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function fmtFull(d: Date): string {
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function OvulationCalculator() {
  const [lmpStr, setLmpStr] = useState("");
  const [cycleStr, setCycleStr] = useState("28");

  const cycle = Math.round(parseNumber(cycleStr)) || 28;

  const result = useMemo(() => {
    if (!lmpStr || cycle < 20 || cycle > 45) return null;
    const lmp = new Date(lmpStr);
    if (Number.isNaN(lmp.getTime())) return null;

    // 배란일 = 다음 생리 예정일 − 14일 (황체기 14일 고정 가정)
    const cycles = [0, 1, 2].map((i) => {
      const nextPeriod = addDays(lmp, cycle * (i + 1));
      const ovulation = addDays(nextPeriod, -14);
      return {
        ovulation,
        nextPeriod,
        fertileStart: addDays(ovulation, -5),
        fertileEnd: addDays(ovulation, 1),
      };
    });

    return { cycles };
  }, [lmpStr, cycle]);

  const first = result?.cycles[0];

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
                placeholder="예: 28 (20~45일)"
                value={cycleStr}
                onChange={(e) => setCycleStr(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {first && (
        <ResultBox>
          <StatRow
            label="예상 배란일"
            value={fmtFull(first.ovulation)}
            highlight
          />
          <StatRow
            label="가임기 (임신 가능성 높음)"
            value={`${fmt(first.fertileStart)} ~ ${fmt(first.fertileEnd)}`}
            sub="배란일 5일 전 ~ 1일 후"
          />
          <StatRow
            label="다음 생리 예정일"
            value={fmtFull(first.nextPeriod)}
          />
          <div className="mt-4">
            <ShareButton
              title="배란일 계산 결과"
              text={`예상 배란일은 ${fmtFull(first.ovulation)}, 가임기는 ${fmt(first.fertileStart)}~${fmt(first.fertileEnd)}!`}
            />
          </div>
        </ResultBox>
      )}

      {result && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-3 text-base font-semibold">
              향후 3주기 예측
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">주기</th>
                    <th className="py-2 pr-3 font-medium">배란일</th>
                    <th className="py-2 pr-3 font-medium">가임기</th>
                    <th className="py-2 font-medium">생리 예정일</th>
                  </tr>
                </thead>
                <tbody>
                  {result.cycles.map((c, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 pr-3">{i + 1}주기</td>
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {fmt(c.ovulation)}
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {fmt(c.fertileStart)} ~ {fmt(c.fertileEnd)}
                      </td>
                      <td className="py-2 whitespace-nowrap">
                        {fmt(c.nextPeriod)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 안내
          </h2>
          <p>
            배란일은{" "}
            <b className="text-foreground">다음 생리 예정일에서 14일 전</b>
            (황체기 14일 가정)으로 추정합니다. 정자는 몸속에서 최대 5일
            생존하고 난자는 배란 후 약 24시간 수정 가능하므로, 가임기는
            배란일 5일 전부터 1일 후까지로 봅니다. 생리 주기가 불규칙하면
            오차가 커지므로 배란테스트기나 기초체온법을 병행하는 것이
            정확합니다. 이 계산은 피임 목적으로 사용하기에는 신뢰도가
            충분하지 않습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
