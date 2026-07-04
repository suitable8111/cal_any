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

type Origin = "us" | "other";
type ItemType = "general" | "electronics" | "clothing";

/** 자가사용 면세 한도 (물품가격 기준, USD) */
const EXEMPT_LIMIT: Record<Origin, number> = { us: 200, other: 150 };

/** 품목별 대표 관세율 (간이 기준) */
const DUTY_RATES: Record<ItemType, { rate: number; label: string }> = {
  general: { rate: 0.08, label: "일반 물품 (8%)" },
  electronics: { rate: 0, label: "전자제품 (0%)" },
  clothing: { rate: 0.13, label: "의류·신발 (13%)" },
};

export function CustomsDutyCalculator() {
  const [origin, setOrigin] = useState<Origin>("us");
  const [itemType, setItemType] = useState<ItemType>("general");
  const [priceStr, setPriceStr] = useState("");
  const [shippingStr, setShippingStr] = useState("");
  const [fxStr, setFxStr] = useState("1400");

  const price = parseNumber(priceStr);
  const shipping = parseNumber(shippingStr);
  const fx = parseNumber(fxStr);

  const result = useMemo(() => {
    if (price <= 0 || fx <= 0) return null;

    const limit = EXEMPT_LIMIT[origin];
    // 면세 판정은 물품가격(구매가) 기준
    const exempt = price <= limit;

    if (exempt) {
      return { exempt: true as const, limit };
    }

    // 과세 시 과세가격 = (물품가격 + 배송비) × 환율 — 물품 전체 금액에 과세
    const taxableKrw = (price + shipping) * fx;
    const rate = DUTY_RATES[itemType].rate;
    const duty = taxableKrw * rate;
    const vat = (taxableKrw + duty) * 0.1;
    const totalTax = duty + vat;

    return {
      exempt: false as const,
      limit,
      taxableKrw,
      rate,
      duty,
      vat,
      totalTax,
      totalCost: taxableKrw + totalTax,
    };
  }, [origin, itemType, price, shipping, fx]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>발송 국가</Label>
              <OptionGroup
                options={[
                  { label: "미국", value: "us", hint: "$200 면세" },
                  { label: "기타 국가", value: "other", hint: "$150 면세" },
                ]}
                value={origin}
                onChange={setOrigin}
              />
            </div>
            <div>
              <Label>품목</Label>
              <OptionGroup
                options={[
                  { label: "일반", value: "general", hint: "8%" },
                  { label: "전자제품", value: "electronics", hint: "0%" },
                  { label: "의류·신발", value: "clothing", hint: "13%" },
                ]}
                value={itemType}
                onChange={setItemType}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="price">물품가격 (USD)</Label>
              <Input
                id="price"
                inputMode="decimal"
                placeholder="예: 250"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="shipping">배송비 (USD)</Label>
              <Input
                id="shipping"
                inputMode="decimal"
                placeholder="예: 20"
                value={shippingStr}
                onChange={(e) => setShippingStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fx">환율 (원/USD)</Label>
              <Input
                id="fx"
                inputMode="numeric"
                placeholder="예: 1,400"
                value={fx > 0 ? fx.toLocaleString("ko-KR") : ""}
                onChange={(e) => setFxStr(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && result.exempt && (
        <ResultBox>
          <StatRow
            label={`면세 한도 (${origin === "us" ? "미국" : "기타 국가"})`}
            value={`$${result.limit}`}
          />
          <StatRow label="예상 세금" value="0 원 (면세)" highlight />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            물품가격 ${formatNumber(price, 2)}가 면세 한도 ${result.limit}{" "}
            이하로 <b className="text-foreground">관세·부가세 없이</b> 목록통관
            가능합니다. 단, 같은 날 같은 국가에서 여러 건이 도착하면 합산
            과세될 수 있습니다.
          </p>
        </ResultBox>
      )}

      {result && !result.exempt && (
        <ResultBox>
          <StatRow
            label="과세가격 (물품 + 배송비)"
            value={`${formatKRW(result.taxableKrw)} 원`}
            sub={`$${formatNumber(price + shipping, 2)} × ${formatKRW(fx)}원`}
          />
          <StatRow
            label={`관세 (${(result.rate * 100).toFixed(0)}%)`}
            value={`${formatKRW(result.duty)} 원`}
          />
          <StatRow
            label="부가가치세 (10%)"
            value={`${formatKRW(result.vat)} 원`}
            sub="(과세가격 + 관세) × 10%"
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="예상 세금 합계"
            value={`${formatKRW(result.totalTax)} 원`}
            highlight
          />
          <StatRow
            label="총 구매 비용 (물품+배송+세금)"
            value={`${formatKRW(result.totalCost)} 원`}
          />
          <div className="mt-4">
            <ShareButton
              title="해외직구 관세 계산 결과"
              text={`$${formatNumber(price, 2)} 직구 시 예상 세금은 ${formatKRW(result.totalTax)}원 (관세 ${formatKRW(result.duty)} + 부가세 ${formatKRW(result.vat)})!`}
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            해외직구 면세 기준
          </h2>
          <p>
            자가사용 목적 물품은{" "}
            <b className="text-foreground">
              물품가격 미화 150달러(미국발은 200달러) 이하
            </b>
            면 관세·부가세가 면제됩니다. 한도를 1달러라도 초과하면 면세 없이{" "}
            <b className="text-foreground">전체 금액(물품+운임)</b>에
            과세됩니다. 관세율은 품목(HS코드)마다 다르며 FTA 원산지 물품은
            협정세율이 적용될 수 있으니, 정확한 세액은 관세청 관세법령정보포털
            또는 배송대행지 견적으로 확인하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
