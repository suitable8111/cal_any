"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { Input } from "@/components/ui/input";
import { parseNumber } from "@/lib/utils";

/**
 * 청약 가점제 (총 84점)
 * - 무주택기간: 최대 32점 (1년 미만 2점, 1년마다 +2점, 15년 이상 32점)
 * - 부양가족 수: 최대 35점 (0명 5점, 1명당 +5점, 6명 이상 35점)
 * - 청약통장 가입기간: 최대 17점 (6개월 미만 1점, 6개월~1년 2점, 1년마다 +1점, 15년 이상 17점)
 */
function homelessScore(years: number, hasHouse: boolean): number {
  if (hasHouse) return 0;
  return Math.min(2 * (Math.floor(years) + 1), 32);
}

function dependentScore(count: number): number {
  return Math.min(5 * (count + 1), 35);
}

function accountScore(years: number): number {
  if (years < 0.5) return 1;
  return Math.min(Math.floor(years) + 2, 17);
}

export function HousingSubscriptionCalculator() {
  const [hasHouse, setHasHouse] = useState<"no" | "yes">("no");
  const [homelessStr, setHomelessStr] = useState("");
  const [dependentsStr, setDependentsStr] = useState("");
  const [accountStr, setAccountStr] = useState("");

  const homelessYears = parseNumber(homelessStr);
  const dependents = Math.max(0, Math.round(parseNumber(dependentsStr)));
  const accountYears = parseNumber(accountStr);

  const result = useMemo(() => {
    const s1 = homelessScore(homelessYears, hasHouse === "yes");
    const s2 = dependentScore(dependents);
    const s3 = accountScore(accountYears);
    return { s1, s2, s3, total: s1 + s2 + s3 };
  }, [hasHouse, homelessYears, dependents, accountYears]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>주택 소유 여부 (세대 기준)</Label>
              <OptionGroup
                options={[
                  { label: "무주택", value: "no" },
                  { label: "유주택", value: "yes", hint: "무주택 0점" },
                ]}
                value={hasHouse}
                onChange={setHasHouse}
              />
            </div>
            <div>
              <Label htmlFor="homeless">무주택 기간 (년)</Label>
              <Input
                id="homeless"
                inputMode="decimal"
                placeholder="예: 7 (만 30세 또는 혼인신고일부터)"
                value={homelessStr}
                onChange={(e) => setHomelessStr(e.target.value)}
                disabled={hasHouse === "yes"}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="dependents">부양가족 수 (본인 제외)</Label>
              <Input
                id="dependents"
                inputMode="numeric"
                placeholder="예: 2 (배우자+자녀1)"
                value={dependentsStr}
                onChange={(e) => setDependentsStr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="account">청약통장 가입기간 (년)</Label>
              <Input
                id="account"
                inputMode="decimal"
                placeholder="예: 10"
                value={accountStr}
                onChange={(e) => setAccountStr(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      <ResultBox>
        <StatRow
          label="① 무주택 기간"
          value={`${result.s1}점`}
          sub="최대 32점"
        />
        <StatRow
          label="② 부양가족 수"
          value={`${result.s2}점`}
          sub="최대 35점"
        />
        <StatRow
          label="③ 청약통장 가입기간"
          value={`${result.s3}점`}
          sub="최대 17점"
        />
        <div className="my-2 border-t border-border" />
        <StatRow
          label="청약 가점 총점"
          value={`${result.total}점 / 84점`}
          highlight
        />
        <div className="mt-4">
          <ShareButton
            title="청약 가점 계산 결과"
            text={`내 청약 가점은 ${result.total}점 (무주택 ${result.s1} + 부양가족 ${result.s2} + 통장 ${result.s3})!`}
          />
        </div>
      </ResultBox>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 text-base font-semibold">항목별 점수 기준</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">무주택 기간</th>
                  <th className="py-2 pr-3 font-medium">점수</th>
                  <th className="py-2 pr-3 font-medium">부양가족</th>
                  <th className="py-2 pr-3 font-medium">점수</th>
                  <th className="py-2 pr-3 font-medium">통장 가입</th>
                  <th className="py-2 font-medium">점수</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {[
                  ["1년 미만", "2", "0명", "5", "6개월 미만", "1"],
                  ["3~4년", "8", "1명", "10", "6개월~1년", "2"],
                  ["7~8년", "16", "2명", "15", "5~6년", "7"],
                  ["10~11년", "22", "3명", "20", "10~11년", "12"],
                  ["13~14년", "28", "4명", "25", "13~14년", "15"],
                  ["15년 이상", "32", "6명 이상", "35", "15년 이상", "17"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2 pr-3 whitespace-nowrap">
                        {cell}
                        {j % 2 === 1 ? "점" : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            계산 안내
          </h2>
          <p>
            무주택 기간은{" "}
            <b className="text-foreground">
              만 30세가 된 날(그 전에 혼인했다면 혼인신고일)
            </b>
            부터 계산하며, 세대 전원이 무주택이어야 합니다. 부양가족은
            입주자모집공고일 기준 같은 등본에 등재된 배우자·직계존속(3년
            이상)·미혼 직계비속(만 30세 미만)을 말합니다. 잘못 계산해
            당첨되면 부적격 처리되니 청약홈에서 최종 확인하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
