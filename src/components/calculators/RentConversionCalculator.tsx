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

type Direction = "toMonthly" | "toJeonse";

/** 비교표에 보여줄 전환율 (%) */
const COMPARE_RATES = [3.5, 4.0, 4.5, 5.0, 5.5, 6.0];

export function RentConversionCalculator() {
  const [direction, setDirection] = useState<Direction>("toMonthly");
  const [jeonseStr, setJeonseStr] = useState("");
  const [depositStr, setDepositStr] = useState("");
  const [monthlyStr, setMonthlyStr] = useState("");
  const [rateStr, setRateStr] = useState("5.0");

  const jeonse = parseNumber(jeonseStr);
  const deposit = parseNumber(depositStr);
  const monthly = parseNumber(monthlyStr);
  const rate = parseNumber(rateStr);

  const result = useMemo(() => {
    if (rate <= 0) return null;

    if (direction === "toMonthly") {
      // 월세 = (전세보증금 − 월세보증금) × 전환율 ÷ 12
      if (jeonse <= 0 || deposit >= jeonse) return null;
      const converted = ((jeonse - deposit) * (rate / 100)) / 12;
      return { converted, base: jeonse - deposit };
    }
    // 전세 보증금 = 월세보증금 + 월세 × 12 ÷ 전환율
    if (monthly <= 0) return null;
    const converted = deposit + (monthly * 12) / (rate / 100);
    return { converted, base: (monthly * 12) / (rate / 100) };
  }, [direction, jeonse, deposit, monthly, rate]);

  const compareRows = useMemo(() => {
    if (direction === "toMonthly") {
      if (jeonse <= 0 || deposit >= jeonse) return [];
      return COMPARE_RATES.map((r) => ({
        rate: r,
        value: ((jeonse - deposit) * (r / 100)) / 12,
      }));
    }
    if (monthly <= 0) return [];
    return COMPARE_RATES.map((r) => ({
      rate: r,
      value: deposit + (monthly * 12) / (r / 100),
    }));
  }, [direction, jeonse, deposit, monthly]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label>전환 방향</Label>
            <OptionGroup
              options={[
                { label: "전세 → 월세", value: "toMonthly" },
                { label: "월세 → 전세", value: "toJeonse" },
              ]}
              value={direction}
              onChange={setDirection}
            />
          </div>

          {direction === "toMonthly" ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="jeonse">전세 보증금 (원)</Label>
                <Input
                  id="jeonse"
                  inputMode="numeric"
                  placeholder="예: 300,000,000"
                  value={jeonse > 0 ? jeonse.toLocaleString("ko-KR") : ""}
                  onChange={(e) => setJeonseStr(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="deposit">전환 후 월세 보증금 (원)</Label>
                <Input
                  id="deposit"
                  inputMode="numeric"
                  placeholder="예: 50,000,000"
                  value={deposit > 0 ? deposit.toLocaleString("ko-KR") : ""}
                  onChange={(e) => setDepositStr(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="deposit2">월세 보증금 (원)</Label>
                <Input
                  id="deposit2"
                  inputMode="numeric"
                  placeholder="예: 50,000,000"
                  value={deposit > 0 ? deposit.toLocaleString("ko-KR") : ""}
                  onChange={(e) => setDepositStr(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="monthly">월세 (원)</Label>
                <Input
                  id="monthly"
                  inputMode="numeric"
                  placeholder="예: 1,000,000"
                  value={monthly > 0 ? monthly.toLocaleString("ko-KR") : ""}
                  onChange={(e) => setMonthlyStr(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="rate">전월세 전환율 (연 %)</Label>
            <Input
              id="rate"
              inputMode="decimal"
              placeholder="예: 5.0"
              value={rateStr}
              onChange={(e) => setRateStr(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              법정 상한은 한국은행 기준금리 + 2%p (기존 계약 갱신 시 적용).
              신규 계약은 시장 전환율(통상 4~6%)을 참고하세요.
            </p>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          {direction === "toMonthly" ? (
            <>
              <StatRow
                label="월세로 전환되는 보증금"
                value={`${formatKRW(result.base)} 원`}
              />
              <StatRow
                label={`전환 월세 (연 ${formatNumber(rate, 2)}%)`}
                value={`${formatKRW(result.converted)} 원`}
                highlight
              />
              <StatRow
                label="연간 월세 부담"
                value={`${formatKRW(result.converted * 12)} 원`}
              />
            </>
          ) : (
            <>
              <StatRow
                label={`월세 ${formatKRW(monthly)}원의 보증금 환산액`}
                value={`${formatKRW(result.base)} 원`}
                sub={`월세 × 12 ÷ ${formatNumber(rate, 2)}%`}
              />
              <StatRow
                label="환산 전세 보증금"
                value={`${formatKRW(result.converted)} 원`}
                highlight
              />
            </>
          )}
          <div className="mt-4">
            <ShareButton
              title="전월세 전환 계산 결과"
              text={
                direction === "toMonthly"
                  ? `전세 ${formatKRW(jeonse)}원 → 보증금 ${formatKRW(deposit)}원 + 월세 ${formatKRW(result.converted)}원 (전환율 ${formatNumber(rate, 2)}%)`
                  : `보증금 ${formatKRW(deposit)}원 · 월세 ${formatKRW(monthly)}원 → 전세 환산 ${formatKRW(result.converted)}원 (전환율 ${formatNumber(rate, 2)}%)`
              }
            />
          </div>
        </ResultBox>
      )}

      {compareRows.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-3 text-base font-semibold">전환율별 비교</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">전환율 (연)</th>
                    <th className="py-2 font-medium">
                      {direction === "toMonthly" ? "월세" : "환산 전세 보증금"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row) => (
                    <tr
                      key={row.rate}
                      className={
                        Math.abs(row.rate - rate) < 0.01
                          ? "border-b border-border/50 bg-accent/60 font-semibold"
                          : "border-b border-border/50"
                      }
                    >
                      <td className="py-2 pr-3">{row.rate.toFixed(1)}%</td>
                      <td className="py-2">{formatKRW(row.value)} 원</td>
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
            전월세 전환율이란?
          </h2>
          <p>
            보증금을 월세로 바꿀 때 적용하는 연 이율입니다. 주택임대차보호법상{" "}
            <b className="text-foreground">
              기존 계약을 갱신하며 전세를 월세로 돌릴 때
            </b>
            는 &lsquo;기준금리 + 2%p&rsquo;와 &lsquo;연 10%&rsquo; 중 낮은
            비율을 초과할 수 없습니다. 신규 계약에는 법정 상한이 적용되지
            않아 지역별 시장 전환율이 쓰이며, 한국부동산원 통계에서 확인할
            수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
