"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { formatKRW, parseNumber } from "@/lib/utils";

type Product = "deposit" | "installment";
type InterestType = "simple" | "compound";
type TaxType = "general" | "preferential" | "exempt";

const TAX_RATE: Record<TaxType, number> = {
  general: 0.154,
  preferential: 0.095,
  exempt: 0,
};

const TAX_LABEL: Record<TaxType, string> = {
  general: "일반과세 (15.4%)",
  preferential: "세금우대 (9.5%)",
  exempt: "비과세 (0%)",
};

interface CalcResult {
  principal: number;
  interest: number;
  tax: number;
  netInterest: number;
  payout: number;
}

/** 예금(거치식): 원금을 한 번에 넣고 만기까지 보유 */
function calcDeposit(
  principal: number,
  annualRate: number,
  months: number,
  type: InterestType
): number {
  if (type === "simple") {
    return principal * annualRate * (months / 12);
  }
  const monthlyRate = annualRate / 12;
  const balance = principal * Math.pow(1 + monthlyRate, months);
  return balance - principal;
}

/** 적금(적립식): 매월 초 일정액을 납입 */
function calcInstallment(
  monthlyAmount: number,
  annualRate: number,
  months: number,
  type: InterestType
): number {
  if (type === "simple") {
    // 각 회차 납입금은 만기까지 남은 개월 수만큼 이자 발생 (은행 단리 적금 방식)
    let interest = 0;
    for (let i = 1; i <= months; i++) {
      interest += monthlyAmount * annualRate * ((months - i + 1) / 12);
    }
    return interest;
  }
  const monthlyRate = annualRate / 12;
  let balance = 0;
  for (let i = 1; i <= months; i++) {
    balance += monthlyAmount;
    balance *= 1 + monthlyRate;
  }
  return balance - monthlyAmount * months;
}

export function SavingsInterestCalculator() {
  const [product, setProduct] = useState<Product>("deposit");
  const [interestType, setInterestType] = useState<InterestType>("simple");
  const [taxType, setTaxType] = useState<TaxType>("general");
  const [amountStr, setAmountStr] = useState("");
  const [rateStr, setRateStr] = useState("");
  const [monthsStr, setMonthsStr] = useState("");

  const amount = parseNumber(amountStr);
  const rate = parseNumber(rateStr) / 100;
  const months = parseNumber(monthsStr);

  const result = useMemo<CalcResult | null>(() => {
    if (amount <= 0 || rate <= 0 || months <= 0) return null;

    const principal = product === "deposit" ? amount : amount * months;
    const interest =
      product === "deposit"
        ? calcDeposit(amount, rate, months, interestType)
        : calcInstallment(amount, rate, months, interestType);

    const tax = interest * TAX_RATE[taxType];
    const netInterest = interest - tax;

    return {
      principal,
      interest,
      tax,
      netInterest,
      payout: principal + netInterest,
    };
  }, [amount, rate, months, product, interestType, taxType]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label>상품 종류</Label>
            <OptionGroup<Product>
              options={[
                { label: "예금 (거치식)", value: "deposit" },
                { label: "적금 (적립식)", value: "installment" },
              ]}
              value={product}
              onChange={setProduct}
            />
          </div>

          <div>
            <Label htmlFor="amount">
              {product === "deposit" ? "예치 원금 (원)" : "매월 납입액 (원)"}
            </Label>
            <Input
              id="amount"
              inputMode="numeric"
              placeholder={product === "deposit" ? "예: 10,000,000" : "예: 500,000"}
              value={amount > 0 ? amount.toLocaleString("ko-KR") : ""}
              onChange={(e) => setAmountStr(e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="rate">연 이자율 (%)</Label>
              <Input
                id="rate"
                inputMode="decimal"
                placeholder="예: 3.5"
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="months">예치·납입 기간 (개월)</Label>
              <Input
                id="months"
                inputMode="numeric"
                placeholder="예: 12"
                value={monthsStr}
                onChange={(e) => setMonthsStr(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>이자 계산 방식</Label>
            <OptionGroup<InterestType>
              options={[
                { label: "단리", value: "simple" },
                { label: "복리 (월복리)", value: "compound" },
              ]}
              value={interestType}
              onChange={setInterestType}
            />
          </div>

          <div>
            <Label>이자소득세 유형</Label>
            <OptionGroup<TaxType>
              options={[
                { label: "일반과세", value: "general", hint: "15.4%" },
                { label: "세금우대", value: "preferential", hint: "9.5%" },
                { label: "비과세", value: "exempt", hint: "0%" },
              ]}
              value={taxType}
              onChange={setTaxType}
              columns={3}
            />
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label="원금 합계"
            value={`${formatKRW(result.principal)} 원`}
          />
          <StatRow
            label="세전 이자"
            value={`${formatKRW(result.interest)} 원`}
          />
          <StatRow
            label={`이자소득세 (${TAX_LABEL[taxType]})`}
            value={
              result.tax === 0 ? "비과세" : `- ${formatKRW(result.tax)} 원`
            }
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="세후 이자"
            value={`${formatKRW(result.netInterest)} 원`}
          />
          <StatRow
            label="만기 실수령액"
            value={`${formatKRW(result.payout)} 원`}
            highlight
          />
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 안내
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <b className="text-foreground">예금(거치식)</b>은 원금을 한 번에
              예치하고, <b className="text-foreground">적금(적립식)</b>은 매월
              동일한 금액을 납입하는 것으로 가정합니다.
            </li>
            <li>
              적금 단리는 각 회차 납입금이 만기까지 남은 기간만큼만 이자가
              붙는 은행 일반적금 방식으로 계산합니다.
            </li>
            <li>
              세금우대(9.5%)는 조합·새마을금고 등 특정 예탁금에, 비과세는
              ISA·청년우대 등 특정 요건 상품에 한해 적용되며, 실제 적용 여부는
              가입 상품 약관을 확인하세요.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
