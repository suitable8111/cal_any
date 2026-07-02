"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { AdFitBanner } from "@/components/ads/AdFitBanner";

type Base = "2" | "8" | "10" | "16";

const BASES: { label: string; value: Base; radix: number }[] = [
  { label: "2진수", value: "2", radix: 2 },
  { label: "8진수", value: "8", radix: 8 },
  { label: "10진수", value: "10", radix: 10 },
  { label: "16진수", value: "16", radix: 16 },
];

const DIGITS = "0123456789ABCDEF";

function parseBigInt(str: string, radix: number): bigint | null {
  const cleaned = str.trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned) return null;
  const validDigits = DIGITS.slice(0, radix);
  let result = BigInt(0);
  const bigRadix = BigInt(radix);
  for (const ch of cleaned) {
    const idx = validDigits.indexOf(ch);
    if (idx === -1) return null;
    result = result * bigRadix + BigInt(idx);
  }
  return result;
}

function toBaseString(value: bigint, radix: number): string {
  const zero = BigInt(0);
  if (value === zero) return "0";
  const bigRadix = BigInt(radix);
  let v = value;
  let out = "";
  while (v > zero) {
    out = DIGITS[Number(v % bigRadix)] + out;
    v = v / bigRadix;
  }
  return out;
}

function groupBinary(bin: string): string {
  const rev = bin.split("").reverse().join("");
  const grouped = rev.match(/.{1,4}/g)?.join(" ") ?? rev;
  return grouped.split("").reverse().join("");
}

export function BaseConverterCalculator() {
  const [valueStr, setValueStr] = useState("");
  const [inputBase, setInputBase] = useState<Base>("10");

  const radix = Number(inputBase);

  const result = useMemo(() => {
    const parsed = parseBigInt(valueStr, radix);
    if (parsed === null) return null;

    const bin = toBaseString(parsed, 2);
    const bitLength = bin.length;
    const byteLength = Math.ceil(bitLength / 8);

    return {
      value: parsed,
      results: BASES.map((b) => ({
        ...b,
        text: toBaseString(parsed, b.radix),
      })),
      bin,
      bitLength,
      byteLength,
    };
  }, [valueStr, radix]);

  const invalid = valueStr.trim() !== "" && result === null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label>입력 진법</Label>
            <OptionGroup<Base>
              options={BASES.map(({ label, value }) => ({ label, value }))}
              value={inputBase}
              onChange={setInputBase}
            />
          </div>

          <div>
            <Label htmlFor="value">값 입력</Label>
            <Input
              id="value"
              placeholder={
                inputBase === "16" ? "예: 1A3F" : inputBase === "2" ? "예: 101101" : "예: 255"
              }
              value={valueStr}
              onChange={(e) => setValueStr(e.target.value)}
              className="font-mono"
            />
            {invalid && (
              <p className="mt-1 text-sm text-danger">
                {BASES.find((b) => b.value === inputBase)?.label} 형식에 맞지 않는
                값입니다.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <>
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-base font-semibold">변환 결과</h2>
              <div className="space-y-2">
                {result.results.map((r) => (
                  <div
                    key={r.value}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-accent/30 px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">{r.label}</span>
                    <span className="break-all text-right font-mono text-base font-semibold text-foreground">
                      {r.radix === 2 ? groupBinary(r.text) : r.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-sm">
              <h2 className="mb-3 text-base font-semibold">비트 · 바이트 정보</h2>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <span>
                  필요 비트 수: <b className="text-foreground">{result.bitLength}bit</b>
                </span>
                <span>
                  필요 바이트 수:{" "}
                  <b className="text-foreground">{result.byteLength}byte</b>
                </span>
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
          <p>
            음수와 소수점은 지원하지 않으며, 매우 큰 정수도 오차 없이 정확하게
            변환합니다. 필요 바이트 수는 값을 표현하는 데 필요한 최소 바이트
            수(올림 기준)입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
