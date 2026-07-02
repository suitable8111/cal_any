"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { cn, formatNumber, parseNumber } from "@/lib/utils";

type Gender = "male" | "female";
type ActivityId = "sedentary" | "light" | "moderate" | "active" | "veryActive";

const ACTIVITY: Record<ActivityId, { label: string; hint: string; mul: number }> = {
  sedentary: { label: "거의 안 함", hint: "운동 안 함", mul: 1.2 },
  light: { label: "가벼운 활동", hint: "주 1~3일", mul: 1.375 },
  moderate: { label: "보통 활동", hint: "주 3~5일", mul: 1.55 },
  active: { label: "활발한 활동", hint: "주 6~7일", mul: 1.725 },
  veryActive: { label: "매우 활발함", hint: "매일 고강도", mul: 1.9 },
};

interface BmiCategory {
  label: string;
  range: string;
  color: string;
}

function classifyBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return { label: "저체중", range: "18.5 미만", color: "text-sky-500" };
  if (bmi < 23) return { label: "정상", range: "18.5 ~ 22.9", color: "text-emerald-500" };
  if (bmi < 25) return { label: "비만 전단계(과체중)", range: "23 ~ 24.9", color: "text-amber-500" };
  if (bmi < 30) return { label: "1단계 비만", range: "25 ~ 29.9", color: "text-orange-500" };
  if (bmi < 35) return { label: "2단계 비만", range: "30 ~ 34.9", color: "text-red-500" };
  return { label: "3단계(고도) 비만", range: "35 이상", color: "text-red-700" };
}

export function BmiBmrCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [heightStr, setHeightStr] = useState("");
  const [weightStr, setWeightStr] = useState("");
  const [ageStr, setAgeStr] = useState("");
  const [activity, setActivity] = useState<ActivityId>("light");

  const height = parseNumber(heightStr);
  const weight = parseNumber(weightStr);
  const age = parseNumber(ageStr);

  const result = useMemo(() => {
    if (height <= 0 || weight <= 0 || age <= 0) return null;

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const category = classifyBmi(bmi);
    const standardWeight = 22 * heightM * heightM;

    // Mifflin-St Jeor
    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = bmr * ACTIVITY[activity].mul;

    return { bmi, category, standardWeight, bmr, tdee };
  }, [height, weight, age, gender, activity]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label>성별</Label>
            <OptionGroup<Gender>
              options={[
                { label: "남성", value: "male" },
                { label: "여성", value: "female" },
              ]}
              value={gender}
              onChange={setGender}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="height">키 (cm)</Label>
              <Input
                id="height"
                inputMode="decimal"
                placeholder="예: 170"
                value={heightStr}
                onChange={(e) => setHeightStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="weight">몸무게 (kg)</Label>
              <Input
                id="weight"
                inputMode="decimal"
                placeholder="예: 65"
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="age">나이</Label>
              <Input
                id="age"
                inputMode="numeric"
                placeholder="예: 30"
                value={ageStr}
                onChange={(e) => setAgeStr(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>활동량</Label>
            <OptionGroup<ActivityId>
              options={(Object.keys(ACTIVITY) as ActivityId[]).map((k) => ({
                label: ACTIVITY[k].label,
                value: k,
                hint: ACTIVITY[k].hint,
              }))}
              value={activity}
              onChange={setActivity}
              columns={3}
            />
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label="BMI (체질량지수)"
            value={formatNumber(result.bmi, 1)}
            sub={result.category.range}
            highlight
          />
          <StatRow
            label="비만도 판정"
            value={
              <span className={cn("font-semibold", result.category.color)}>
                {result.category.label}
              </span>
            }
          />
          <StatRow
            label="표준 체중 (BMI 22 기준)"
            value={`${formatNumber(result.standardWeight, 1)} kg`}
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="기초대사량 (BMR)"
            value={`${formatNumber(result.bmr, 0)} kcal`}
            sub="가만히 있어도 소비되는 하루 열량"
          />
          <StatRow
            label="일일 권장 칼로리 (TDEE)"
            value={`${formatNumber(result.tdee, 0)} kcal`}
            sub={`${ACTIVITY[activity].label} 기준`}
            highlight
          />
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 기준 안내
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>비만도 판정은 대한비만학회 아시아·태평양 기준(BMI 23 이상 과체중)을 따릅니다.</li>
            <li>
              기초대사량은 최신 연구에서 정확도가 높다고 평가되는{" "}
              <b className="text-foreground">Mifflin-St Jeor</b> 공식으로 계산합니다.
            </li>
            <li>
              일일 권장 칼로리는 기초대사량에 활동량 계수를 곱한 값으로, 체중
              유지 기준입니다. 감량은 500kcal 내외를 줄이는 것이 일반적으로
              권장됩니다.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
