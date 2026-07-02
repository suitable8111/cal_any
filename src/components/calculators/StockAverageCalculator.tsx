"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { formatKRW, formatNumber, parseNumber } from "@/lib/utils";

interface BuyRow {
  id: number;
  qtyStr: string;
  priceStr: string;
}

let nextId = 1;

export function StockAverageCalculator() {
  const [currentQtyStr, setCurrentQtyStr] = useState("");
  const [currentAvgStr, setCurrentAvgStr] = useState("");
  const [buys, setBuys] = useState<BuyRow[]>([
    { id: nextId++, qtyStr: "", priceStr: "" },
  ]);

  const currentQty = parseNumber(currentQtyStr);
  const currentAvg = parseNumber(currentAvgStr);

  const addRow = () =>
    setBuys((rows) => [...rows, { id: nextId++, qtyStr: "", priceStr: "" }]);
  const removeRow = (id: number) =>
    setBuys((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));
  const updateRow = (id: number, field: "qtyStr" | "priceStr", value: string) =>
    setBuys((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );

  const result = useMemo(() => {
    const validBuys = buys
      .map((b) => ({ qty: parseNumber(b.qtyStr), price: parseNumber(b.priceStr) }))
      .filter((b) => b.qty > 0 && b.price > 0);

    if (currentQty <= 0 && validBuys.length === 0) return null;

    const currentCost = currentQty > 0 ? currentQty * currentAvg : 0;
    const addedQty = validBuys.reduce((s, b) => s + b.qty, 0);
    const addedCost = validBuys.reduce((s, b) => s + b.qty * b.price, 0);

    const totalQty = currentQty + addedQty;
    const totalCost = currentCost + addedCost;
    if (totalQty <= 0) return null;

    const newAvg = totalCost / totalQty;
    const avgChangeRate =
      currentAvg > 0 ? ((newAvg - currentAvg) / currentAvg) * 100 : null;

    return { totalQty, totalCost, newAvg, avgChangeRate, addedQty, addedCost };
  }, [currentQty, currentAvg, buys]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="currentQty">현재 보유 수량 (주)</Label>
              <Input
                id="currentQty"
                inputMode="numeric"
                placeholder="예: 100"
                value={currentQty > 0 ? currentQty.toLocaleString("ko-KR") : ""}
                onChange={(e) => setCurrentQtyStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="currentAvg">현재 평단가 (원)</Label>
              <Input
                id="currentAvg"
                inputMode="numeric"
                placeholder="예: 50,000"
                value={currentAvg > 0 ? currentAvg.toLocaleString("ko-KR") : ""}
                onChange={(e) => setCurrentAvgStr(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>추가 매수</Label>
            {buys.map((row, i) => (
              <div key={row.id} className="flex items-center gap-2">
                <Input
                  inputMode="numeric"
                  placeholder={`${i + 1}차 매수 수량`}
                  value={row.qtyStr}
                  onChange={(e) => updateRow(row.id, "qtyStr", e.target.value)}
                />
                <Input
                  inputMode="numeric"
                  placeholder={`${i + 1}차 매수 가격`}
                  value={row.priceStr}
                  onChange={(e) => updateRow(row.id, "priceStr", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={buys.length === 1}
                  aria-label="삭제"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-md border border-dashed border-input px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              매수 추가
            </button>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label="추가 매수 수량/금액"
            value={`${formatNumber(result.addedQty)}주`}
            sub={`${formatKRW(result.addedCost)} 원`}
          />
          <StatRow
            label="총 보유 수량"
            value={`${formatNumber(result.totalQty)}주`}
          />
          <StatRow
            label="총 투자금액"
            value={`${formatKRW(result.totalCost)} 원`}
          />
          <div className="my-2 border-t border-border" />
          <StatRow
            label="최종 평단가"
            value={`${formatKRW(result.newAvg)} 원`}
            highlight
            sub={
              result.avgChangeRate !== null
                ? `기존 대비 ${result.avgChangeRate >= 0 ? "+" : ""}${formatNumber(
                    result.avgChangeRate,
                    2
                  )}%`
                : undefined
            }
          />
          <div className="mt-4">
            <ShareButton
              title="주식 평단가 계산 결과"
              text={`총 ${formatNumber(result.totalQty)}주, 최종 평단가 ${formatKRW(result.newAvg)}원`}
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
            최종 평단가 = (기존 보유금액 + 추가 매수금액 합계) ÷ 총 보유
            수량으로 계산합니다. 매수 차수는 필요한 만큼 추가할 수 있으며,
            수수료·세금은 반영되지 않습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
