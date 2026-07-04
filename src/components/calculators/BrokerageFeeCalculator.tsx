"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { formatKRW, parseNumber } from "@/lib/utils";

type DealType = "sale" | "jeonse" | "monthly";
type PropertyType = "house" | "officetel";

interface FeeBracket {
  limit: number; // 거래금액 상한 (미만)
  rate: number;
  cap?: number; // 한도액
}

/** 주택 중개보수 상한 요율 (2021.10.19 개정, 공인중개사법 시행규칙) */
const SALE_BRACKETS: FeeBracket[] = [
  { limit: 50_000_000, rate: 0.006, cap: 250_000 },
  { limit: 200_000_000, rate: 0.005, cap: 800_000 },
  { limit: 900_000_000, rate: 0.004 },
  { limit: 1_200_000_000, rate: 0.005 },
  { limit: 1_500_000_000, rate: 0.006 },
  { limit: Infinity, rate: 0.007 },
];

const RENT_BRACKETS: FeeBracket[] = [
  { limit: 50_000_000, rate: 0.005, cap: 200_000 },
  { limit: 100_000_000, rate: 0.004, cap: 300_000 },
  { limit: 600_000_000, rate: 0.003 },
  { limit: 1_200_000_000, rate: 0.004 },
  { limit: 1_500_000_000, rate: 0.005 },
  { limit: Infinity, rate: 0.006 },
];

/** 주거용 오피스텔(전용 85㎡ 이하, 부엌·화장실 구비) 고정 요율 */
const OFFICETEL_RATE = { sale: 0.005, rent: 0.004 };

function findBracket(brackets: FeeBracket[], amount: number): FeeBracket {
  return brackets.find((b) => amount < b.limit) ?? brackets[brackets.length - 1];
}

export function BrokerageFeeCalculator() {
  const [dealType, setDealType] = useState<DealType>("sale");
  const [propertyType, setPropertyType] = useState<PropertyType>("house");
  const [amountStr, setAmountStr] = useState("");
  const [depositStr, setDepositStr] = useState("");
  const [monthlyStr, setMonthlyStr] = useState("");

  const amount = parseNumber(amountStr);
  const deposit = parseNumber(depositStr);
  const monthly = parseNumber(monthlyStr);

  const result = useMemo(() => {
    // 거래금액 산정: 월세는 환산보증금 = 보증금 + 월세×100 (5천만 미만이면 ×70)
    let dealAmount = 0;
    if (dealType === "monthly") {
      if (deposit <= 0 && monthly <= 0) return null;
      dealAmount = deposit + monthly * 100;
      if (dealAmount < 50_000_000) dealAmount = deposit + monthly * 70;
    } else {
      if (amount <= 0) return null;
      dealAmount = amount;
    }

    let rate: number;
    let cap: number | undefined;
    if (propertyType === "officetel") {
      rate = dealType === "sale" ? OFFICETEL_RATE.sale : OFFICETEL_RATE.rent;
    } else {
      const brackets = dealType === "sale" ? SALE_BRACKETS : RENT_BRACKETS;
      const bracket = findBracket(brackets, dealAmount);
      rate = bracket.rate;
      cap = bracket.cap;
    }

    const rawFee = dealAmount * rate;
    const fee = cap ? Math.min(rawFee, cap) : rawFee;

    return { dealAmount, rate, cap, fee, capped: cap !== undefined && rawFee > cap };
  }, [dealType, propertyType, amount, deposit, monthly]);

  const brackets = dealType === "sale" ? SALE_BRACKETS : RENT_BRACKETS;
  const bracketLabels = [
    "5천만원 미만",
    dealType === "sale" ? "5천만~2억" : "5천만~1억",
    dealType === "sale" ? "2억~9억" : "1억~6억",
    dealType === "sale" ? "9억~12억" : "6억~12억",
    "12억~15억",
    "15억 이상",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>거래 유형</Label>
              <OptionGroup
                options={[
                  { label: "매매·교환", value: "sale" },
                  { label: "전세", value: "jeonse" },
                  { label: "월세", value: "monthly" },
                ]}
                value={dealType}
                onChange={setDealType}
              />
            </div>
            <div>
              <Label>물건 종류</Label>
              <OptionGroup
                options={[
                  { label: "주택", value: "house", hint: "아파트·빌라 등" },
                  { label: "주거용 오피스텔", value: "officetel", hint: "85㎡ 이하" },
                ]}
                value={propertyType}
                onChange={setPropertyType}
              />
            </div>
          </div>

          {dealType === "monthly" ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="deposit">보증금 (원)</Label>
                <Input
                  id="deposit"
                  inputMode="numeric"
                  placeholder="예: 10,000,000"
                  value={deposit > 0 ? deposit.toLocaleString("ko-KR") : ""}
                  onChange={(e) => setDepositStr(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="monthly">월세 (원)</Label>
                <Input
                  id="monthly"
                  inputMode="numeric"
                  placeholder="예: 600,000"
                  value={monthly > 0 ? monthly.toLocaleString("ko-KR") : ""}
                  onChange={(e) => setMonthlyStr(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="amount">
                {dealType === "sale" ? "매매가" : "전세 보증금"} (원)
              </Label>
              <Input
                id="amount"
                inputMode="numeric"
                placeholder="예: 500,000,000"
                value={amount > 0 ? amount.toLocaleString("ko-KR") : ""}
                onChange={(e) => setAmountStr(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          {dealType === "monthly" && (
            <StatRow
              label="환산보증금 (거래금액)"
              value={`${formatKRW(result.dealAmount)} 원`}
              sub={
                result.dealAmount === deposit + monthly * 70
                  ? "보증금 + 월세×70 적용 (환산액 5천만원 미만)"
                  : "보증금 + 월세×100"
              }
            />
          )}
          <StatRow
            label="적용 상한요율"
            value={`${(result.rate * 100).toFixed(1)}%`}
            sub={result.cap ? `한도액 ${formatKRW(result.cap)}원` : undefined}
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="중개보수 상한 (VAT 별도)"
            value={`${formatKRW(result.fee)} 원`}
            highlight
          />
          <StatRow
            label="부가세 포함 시 (10%)"
            value={`${formatKRW(result.fee * 1.1)} 원`}
          />
          <div className="mt-4">
            <ShareButton
              title="중개수수료 계산 결과"
              text={`거래금액 ${formatKRW(result.dealAmount)}원의 중개보수 상한은 ${formatKRW(result.fee)}원 (VAT 별도)!`}
            />
          </div>
        </ResultBox>
      )}

      {propertyType === "house" && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-3 text-base font-semibold">
              주택 중개보수 상한 요율표 (
              {dealType === "sale" ? "매매·교환" : "임대차"})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">거래금액</th>
                    <th className="py-2 pr-3 font-medium">상한요율</th>
                    <th className="py-2 font-medium">한도액</th>
                  </tr>
                </thead>
                <tbody>
                  {brackets.map((b, i) => (
                    <tr
                      key={i}
                      className={
                        result &&
                        findBracket(brackets, result.dealAmount) === b
                          ? "border-b border-border/50 bg-accent/60 font-semibold"
                          : "border-b border-border/50"
                      }
                    >
                      <td className="py-2 pr-3">{bracketLabels[i]}</td>
                      <td className="py-2 pr-3">
                        {(b.rate * 100).toFixed(1)}%
                      </td>
                      <td className="py-2">
                        {b.cap ? `${formatKRW(b.cap)}원` : "—"}
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
            표시 금액은 법정 <b className="text-foreground">상한액</b>이며,
            실제 중개보수는 상한 내에서 중개사와 협의해 정할 수 있습니다.
            중개사가 일반과세자면 부가세 10%, 간이과세자면 4%가 별도로
            붙습니다. 토지·상가 등 주택 외 물건은 거래금액의 0.9% 이내에서
            협의합니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
