"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { OptionGroup } from "@/components/ui/option-group";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { formatNumber, parseNumber } from "@/lib/utils";

type CategoryKey = "length" | "area" | "weight" | "volume" | "data";

interface UnitDef {
  key: string;
  label: string;
  /** 카테고리 기준 단위로 환산하는 배수 */
  factor: number;
}

const CATEGORIES: Record<CategoryKey, { label: string; units: UnitDef[] }> = {
  length: {
    label: "길이",
    units: [
      { key: "mm", label: "밀리미터 (mm)", factor: 0.001 },
      { key: "cm", label: "센티미터 (cm)", factor: 0.01 },
      { key: "m", label: "미터 (m)", factor: 1 },
      { key: "km", label: "킬로미터 (km)", factor: 1000 },
      { key: "inch", label: "인치 (in)", factor: 0.0254 },
      { key: "ft", label: "피트 (ft)", factor: 0.3048 },
      { key: "yd", label: "야드 (yd)", factor: 0.9144 },
      { key: "mile", label: "마일 (mile)", factor: 1609.344 },
    ],
  },
  area: {
    label: "넓이",
    units: [
      { key: "cm2", label: "제곱센티미터 (cm²)", factor: 0.0001 },
      { key: "m2", label: "제곱미터 (m²)", factor: 1 },
      { key: "km2", label: "제곱킬로미터 (km²)", factor: 1_000_000 },
      { key: "pyeong", label: "평", factor: 3.305785 },
      { key: "ha", label: "헥타르 (ha)", factor: 10000 },
      { key: "acre", label: "에이커 (acre)", factor: 4046.8564224 },
    ],
  },
  weight: {
    label: "무게",
    units: [
      { key: "mg", label: "밀리그램 (mg)", factor: 0.001 },
      { key: "g", label: "그램 (g)", factor: 1 },
      { key: "kg", label: "킬로그램 (kg)", factor: 1000 },
      { key: "ton", label: "톤 (t)", factor: 1_000_000 },
      { key: "lb", label: "파운드 (lb)", factor: 453.59237 },
      { key: "oz", label: "온스 (oz)", factor: 28.349523125 },
    ],
  },
  volume: {
    label: "부피",
    units: [
      { key: "ml", label: "밀리리터 (mL)", factor: 0.001 },
      { key: "l", label: "리터 (L)", factor: 1 },
      { key: "m3", label: "세제곱미터 (m³)", factor: 1000 },
      { key: "cup", label: "컵 (200mL 기준)", factor: 0.2 },
      { key: "gal", label: "갤런 (US gal)", factor: 3.785411784 },
    ],
  },
  data: {
    label: "데이터 크기",
    units: [
      { key: "b", label: "바이트 (Byte)", factor: 1 },
      { key: "kb", label: "킬로바이트 (KB)", factor: 1024 },
      { key: "mb", label: "메가바이트 (MB)", factor: 1024 ** 2 },
      { key: "gb", label: "기가바이트 (GB)", factor: 1024 ** 3 },
      { key: "tb", label: "테라바이트 (TB)", factor: 1024 ** 4 },
    ],
  },
};

const CATEGORY_OPTIONS = (Object.keys(CATEGORIES) as CategoryKey[]).map((k) => ({
  label: CATEGORIES[k].label,
  value: k,
}));

export function UnitConverterCalculator() {
  const [category, setCategory] = useState<CategoryKey>("length");
  const [fromUnit, setFromUnit] = useState(CATEGORIES.length.units[2].key);
  const [valueStr, setValueStr] = useState("1");

  useEffect(() => {
    setFromUnit(CATEGORIES[category].units[0].key);
  }, [category]);

  const value = parseNumber(valueStr);
  const units = CATEGORIES[category].units;

  const results = useMemo(() => {
    const from = units.find((u) => u.key === fromUnit) ?? units[0];
    const baseValue = value * from.factor;
    return units.map((u) => ({
      ...u,
      value: baseValue / u.factor,
    }));
  }, [units, fromUnit, value]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label>카테고리</Label>
            <OptionGroup<CategoryKey>
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={setCategory}
              columns={3}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="value">변환할 값</Label>
              <Input
                id="value"
                inputMode="decimal"
                value={valueStr}
                onChange={(e) => setValueStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fromUnit">입력 단위</Label>
              <Select
                id="fromUnit"
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
              >
                {units.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 text-base font-semibold">변환 결과</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {results.map((r) => (
              <div
                key={r.key}
                className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3"
              >
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="text-base font-semibold text-foreground">
                  {formatNumber(r.value, 6)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            변환 기준 안내
          </h2>
          <p>
            평은 1평 = 3.305785㎡, 데이터 크기는 1KB = 1024Byte(2진법) 기준으로
            환산합니다. 컵은 한국에서 흔히 쓰이는 200mL 기준이며, 실제 계량컵
            용량은 제품마다 다를 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
