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

type Method = "equalPayment" | "equalPrincipal" | "bullet";

interface MonthRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface YearRow {
  year: number;
  principal: number;
  interest: number;
  payment: number;
  endBalance: number;
}

function buildSchedule(
  principal: number,
  annualRate: number,
  months: number,
  method: Method
): MonthRow[] {
  const r = annualRate / 12;
  let balance = principal;
  const rows: MonthRow[] = [];

  if (method === "equalPayment") {
    const payment =
      r === 0
        ? principal / months
        : (principal * r * Math.pow(1 + r, months)) /
          (Math.pow(1 + r, months) - 1);

    for (let m = 1; m <= months; m++) {
      const interest = balance * r;
      let princ = payment - interest;
      if (m === months) princ = balance;
      balance = Math.max(balance - princ, 0);
      rows.push({ month: m, payment: princ + interest, principal: princ, interest, balance });
    }
  } else if (method === "equalPrincipal") {
    const principalPerMonth = principal / months;
    for (let m = 1; m <= months; m++) {
      const interest = balance * r;
      const princ = m === months ? balance : principalPerMonth;
      balance = Math.max(balance - princ, 0);
      rows.push({ month: m, payment: princ + interest, principal: princ, interest, balance });
    }
  } else {
    for (let m = 1; m <= months; m++) {
      const interest = balance * r;
      const princ = m === months ? balance : 0;
      balance = Math.max(balance - princ, 0);
      rows.push({ month: m, payment: princ + interest, principal: princ, interest, balance });
    }
  }

  return rows;
}

function toYearly(rows: MonthRow[]): YearRow[] {
  const years: YearRow[] = [];
  for (let i = 0; i < rows.length; i += 12) {
    const chunk = rows.slice(i, i + 12);
    years.push({
      year: years.length + 1,
      principal: chunk.reduce((s, r) => s + r.principal, 0),
      interest: chunk.reduce((s, r) => s + r.interest, 0),
      payment: chunk.reduce((s, r) => s + r.payment, 0),
      endBalance: chunk[chunk.length - 1].balance,
    });
  }
  return years;
}

const METHOD_LABEL: Record<Method, string> = {
  equalPayment: "원리금균등상환",
  equalPrincipal: "원금균등상환",
  bullet: "만기일시상환",
};

export function LoanRepaymentCalculator() {
  const [principalStr, setPrincipalStr] = useState("");
  const [rateStr, setRateStr] = useState("");
  const [yearsStr, setYearsStr] = useState("");
  const [method, setMethod] = useState<Method>("equalPayment");

  const principal = parseNumber(principalStr);
  const rate = parseNumber(rateStr) / 100;
  const months = Math.round(parseNumber(yearsStr) * 12);

  const schedule = useMemo(() => {
    if (principal <= 0 || rate < 0 || months <= 0) return null;
    const rows = buildSchedule(principal, rate, months, method);
    const yearly = toYearly(rows);
    const totalPayment = rows.reduce((s, r) => s + r.payment, 0);
    const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
    return { rows, yearly, totalPayment, totalInterest };
  }, [principal, rate, months, method]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label htmlFor="principal">대출 원금 (원)</Label>
            <Input
              id="principal"
              inputMode="numeric"
              placeholder="예: 300,000,000"
              value={principal > 0 ? principal.toLocaleString("ko-KR") : ""}
              onChange={(e) => setPrincipalStr(e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="rate">연 이자율 (%)</Label>
              <Input
                id="rate"
                inputMode="decimal"
                placeholder="예: 4.2"
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="years">대출 기간 (년)</Label>
              <Input
                id="years"
                inputMode="decimal"
                placeholder="예: 30"
                value={yearsStr}
                onChange={(e) => setYearsStr(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>상환 방식</Label>
            <OptionGroup<Method>
              options={[
                { label: "원리금균등", value: "equalPayment" },
                { label: "원금균등", value: "equalPrincipal" },
                { label: "만기일시", value: "bullet" },
              ]}
              value={method}
              onChange={setMethod}
              columns={3}
            />
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {schedule && (
        <>
          <ResultBox>
            <StatRow
              label={`${METHOD_LABEL[method]} · 1회차 상환액`}
              value={`${formatKRW(schedule.rows[0].payment)} 원`}
            />
            {method !== "equalPayment" && (
              <StatRow
                label="마지막 회차 상환액"
                value={`${formatKRW(schedule.rows[schedule.rows.length - 1].payment)} 원`}
              />
            )}
            <StatRow
              label="총 이자"
              value={`${formatKRW(schedule.totalInterest)} 원`}
            />
            <StatRow
              label="총 상환액 (원금+이자)"
              value={`${formatKRW(schedule.totalPayment)} 원`}
              highlight
            />
            <div className="mt-4">
              <ShareButton
                title="대출 상환 계산 결과"
                text={`${METHOD_LABEL[method]}: 1회차 상환액 ${formatKRW(schedule.rows[0].payment)}원, 총 이자 ${formatKRW(schedule.totalInterest)}원`}
              />
            </div>
          </ResultBox>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-base font-semibold">연차별 상환 스케줄</h2>
              <div className="max-h-96 overflow-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">연차</th>
                      <th className="py-2 pr-3 font-medium">납입 원금</th>
                      <th className="py-2 pr-3 font-medium">납입 이자</th>
                      <th className="py-2 pr-3 font-medium">연간 납입액</th>
                      <th className="py-2 font-medium">잔여 원금</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {schedule.yearly.map((y) => (
                      <tr key={y.year} className="border-b border-border/50">
                        <td className="py-2 pr-3">{y.year}년차</td>
                        <td className="py-2 pr-3">{formatKRW(y.principal)}</td>
                        <td className="py-2 pr-3">{formatKRW(y.interest)}</td>
                        <td className="py-2 pr-3">{formatKRW(y.payment)}</td>
                        <td className="py-2">{formatKRW(y.endBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            상환 방식 안내
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <b className="text-foreground">원리금균등</b>: 매달 동일한
              금액을 상환하며, 초기에는 이자 비중이 크고 점차 원금 비중이
              커집니다.
            </li>
            <li>
              <b className="text-foreground">원금균등</b>: 매달 동일한 원금을
              상환해 초기 상환액이 가장 크고 점점 줄어듭니다. 총이자는
              원리금균등보다 적습니다.
            </li>
            <li>
              <b className="text-foreground">만기일시상환</b>: 매달 이자만
              내다가 만기에 원금을 한 번에 상환합니다. 총이자 부담이 가장
              큽니다.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
