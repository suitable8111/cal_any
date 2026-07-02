"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { formatKRW, formatNumber } from "@/lib/utils";

type ChargerId = "slow7" | "fast50" | "fast100";
type LoadId = "off" | "mid" | "peak";

const CHARGERS: Record<
  ChargerId,
  { label: string; hint: string; power: number; price: number; fast: boolean }
> = {
  slow7: { label: "완속", hint: "7kW", power: 7, price: 250, fast: false },
  fast50: { label: "급속", hint: "50kW", power: 50, price: 300, fast: true },
  fast100: { label: "초급속", hint: "100kW+", power: 100, price: 350, fast: true },
};

const LOADS: Record<LoadId, { label: string; hint: string; mul: number }> = {
  off: { label: "경부하", hint: "심야", mul: 0.9 },
  mid: { label: "중간부하", hint: "주간", mul: 1.0 },
  peak: { label: "최대부하", hint: "피크", mul: 1.1 },
};

const EFFICIENCY = 0.9; // 충전 손실 약 10%

function chargeHours(
  capacity: number,
  current: number,
  target: number,
  power: number,
  fast: boolean
): number {
  // 배터리에 실제 저장되는 에너지(충전기가 공급하는 양 기준)
  if (!fast) {
    const dispensed = (capacity * (target - current)) / 100 / EFFICIENCY;
    return dispensed / power;
  }
  // 급속: 80% 초과 구간은 출력이 절반으로 감소(테이퍼링) 가정
  const lo = Math.min(target, 80);
  const e1 = (capacity * Math.max(0, lo - current)) / 100 / EFFICIENCY;
  const e2 =
    (capacity * Math.max(0, target - Math.max(current, 80))) / 100 / EFFICIENCY;
  return e1 / power + e2 / (power * 0.5);
}

function fmtDuration(hours: number): string {
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function EvChargingCalculator() {
  const [capacity, setCapacity] = useState("64");
  const [current, setCurrent] = useState("20");
  const [target, setTarget] = useState("80");
  const [charger, setCharger] = useState<ChargerId>("fast50");
  const [load, setLoad] = useState<LoadId>("mid");

  const result = useMemo(() => {
    const cap = Number(capacity);
    const cur = Number(current);
    const tgt = Number(target);
    if (!cap || cap <= 0) return null;
    if (cur < 0 || tgt > 100 || cur >= tgt) return null;

    const c = CHARGERS[charger];
    const unitPrice = c.price * LOADS[load].mul;
    const batteryEnergy = (cap * (tgt - cur)) / 100;
    const dispensed = batteryEnergy / EFFICIENCY;
    const cost = dispensed * unitPrice;
    const hours = chargeHours(cap, cur, tgt, c.power, c.fast);

    return {
      batteryEnergy,
      dispensed,
      unitPrice,
      cost,
      hours,
      addedPct: tgt - cur,
    };
  }, [capacity, current, target, charger, load]);

  const inputError =
    Number(current) >= Number(target) || Number(target) > 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="cap">배터리 용량 (kWh)</Label>
              <Input
                id="cap"
                inputMode="decimal"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cur">현재 잔량 (%)</Label>
              <Input
                id="cur"
                inputMode="numeric"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tgt">목표 충전 (%)</Label>
              <Input
                id="tgt"
                inputMode="numeric"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
          </div>
          {inputError && (
            <p className="text-sm text-danger">
              목표 충전량은 현재 잔량보다 크고 100% 이하여야 합니다.
            </p>
          )}

          <div>
            <Label>충전기 종류</Label>
            <OptionGroup<ChargerId>
              options={(
                Object.keys(CHARGERS) as ChargerId[]
              ).map((k) => ({
                label: CHARGERS[k].label,
                value: k,
                hint: CHARGERS[k].hint,
              }))}
              value={charger}
              onChange={setCharger}
            />
          </div>

          <div>
            <Label>시간대 (부하)</Label>
            <OptionGroup<LoadId>
              options={(Object.keys(LOADS) as LoadId[]).map((k) => ({
                label: LOADS[k].label,
                value: k,
                hint: LOADS[k].hint,
              }))}
              value={load}
              onChange={setLoad}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. 입력 폼과 결과창 사이 콘텐츠 삽입형 배너 */}
      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label="예상 충전 비용"
            value={`${formatKRW(result.cost)} 원`}
            highlight
          />
          <StatRow label="예상 충전 시간" value={fmtDuration(result.hours)} />
          <StatRow
            label="충전량"
            value={`${formatNumber(result.batteryEnergy, 1)} kWh`}
            sub={`+${result.addedPct}% 충전`}
          />
          <StatRow
            label="적용 단가"
            value={`${formatNumber(result.unitPrice, 0)} 원/kWh`}
            sub={`공급 전력 ${formatNumber(result.dispensed, 1)} kWh (효율 ${
              EFFICIENCY * 100
            }%)`}
          />
          <div className="mt-4">
            <ShareButton
              title="전기차 충전요금 계산 결과"
              text={`예상 충전 비용 ${formatKRW(result.cost)}원, 충전 시간 ${fmtDuration(result.hours)}`}
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 기준 안내
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>충전 효율 90%(손실 10%)를 반영해 공급 전력량을 산정합니다.</li>
            <li>
              급속 충전은 배터리 보호를 위해 80% 초과 구간에서 출력이 절반으로
              감소한다고 가정합니다.
            </li>
            <li>
              단가는 완속 250 / 급속 300 / 초급속 350원·kWh 기준에 시간대 부하
              계수를 곱한 예시값입니다.
            </li>
          </ul>
          <p className="mt-3 text-xs">
            실제 요금·출력은 충전 사업자(환경부, 한전, 민간), 계약 및 차량
            충전 곡선에 따라 달라집니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
