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

type TripType = "oneway" | "round";

export function FuelCostCalculator() {
  const [distanceStr, setDistanceStr] = useState("");
  const [efficiencyStr, setEfficiencyStr] = useState("");
  const [priceStr, setPriceStr] = useState("1700");
  const [tollStr, setTollStr] = useState("");
  const [tripType, setTripType] = useState<TripType>("round");

  const distance = parseNumber(distanceStr);
  const efficiency = parseNumber(efficiencyStr);
  const price = parseNumber(priceStr);
  const toll = parseNumber(tollStr);

  const result = useMemo(() => {
    if (distance <= 0 || efficiency <= 0 || price <= 0) return null;

    const totalDistance = tripType === "round" ? distance * 2 : distance;
    const fuelUsed = totalDistance / efficiency;
    const fuelCost = fuelUsed * price;
    const totalToll = tripType === "round" ? toll * 2 : toll;
    const total = fuelCost + totalToll;
    const costPerKm = price / efficiency;

    return { totalDistance, fuelUsed, fuelCost, totalToll, total, costPerKm };
  }, [distance, efficiency, price, toll, tripType]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="distance">주행거리 (km)</Label>
              <Input
                id="distance"
                inputMode="decimal"
                placeholder="예: 300 (서울-부산 편도 약 400)"
                value={distanceStr}
                onChange={(e) => setDistanceStr(e.target.value)}
              />
            </div>
            <div>
              <Label>편도 / 왕복</Label>
              <OptionGroup
                options={[
                  { label: "편도", value: "oneway" },
                  { label: "왕복", value: "round" },
                ]}
                value={tripType}
                onChange={setTripType}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="efficiency">차량 연비 (km/L)</Label>
              <Input
                id="efficiency"
                inputMode="decimal"
                placeholder="예: 12.5"
                value={efficiencyStr}
                onChange={(e) => setEfficiencyStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="price">유가 (원/L)</Label>
              <Input
                id="price"
                inputMode="numeric"
                placeholder="예: 1,700"
                value={price > 0 ? price.toLocaleString("ko-KR") : ""}
                onChange={(e) => setPriceStr(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="toll">통행료 (편도 기준, 선택, 원)</Label>
            <Input
              id="toll"
              inputMode="numeric"
              placeholder="예: 20,000"
              value={toll > 0 ? toll.toLocaleString("ko-KR") : ""}
              onChange={(e) => setTollStr(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label={`총 주행거리 (${tripType === "round" ? "왕복" : "편도"})`}
            value={`${formatNumber(result.totalDistance, 1)} km`}
          />
          <StatRow
            label="예상 연료 사용량"
            value={`${formatNumber(result.fuelUsed, 1)} L`}
          />
          <StatRow
            label="유류비"
            value={`${formatKRW(result.fuelCost)} 원`}
          />
          {result.totalToll > 0 && (
            <StatRow
              label="통행료"
              value={`${formatKRW(result.totalToll)} 원`}
            />
          )}
          <div className="my-2 border-t border-border" />
          <StatRow
            label="총 예상 경비"
            value={`${formatKRW(result.total)} 원`}
            highlight
          />
          <StatRow
            label="km당 유류비"
            value={`${formatNumber(result.costPerKm, 1)} 원/km`}
          />
          <div className="mt-4">
            <ShareButton
              title="유류비 계산 결과"
              text={`${formatNumber(result.totalDistance, 0)}km 주행 시 예상 경비는 ${formatKRW(result.total)}원 (유류비 ${formatKRW(result.fuelCost)}원)!`}
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 안내
          </h2>
          <p>
            유류비는 <b className="text-foreground">주행거리 ÷ 연비 × 유가</b>
            로 계산합니다. 실제 연비는 도심/고속 주행 비율, 에어컨 사용,
            적재 무게에 따라 공인 연비와 10~20% 차이 날 수 있습니다. 현재
            유가는 오피넷(www.opinet.co.kr)에서 지역별로 확인할 수 있고,
            고속도로 통행료는 한국도로공사 통행료 조회로 확인하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
