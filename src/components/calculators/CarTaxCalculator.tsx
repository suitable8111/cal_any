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

type CarType = "ice" | "ev";

/** 비영업용 승용차 cc당 세액 (지방세법 제127조) */
function ccRate(cc: number): number {
  if (cc <= 1_000) return 80;
  if (cc <= 1_600) return 140;
  return 200;
}

/** 전기·수소차 비영업용 정액 자동차세 */
const EV_TAX = 100_000;

/** 차령 경감률: 3년차부터 매년 5%p, 최대 50% (비영업용 승용) */
function ageReduction(carAge: number): number {
  if (carAge < 3) return 0;
  return Math.min(0.05 * (carAge - 2), 0.5);
}

/** 연납 공제율 (2026년 기준 3%, 1월 신청 시 2~12월분 11개월에 적용) */
const ANNUAL_DISCOUNT_RATE = 0.03;

export function CarTaxCalculator() {
  const [carType, setCarType] = useState<CarType>("ice");
  const [ccStr, setCcStr] = useState("");
  const [ageStr, setAgeStr] = useState("1");

  const cc = parseNumber(ccStr);
  const carAge = Math.max(1, Math.round(parseNumber(ageStr)));

  const result = useMemo(() => {
    let baseTax: number;
    if (carType === "ev") {
      baseTax = EV_TAX;
    } else {
      if (cc <= 0) return null;
      baseTax = cc * ccRate(cc);
    }

    const reduction = carType === "ev" ? 0 : ageReduction(carAge);
    const reducedTax = baseTax * (1 - reduction);
    const eduTax = reducedTax * 0.3;
    const annualTotal = reducedTax + eduTax;
    const discount = annualTotal * ANNUAL_DISCOUNT_RATE * (11 / 12);
    const annualPayTotal = annualTotal - discount;

    return {
      baseTax,
      reduction,
      reducedTax,
      eduTax,
      annualTotal,
      discount,
      annualPayTotal,
      halfPayment: annualTotal / 2,
    };
  }, [carType, cc, carAge]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label>차량 종류 (비영업용)</Label>
            <OptionGroup
              options={[
                { label: "내연기관·하이브리드", value: "ice", hint: "배기량 기준" },
                { label: "전기·수소차", value: "ev", hint: "정액 10만원" },
              ]}
              value={carType}
              onChange={setCarType}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {carType === "ice" && (
              <div>
                <Label htmlFor="cc">배기량 (cc)</Label>
                <Input
                  id="cc"
                  inputMode="numeric"
                  placeholder="예: 1,598"
                  value={cc > 0 ? cc.toLocaleString("ko-KR") : ""}
                  onChange={(e) => setCcStr(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="age">차령 (등록 후 몇 년차)</Label>
              <Input
                id="age"
                inputMode="numeric"
                placeholder="예: 5"
                value={ageStr}
                onChange={(e) => setAgeStr(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                3년차부터 매년 5%씩, 최대 50%까지 경감됩니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label={
              carType === "ev"
                ? "자동차세 (전기차 정액)"
                : `자동차세 (${formatKRW(cc)}cc × ${ccRate(cc)}원)`
            }
            value={`${formatKRW(result.baseTax)} 원`}
          />
          {result.reduction > 0 && (
            <StatRow
              label={`차령 경감 (${Math.round(result.reduction * 100)}%)`}
              value={`- ${formatKRW(result.baseTax - result.reducedTax)} 원`}
            />
          )}
          <StatRow
            label="지방교육세 (30%)"
            value={`${formatKRW(result.eduTax)} 원`}
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="연간 자동차세 합계"
            value={`${formatKRW(result.annualTotal)} 원`}
            highlight
          />
          <StatRow
            label="정기분 납부 시 (6월/12월)"
            value={`회당 ${formatKRW(result.halfPayment)} 원`}
          />
          <StatRow
            label="1월 연납 시"
            value={`${formatKRW(result.annualPayTotal)} 원`}
            sub={`약 ${formatKRW(result.discount)}원 할인 (공제율 3% 기준)`}
          />
          <div className="mt-4">
            <ShareButton
              title="자동차세 계산 결과"
              text={`연간 자동차세는 ${formatKRW(result.annualTotal)}원, 1월 연납 시 ${formatKRW(result.annualPayTotal)}원!`}
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 text-base font-semibold">
            배기량별 세율 (비영업용 승용차)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">배기량</th>
                  <th className="py-2 pr-3 font-medium">cc당 세액</th>
                  <th className="py-2 font-medium">예시 (교육세 포함)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-3">1,000cc 이하</td>
                  <td className="py-2 pr-3">80원</td>
                  <td className="py-2">모닝(998cc) 약 103,792원</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-3">1,600cc 이하</td>
                  <td className="py-2 pr-3">140원</td>
                  <td className="py-2">아반떼(1,598cc) 약 290,836원</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-3">1,600cc 초과</td>
                  <td className="py-2 pr-3">200원</td>
                  <td className="py-2">그랜저(2,497cc) 약 649,220원</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">전기·수소차</td>
                  <td className="py-2 pr-3">정액 100,000원</td>
                  <td className="py-2">교육세 포함 130,000원</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            예시는 차령 1~2년(경감 없음) 기준 연간 세액입니다.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 안내
          </h2>
          <p>
            자동차세는 6월과 12월에 반씩 부과되며, 1월에 연납 신청하면 연세액
            일부를 공제받습니다. 연납 공제율은 단계적으로 축소되어 왔으므로
            (2023년 7% → 2024~25년 5% → 2026년 3% 수준) 실제 할인액은
            위택스(www.wetax.go.kr) 신청 화면에서 확인하세요. 승합·화물·영업용
            차량은 세율 체계가 다릅니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
