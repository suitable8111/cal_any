"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { cn, formatKRW, parseNumber } from "@/lib/utils";

type Unit = "1" | "100" | "1000";

interface Person {
  id: number;
  name: string;
}

interface RoundState {
  id: number;
  label: string;
  amountStr: string;
  excluded: Set<number>;
}

let personSeq = 1;
let roundSeq = 1;

const UNIT_OPTIONS: { label: string; value: Unit; hint: string }[] = [
  { label: "원 단위", value: "1", hint: "절사 없음" },
  { label: "100원 절사", value: "100", hint: "" },
  { label: "1000원 절사", value: "1000", hint: "" },
];

export function DutchPayCalculator() {
  const [people, setPeople] = useState<Person[]>([
    { id: personSeq++, name: "인원1" },
    { id: personSeq++, name: "인원2" },
    { id: personSeq++, name: "인원3" },
  ]);
  const [rounds, setRounds] = useState<RoundState[]>([
    { id: roundSeq++, label: "1차", amountStr: "", excluded: new Set() },
  ]);
  const [unit, setUnit] = useState<Unit>("1");

  const addPerson = () =>
    setPeople((prev) => [
      ...prev,
      { id: personSeq++, name: `인원${prev.length + 1}` },
    ]);

  const removePerson = (id: number) =>
    setPeople((prev) => (prev.length > 2 ? prev.filter((p) => p.id !== id) : prev));

  const renamePerson = (id: number, name: string) =>
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));

  const addRound = () =>
    setRounds((prev) => [
      ...prev,
      {
        id: roundSeq++,
        label: `${prev.length + 1}차`,
        amountStr: "",
        excluded: new Set(),
      },
    ]);

  const removeRound = (id: number) =>
    setRounds((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const updateRoundLabel = (id: number, label: string) =>
    setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, label } : r)));

  const updateRoundAmount = (id: number, amountStr: string) =>
    setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, amountStr } : r)));

  const toggleParticipant = (roundId: number, personId: number) =>
    setRounds((prev) =>
      prev.map((r) => {
        if (r.id !== roundId) return r;
        const next = new Set(r.excluded);
        if (next.has(personId)) next.delete(personId);
        else next.add(personId);
        return { ...r, excluded: next };
      })
    );

  const unitValue = Number(unit);

  const result = useMemo(() => {
    const totals = new Map<number, number>(people.map((p) => [p.id, 0]));
    let leftoverTotal = 0;
    let grandTotal = 0;

    const roundResults = rounds.map((round) => {
      const amount = parseNumber(round.amountStr);
      const participants = people.filter((p) => !round.excluded.has(p.id));
      if (amount <= 0 || participants.length === 0) {
        return { round, amount, participants, perPerson: 0, leftover: 0 };
      }

      const raw = amount / participants.length;
      const perPerson =
        unitValue > 1 ? Math.floor(raw / unitValue) * unitValue : Math.floor(raw);
      const leftover = amount - perPerson * participants.length;

      participants.forEach((p) =>
        totals.set(p.id, (totals.get(p.id) ?? 0) + perPerson)
      );
      leftoverTotal += leftover;
      grandTotal += amount;

      return { round, amount, participants, perPerson, leftover };
    });

    if (grandTotal <= 0) return null;
    return { roundResults, totals, leftoverTotal, grandTotal };
  }, [people, rounds, unitValue]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label>참여 인원</Label>
            <div className="space-y-2">
              {people.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <Input
                    value={p.name}
                    onChange={(e) => renamePerson(p.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removePerson(p.id)}
                    disabled={people.length === 2}
                    aria-label="인원 삭제"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPerson}
              className="mt-2 flex items-center gap-1.5 rounded-md border border-dashed border-input px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              인원 추가
            </button>
          </div>

          <div>
            <Label>절사 단위</Label>
            <OptionGroup<Unit>
              options={UNIT_OPTIONS}
              value={unit}
              onChange={setUnit}
              columns={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {rounds.map((round) => (
          <Card key={round.id}>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <Input
                  value={round.label}
                  onChange={(e) => updateRoundLabel(round.id, e.target.value)}
                  className="max-w-[120px]"
                />
                <Input
                  inputMode="numeric"
                  placeholder="정산 금액 (원)"
                  value={
                    parseNumber(round.amountStr) > 0
                      ? parseNumber(round.amountStr).toLocaleString("ko-KR")
                      : ""
                  }
                  onChange={(e) => updateRoundAmount(round.id, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeRound(round.id)}
                  disabled={rounds.length === 1}
                  aria-label="차수 삭제"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">
                  이 차수에서 제외할 인원을 선택하세요 (예: 술 안 마신 사람)
                </p>
                <div className="flex flex-wrap gap-2">
                  {people.map((p) => {
                    const included = !round.excluded.has(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleParticipant(round.id, p.id)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          included
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-input bg-card text-muted-foreground line-through opacity-60 hover:opacity-100"
                        )}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <button
          type="button"
          onClick={addRound}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-input px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          차수 추가 (예: 2차)
        </button>
      </div>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <>
          <ResultBox>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              인원별 정산 금액
            </h2>
            {people.map((p) => (
              <StatRow
                key={p.id}
                label={p.name}
                value={`${formatKRW(result.totals.get(p.id) ?? 0)} 원`}
              />
            ))}
            <div className="my-2 border-t border-border" />
            <StatRow
              label="총 정산 금액"
              value={`${formatKRW(result.grandTotal)} 원`}
              highlight
            />
            {result.leftoverTotal > 0 && (
              <StatRow
                label="절사 후 남는 금액 (총무 부담)"
                value={`${formatKRW(result.leftoverTotal)} 원`}
              />
            )}
            <div className="mt-4">
              <ShareButton
                title="더치페이 정산 결과"
                text={`총 ${formatKRW(result.grandTotal)}원 정산! ${people
                  .map((p) => `${p.name} ${formatKRW(result.totals.get(p.id) ?? 0)}원`)
                  .join(", ")}`}
              />
            </div>
          </ResultBox>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-base font-semibold">차수별 내역</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">차수</th>
                      <th className="py-2 pr-3 font-medium">금액</th>
                      <th className="py-2 pr-3 font-medium">참여 인원</th>
                      <th className="py-2 font-medium">1인당</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {result.roundResults.map((r) => (
                      <tr key={r.round.id} className="border-b border-border/50">
                        <td className="py-2 pr-3">{r.round.label}</td>
                        <td className="py-2 pr-3">{formatKRW(r.amount)}</td>
                        <td className="py-2 pr-3">{r.participants.length}명</td>
                        <td className="py-2">{formatKRW(r.perPerson)}</td>
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
            사용 안내
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>차수를 추가해 1차·2차 등 항목별로 각각 다른 인원 조합으로 정산할 수 있습니다.</li>
            <li>각 차수의 인원 태그를 눌러 제외/포함을 전환할 수 있습니다.</li>
            <li>
              절사 단위를 선택하면 나눠 떨어지지 않는 금액을 100원·1000원
              단위로 내림 처리하며, 남는 금액은 총무 부담분으로 안내됩니다.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
