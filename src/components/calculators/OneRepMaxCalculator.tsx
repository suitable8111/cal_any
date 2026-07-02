"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { formatNumber, parseNumber } from "@/lib/utils";

const PERCENT_TABLE: { pct: number; reps: string }[] = [
  { pct: 100, reps: "1" },
  { pct: 95, reps: "2" },
  { pct: 90, reps: "4" },
  { pct: 85, reps: "6" },
  { pct: 80, reps: "8" },
  { pct: 75, reps: "10" },
  { pct: 70, reps: "12" },
  { pct: 65, reps: "15" },
  { pct: 60, reps: "18~20" },
  { pct: 50, reps: "24~30" },
];

function epley(w: number, r: number) {
  return w * (1 + r / 30);
}
function brzycki(w: number, r: number) {
  if (r >= 37) return NaN;
  return (w * 36) / (37 - r);
}
function lombardi(w: number, r: number) {
  return w * Math.pow(r, 0.1);
}

export function OneRepMaxCalculator() {
  const [weightStr, setWeightStr] = useState("");
  const [repsStr, setRepsStr] = useState("");

  const weight = parseNumber(weightStr);
  const reps = Math.round(parseNumber(repsStr));

  const result = useMemo(() => {
    if (weight <= 0 || reps <= 0) return null;
    if (reps === 1) {
      return { epley: weight, brzycki: weight, lombardi: weight, average: weight };
    }
    const e = epley(weight, reps);
    const b = brzycki(weight, reps);
    const l = lombardi(weight, reps);
    const values = [e, b, l].filter((v) => Number.isFinite(v));
    const average = values.reduce((s, v) => s + v, 0) / values.length;
    return { epley: e, brzycki: b, lombardi: l, average };
  }, [weight, reps]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="weight">사용 중량 (kg)</Label>
              <Input
                id="weight"
                inputMode="decimal"
                placeholder="예: 100"
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reps">반복 횟수 (회)</Label>
              <Input
                id="reps"
                inputMode="numeric"
                placeholder="예: 5"
                value={repsStr}
                onChange={(e) => setRepsStr(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            정확도가 높은 6회 이하 반복 기록을 입력하는 것을 권장합니다.
          </p>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <>
          <ResultBox>
            <StatRow
              label="예상 1RM (평균)"
              value={`${formatNumber(result.average, 1)} kg`}
              highlight
            />
            <StatRow label="Epley 공식" value={`${formatNumber(result.epley, 1)} kg`} />
            {Number.isFinite(result.brzycki) && (
              <StatRow
                label="Brzycki 공식"
                value={`${formatNumber(result.brzycki, 1)} kg`}
              />
            )}
            <StatRow
              label="Lombardi 공식"
              value={`${formatNumber(result.lombardi, 1)} kg`}
            />
          </ResultBox>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-base font-semibold">%1RM 훈련 강도표</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">강도</th>
                      <th className="py-2 pr-3 font-medium">중량</th>
                      <th className="py-2 font-medium">참고 반복 횟수</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {PERCENT_TABLE.map((row) => (
                      <tr key={row.pct} className="border-b border-border/50">
                        <td className="py-2 pr-3">{row.pct}%</td>
                        <td className="py-2 pr-3">
                          {formatNumber((result.average * row.pct) / 100, 1)} kg
                        </td>
                        <td className="py-2 text-muted-foreground">{row.reps}회</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 기준 안내
          </h2>
          <p>
            1RM(1회 최대 반복 중량)은 Epley·Brzycki·Lombardi 세 가지 공식의
            평균으로 추정합니다. 반복 횟수가 많을수록(특히 10회 초과) 추정
            오차가 커지므로 실제 훈련 기록과 다를 수 있습니다. %1RM 강도표는
            추정 1RM을 기준으로 각 훈련 강도별 목표 중량을 계산한 참고용
            수치입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
