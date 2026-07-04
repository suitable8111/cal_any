"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { formatNumber, parseNumber } from "@/lib/utils";

type Gender = "male" | "female";

/** 성별 체지방률 구간 (ACE 기준) */
const CATEGORIES: Record<
  Gender,
  Array<{ max: number; label: string }>
> = {
  male: [
    { max: 5, label: "필수지방 미만" },
    { max: 13, label: "운동선수" },
    { max: 17, label: "탄탄함" },
    { max: 24, label: "평균" },
    { max: Infinity, label: "비만" },
  ],
  female: [
    { max: 13, label: "필수지방 미만" },
    { max: 20, label: "운동선수" },
    { max: 24, label: "탄탄함" },
    { max: 31, label: "평균" },
    { max: Infinity, label: "비만" },
  ],
};

/** 미 해군(US Navy) 둘레 공식 (cm 단위) */
function navyBodyFat(
  gender: Gender,
  height: number,
  neck: number,
  waist: number,
  hip: number
): number | null {
  if (gender === "male") {
    if (waist - neck <= 0) return null;
    return (
      495 /
        (1.0324 -
          0.19077 * Math.log10(waist - neck) +
          0.15456 * Math.log10(height)) -
      450
    );
  }
  if (waist + hip - neck <= 0) return null;
  return (
    495 /
      (1.29579 -
        0.35004 * Math.log10(waist + hip - neck) +
        0.221 * Math.log10(height)) -
    450
  );
}

export function BodyFatCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [heightStr, setHeightStr] = useState("");
  const [neckStr, setNeckStr] = useState("");
  const [waistStr, setWaistStr] = useState("");
  const [hipStr, setHipStr] = useState("");
  const [weightStr, setWeightStr] = useState("");

  const height = parseNumber(heightStr);
  const neck = parseNumber(neckStr);
  const waist = parseNumber(waistStr);
  const hip = parseNumber(hipStr);
  const weight = parseNumber(weightStr);

  const result = useMemo(() => {
    if (height <= 0 || neck <= 0 || waist <= 0) return null;
    if (gender === "female" && hip <= 0) return null;

    const pct = navyBodyFat(gender, height, neck, waist, hip);
    if (pct === null || !Number.isFinite(pct) || pct < 1 || pct > 75)
      return null;

    const category =
      CATEGORIES[gender].find((c) => pct <= c.max)?.label ?? "";
    const fatMass = weight > 0 ? (weight * pct) / 100 : null;
    const leanMass = weight > 0 && fatMass !== null ? weight - fatMass : null;

    return { pct, category, fatMass, leanMass };
  }, [gender, height, neck, waist, hip, weight]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label>성별</Label>
            <OptionGroup
              options={[
                { label: "남성", value: "male" },
                { label: "여성", value: "female" },
              ]}
              value={gender}
              onChange={setGender}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="height">키 (cm)</Label>
              <Input
                id="height"
                inputMode="decimal"
                placeholder="예: 175"
                value={heightStr}
                onChange={(e) => setHeightStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="neck">목 둘레 (cm)</Label>
              <Input
                id="neck"
                inputMode="decimal"
                placeholder="후두 아래 가장 가는 곳 · 예: 38"
                value={neckStr}
                onChange={(e) => setNeckStr(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="waist">허리 둘레 (cm)</Label>
              <Input
                id="waist"
                inputMode="decimal"
                placeholder={
                  gender === "male"
                    ? "배꼽 높이 · 예: 85"
                    : "가장 가는 곳 · 예: 70"
                }
                value={waistStr}
                onChange={(e) => setWaistStr(e.target.value)}
              />
            </div>
            {gender === "female" ? (
              <div>
                <Label htmlFor="hip">엉덩이 둘레 (cm)</Label>
                <Input
                  id="hip"
                  inputMode="decimal"
                  placeholder="가장 넓은 곳 · 예: 95"
                  value={hipStr}
                  onChange={(e) => setHipStr(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="weight">몸무게 (선택, kg)</Label>
                <Input
                  id="weight"
                  inputMode="decimal"
                  placeholder="체지방량 계산용 · 예: 72"
                  value={weightStr}
                  onChange={(e) => setWeightStr(e.target.value)}
                />
              </div>
            )}
          </div>

          {gender === "female" && (
            <div>
              <Label htmlFor="weight2">몸무게 (선택, kg)</Label>
              <Input
                id="weight2"
                inputMode="decimal"
                placeholder="체지방량 계산용 · 예: 55"
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label="추정 체지방률"
            value={`${formatNumber(result.pct, 1)}%`}
            highlight
          />
          <StatRow label="판정" value={result.category} />
          {result.fatMass !== null && result.leanMass !== null && (
            <>
              <StatRow
                label="체지방량"
                value={`${formatNumber(result.fatMass, 1)} kg`}
              />
              <StatRow
                label="제지방량 (근육·뼈·수분 등)"
                value={`${formatNumber(result.leanMass, 1)} kg`}
              />
            </>
          )}
          <div className="mt-4">
            <ShareButton
              title="체지방률 계산 결과"
              text={`내 추정 체지방률은 ${formatNumber(result.pct, 1)}% (${result.category})!`}
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 text-base font-semibold">
            체지방률 기준표 (ACE)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">분류</th>
                  <th className="py-2 pr-3 font-medium">남성</th>
                  <th className="py-2 font-medium">여성</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["필수지방", "2~5%", "10~13%"],
                  ["운동선수", "6~13%", "14~20%"],
                  ["탄탄함", "14~17%", "21~24%"],
                  ["평균", "18~24%", "25~31%"],
                  ["비만", "25% 이상", "32% 이상"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-border/50">
                    <td className="py-2 pr-3">{row[0]}</td>
                    <td className="py-2 pr-3">{row[1]}</td>
                    <td className="py-2">{row[2]}</td>
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
            미 해군(US Navy) 둘레 공식은 줄자만으로 체지방률을 추정하는
            방법으로, 실측(DEXA) 대비 ±3%p 내외의 오차가 있습니다. 아침
            공복에 같은 부위를 일정하게 측정하면 변화 추적에 유용합니다.
            인바디 등 생체전기저항 측정과도 값이 다를 수 있으니 하나의 기준을
            정해 추이를 보는 것이 좋습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
