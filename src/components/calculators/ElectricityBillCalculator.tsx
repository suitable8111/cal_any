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

type Season = "summer" | "winter" | "other";
type Voltage = "low" | "high";

/**
 * 주택용 전기요금 요율 (한전, 2024.10 이후 기준).
 * 하계(7~8월)는 누진 구간이 300/450kWh로 완화됩니다.
 */
const RATES: Record<
  Voltage,
  {
    base: [number, number, number]; // 구간별 기본요금(원/호)
    energy: [number, number, number]; // 구간별 전력량요금(원/kWh)
  }
> = {
  low: { base: [910, 1_600, 7_300], energy: [120.0, 214.6, 307.3] },
  high: { base: [730, 1_260, 6_060], energy: [105.0, 174.0, 242.3] },
};

/** 슈퍼유저요금: 하계·동계 1,000kWh 초과분 (원/kWh) */
const SUPER_USER_RATE: Record<Voltage, number> = { low: 736.2, high: 601.3 };

const CLIMATE_RATE = 9.0; // 기후환경요금 (원/kWh)
const FUEL_ADJ_RATE = 5.0; // 연료비조정액 (원/kWh)

function tiersFor(season: Season): [number, number] {
  return season === "summer" ? [300, 450] : [200, 400];
}

interface BillResult {
  baseFee: number;
  tierUsages: [number, number, number];
  tierCosts: [number, number, number];
  superUserUsage: number;
  superUserCost: number;
  energyFee: number;
  climateFee: number;
  fuelAdjFee: number;
  subtotal: number;
  vat: number;
  fund: number;
  total: number;
  tierIndex: number;
}

function calcBill(usage: number, season: Season, voltage: Voltage): BillResult {
  const [t1, t2] = tiersFor(season);
  const { base, energy } = RATES[voltage];

  const u1 = Math.min(usage, t1);
  const u2 = Math.min(Math.max(usage - t1, 0), t2 - t1);
  let u3 = Math.max(usage - t2, 0);

  // 하계·동계 1,000kWh 초과분은 슈퍼유저요금 적용
  let superUserUsage = 0;
  if (season !== "other" && usage > 1_000) {
    superUserUsage = usage - 1_000;
    u3 -= superUserUsage;
  }

  const tierIndex = usage <= t1 ? 0 : usage <= t2 ? 1 : 2;
  const baseFee = base[tierIndex];

  const tierCosts: [number, number, number] = [
    u1 * energy[0],
    u2 * energy[1],
    u3 * energy[2],
  ];
  const superUserCost = superUserUsage * SUPER_USER_RATE[voltage];
  const energyFee =
    tierCosts[0] + tierCosts[1] + tierCosts[2] + superUserCost;

  const climateFee = usage * CLIMATE_RATE;
  const fuelAdjFee = usage * FUEL_ADJ_RATE;

  const subtotal = Math.floor(baseFee + energyFee + climateFee + fuelAdjFee);
  const vat = Math.round(subtotal * 0.1);
  const fund = Math.floor((subtotal * 0.037) / 10) * 10; // 10원 미만 절사
  const total = Math.floor((subtotal + vat + fund) / 10) * 10; // 청구액 10원 미만 절사

  return {
    baseFee,
    tierUsages: [u1, u2, u3],
    tierCosts,
    superUserUsage,
    superUserCost,
    energyFee,
    climateFee,
    fuelAdjFee,
    subtotal,
    vat,
    fund,
    total,
    tierIndex,
  };
}

export function ElectricityBillCalculator() {
  const [usageStr, setUsageStr] = useState("");
  const [season, setSeason] = useState<Season>("summer");
  const [voltage, setVoltage] = useState<Voltage>("low");

  const usage = parseNumber(usageStr);

  const result = useMemo(
    () => (usage > 0 ? calcBill(usage, season, voltage) : null),
    [usage, season, voltage]
  );

  const [t1, t2] = tiersFor(season);
  const { energy } = RATES[voltage];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label htmlFor="usage">월 전기 사용량 (kWh)</Label>
            <Input
              id="usage"
              inputMode="numeric"
              placeholder="예: 350 (고지서 또는 한전ON에서 확인)"
              value={usage > 0 ? usage.toLocaleString("ko-KR") : ""}
              onChange={(e) => setUsageStr(e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>계절</Label>
              <OptionGroup
                options={[
                  { label: "하계", value: "summer", hint: "7~8월" },
                  { label: "동계", value: "winter", hint: "12~2월" },
                  { label: "기타", value: "other", hint: "3~6·9~11월" },
                ]}
                value={season}
                onChange={setSeason}
              />
            </div>
            <div>
              <Label>계약 종류</Label>
              <OptionGroup
                options={[
                  { label: "주택용 저압", value: "low", hint: "일반 가정 대부분" },
                  { label: "주택용 고압", value: "high", hint: "아파트 일부" },
                ]}
                value={voltage}
                onChange={setVoltage}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label={`기본요금 (${result.tierIndex + 1}단계 구간)`}
            value={`${formatKRW(result.baseFee)} 원`}
          />
          <StatRow
            label={`1단계 (~${t1}kWh) · ${formatNumber(result.tierUsages[0])}kWh`}
            value={`${formatKRW(result.tierCosts[0])} 원`}
            sub={`${energy[0]}원/kWh`}
          />
          {result.tierUsages[1] > 0 && (
            <StatRow
              label={`2단계 (${t1 + 1}~${t2}kWh) · ${formatNumber(result.tierUsages[1])}kWh`}
              value={`${formatKRW(result.tierCosts[1])} 원`}
              sub={`${energy[1]}원/kWh`}
            />
          )}
          {result.tierUsages[2] > 0 && (
            <StatRow
              label={`3단계 (${t2}kWh 초과) · ${formatNumber(result.tierUsages[2])}kWh`}
              value={`${formatKRW(result.tierCosts[2])} 원`}
              sub={`${energy[2]}원/kWh`}
            />
          )}
          {result.superUserUsage > 0 && (
            <StatRow
              label={`슈퍼유저 (1,000kWh 초과) · ${formatNumber(result.superUserUsage)}kWh`}
              value={`${formatKRW(result.superUserCost)} 원`}
              sub={`${SUPER_USER_RATE[voltage]}원/kWh`}
            />
          )}
          <StatRow
            label="기후환경요금"
            value={`${formatKRW(result.climateFee)} 원`}
            sub={`${CLIMATE_RATE}원/kWh`}
          />
          <StatRow
            label="연료비조정액"
            value={`${formatKRW(result.fuelAdjFee)} 원`}
            sub={`${FUEL_ADJ_RATE}원/kWh`}
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="전기요금계"
            value={`${formatKRW(result.subtotal)} 원`}
          />
          <StatRow
            label="부가가치세 (10%)"
            value={`${formatKRW(result.vat)} 원`}
          />
          <StatRow
            label="전력산업기반기금 (3.7%)"
            value={`${formatKRW(result.fund)} 원`}
          />
          <StatRow
            label="예상 청구금액"
            value={`${formatKRW(result.total)} 원`}
            highlight
          />
          <div className="mt-4">
            <ShareButton
              title="전기요금 계산 결과"
              text={`월 ${formatNumber(usage)}kWh 사용 시 예상 전기요금은 ${formatKRW(result.total)}원!`}
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 text-base font-semibold">
            주택용 누진 요금표 ({voltage === "low" ? "저압" : "고압"} ·{" "}
            {season === "summer" ? "하계 7~8월" : "기타 계절"})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">구간</th>
                  <th className="py-2 pr-3 font-medium">기본요금 (원/호)</th>
                  <th className="py-2 font-medium">전력량요금 (원/kWh)</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((i) => (
                  <tr
                    key={i}
                    className={
                      result && result.tierIndex === i
                        ? "border-b border-border/50 bg-accent/60 font-semibold"
                        : "border-b border-border/50"
                    }
                  >
                    <td className="py-2 pr-3">
                      {i === 0
                        ? `1단계 (${t1}kWh 이하)`
                        : i === 1
                          ? `2단계 (${t1 + 1}~${t2}kWh)`
                          : `3단계 (${t2}kWh 초과)`}
                    </td>
                    <td className="py-2 pr-3">
                      {formatKRW(RATES[voltage].base[i])}
                    </td>
                    <td className="py-2">{RATES[voltage].energy[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            하계(7~8월)에는 누진 구간이 300/450kWh로 완화되며, 하계·동계에
            1,000kWh를 초과하면 초과분에 슈퍼유저요금(
            {SUPER_USER_RATE[voltage]}원/kWh)이 적용됩니다.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 안내
          </h2>
          <p>
            한국전력 주택용 요금 체계(기본요금 + 누진 전력량요금 +
            기후환경요금 + 연료비조정액)에 부가가치세 10%와
            전력산업기반기금 3.7%를 더한 <b className="text-foreground">추정치</b>
            입니다. 연료비조정액·기후환경요금 단가는 분기·연도별로 변동될 수
            있고, 복지할인(대가족·다자녀·장애인 등)과 TV 수신료는 반영되지
            않았습니다. 정확한 요금은 한전ON 또는 고지서를 확인하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
