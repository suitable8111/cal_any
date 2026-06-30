"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { formatKRW, parseNumber } from "@/lib/utils";

type Homes = "1" | "2" | "3" | "4";
type YesNo = "y" | "n";

interface TaxResult {
  acqRate: number;
  eduRate: number;
  ruralRate: number;
  acqTax: number;
  eduTax: number;
  ruralTax: number;
  total: number;
  totalRate: number;
  heavy: boolean;
}

/** 주택 유상취득(매매) 취득세 표준세율 (1주택 기준, 가액별 1~3%) */
function baseRate(price: number): number {
  const eok = price / 1e8;
  if (price <= 6e8) return 0.01;
  if (price <= 9e8) {
    // 공식: (취득가액(억) × 2 ÷ 3 − 3) %
    const r = (eok * (2 / 3) - 3) / 100;
    return Math.min(0.03, Math.max(0.01, Math.round(r * 1e6) / 1e6));
  }
  return 0.03;
}

function calcTax(
  price: number,
  homes: Homes,
  adjusted: boolean,
  over85: boolean
): TaxResult {
  const n = Number(homes);
  let acqRate: number;

  if (n === 1) {
    acqRate = baseRate(price);
  } else if (adjusted) {
    acqRate = n === 2 ? 0.08 : 0.12; // 조정 2주택 8%, 3주택↑ 12%
  } else {
    // 비조정: 2주택까지 일반세율, 3주택 8%, 4주택↑ 12%
    if (n === 2) acqRate = baseRate(price);
    else if (n === 3) acqRate = 0.08;
    else acqRate = 0.12;
  }

  const heavy = acqRate >= 0.08;

  // 지방교육세: 일반 = 취득세율×50%×20%, 중과 = 0.4% 고정
  const eduRate = heavy ? 0.004 : acqRate * 0.5 * 0.2;

  // 농어촌특별세: 85㎡ 이하 비과세, 초과 시 일반 0.2% / 8%중과 0.6% / 12%중과 1.0%
  let ruralRate = 0;
  if (over85) {
    if (acqRate === 0.08) ruralRate = 0.006;
    else if (acqRate === 0.12) ruralRate = 0.01;
    else ruralRate = 0.002;
  }

  const acqTax = price * acqRate;
  const eduTax = price * eduRate;
  const ruralTax = price * ruralRate;

  return {
    acqRate,
    eduRate,
    ruralRate,
    acqTax,
    eduTax,
    ruralTax,
    total: acqTax + eduTax + ruralTax,
    totalRate: acqRate + eduRate + ruralRate,
    heavy,
  };
}

const pct = (r: number) => `${(r * 100).toFixed(2).replace(/\.00$/, "")}%`;

export function RealEstateTaxCalculator() {
  const [priceStr, setPriceStr] = useState("");
  const [homes, setHomes] = useState<Homes>("1");
  const [adjusted, setAdjusted] = useState<YesNo>("n");
  const [over85, setOver85] = useState<YesNo>("n");

  const price = parseNumber(priceStr);

  const result = useMemo(
    () =>
      price > 0
        ? calcTax(price, homes, adjusted === "y", over85 === "y")
        : null,
    [price, homes, adjusted, over85]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label htmlFor="price">취득가액 (원)</Label>
            <Input
              id="price"
              inputMode="numeric"
              placeholder="예: 700,000,000"
              value={price > 0 ? price.toLocaleString("ko-KR") : ""}
              onChange={(e) => setPriceStr(e.target.value)}
            />
            {price > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatKRW(price)} 원 (약 {(price / 1e8).toFixed(2)}억)
              </p>
            )}
          </div>

          <div>
            <Label>취득 후 보유 주택 수</Label>
            <OptionGroup<Homes>
              options={[
                { label: "1주택", value: "1" },
                { label: "2주택", value: "2" },
                { label: "3주택", value: "3" },
                { label: "4주택+", value: "4" },
              ]}
              value={homes}
              onChange={setHomes}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>조정대상지역</Label>
              <OptionGroup<YesNo>
                options={[
                  { label: "비조정지역", value: "n" },
                  { label: "조정지역", value: "y" },
                ]}
                value={adjusted}
                onChange={setAdjusted}
              />
            </div>
            <div>
              <Label>전용면적</Label>
              <OptionGroup<YesNo>
                options={[
                  { label: "85㎡ 이하", value: "n" },
                  { label: "85㎡ 초과", value: "y" },
                ]}
                value={over85}
                onChange={setOver85}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 입력 폼과 결과창 사이 콘텐츠 삽입형 배너 */}
      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          {result.heavy && (
            <p className="mb-3 rounded-md bg-warning/15 px-3 py-2 text-xs text-foreground">
              ⚠️ 다주택 중과세율이 적용되었습니다. 일시적 2주택 등 예외는
              반영되지 않습니다.
            </p>
          )}
          <StatRow
            label={`취득세 (${pct(result.acqRate)})`}
            value={`${formatKRW(result.acqTax)} 원`}
          />
          <StatRow
            label={`지방교육세 (${pct(result.eduRate)})`}
            value={`${formatKRW(result.eduTax)} 원`}
          />
          <StatRow
            label={`농어촌특별세 (${pct(result.ruralRate)})`}
            value={
              result.ruralRate === 0
                ? "비과세"
                : `${formatKRW(result.ruralTax)} 원`
            }
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label={`총 납부세액 (${pct(result.totalRate)})`}
            value={`${formatKRW(result.total)} 원`}
            highlight
          />
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 text-base font-semibold">취득세율 요약표 (주택 매매)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">구분</th>
                  <th className="py-2 pr-3 font-medium">취득세</th>
                  <th className="py-2 pr-3 font-medium">지방교육세</th>
                  <th className="py-2 font-medium">농특세(85㎡↑)</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {[
                  ["6억 이하 (1주택)", "1%", "0.1%", "0.2%"],
                  ["6~9억 (1주택)", "1~3%", "0.1~0.3%", "0.2%"],
                  ["9억 초과 (1주택)", "3%", "0.3%", "0.2%"],
                  ["조정 2주택 / 비조정 3주택", "8%", "0.4%", "0.6%"],
                  ["조정 3주택↑ / 비조정 4주택↑", "12%", "0.4%", "1.0%"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-border/50">
                    {row.map((cell, i) => (
                      <td key={i} className={i === 0 ? "py-2 pr-3" : "py-2 pr-3"}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            85㎡ 이하 주택은 농어촌특별세가 비과세됩니다. 본 계산기는 유상취득
            (매매) 기준이며, 생애최초 감면·일시적 2주택·증여·신축 등 개별
            요건은 반영되지 않습니다. 정확한 세액은 위택스(WeTax) 또는 관할
            지자체에 확인하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
