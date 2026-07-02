"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";

function clamp255(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)));
}

function toHex(r: number, g: number, b: number): string {
  const h = (n: number) => clamp255(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function parseHex(input: string): { r: number; g: number; b: number } | null {
  const cleaned = input.trim().replace(/^#/, "");
  let full = cleaned;
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    full = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function ColorConverterCalculator() {
  const [r, setR] = useState(59);
  const [g, setG] = useState(130);
  const [b, setB] = useState(246);
  const [hexDraft, setHexDraft] = useState(toHex(59, 130, 246));

  useEffect(() => {
    setHexDraft(toHex(r, g, b));
  }, [r, g, b]);

  const handleHexInput = (value: string) => {
    setHexDraft(value);
    const parsed = parseHex(value);
    if (parsed) {
      setR(parsed.r);
      setG(parsed.g);
      setB(parsed.b);
    }
  };

  const hex = toHex(r, g, b);
  const cssRgb = `rgb(${r}, ${g}, ${b})`;
  const invalidHex = hexDraft.trim() !== "" && parseHex(hexDraft) === null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={hex}
              onChange={(e) => {
                const parsed = parseHex(e.target.value);
                if (parsed) {
                  setR(parsed.r);
                  setG(parsed.g);
                  setB(parsed.b);
                }
              }}
              className="h-14 w-14 shrink-0 cursor-pointer rounded-md border border-input bg-card p-1"
              aria-label="색상 선택"
            />
            <div
              className="h-14 flex-1 rounded-md border border-border"
              style={{ backgroundColor: hex }}
              aria-hidden
            />
          </div>

          <div>
            <Label htmlFor="hex">HEX 코드</Label>
            <Input
              id="hex"
              value={hexDraft}
              onChange={(e) => handleHexInput(e.target.value)}
              placeholder="#3B82F6"
              className="font-mono uppercase"
            />
            {invalidHex && (
              <p className="mt-1 text-sm text-danger">
                올바른 HEX 형식이 아닙니다. (예: #3B82F6 또는 #3BF)
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="r">R (0~255)</Label>
              <Input
                id="r"
                type="number"
                min={0}
                max={255}
                value={r}
                onChange={(e) => setR(clamp255(Number(e.target.value)))}
              />
            </div>
            <div>
              <Label htmlFor="g">G (0~255)</Label>
              <Input
                id="g"
                type="number"
                min={0}
                max={255}
                value={g}
                onChange={(e) => setG(clamp255(Number(e.target.value)))}
              />
            </div>
            <div>
              <Label htmlFor="b">B (0~255)</Label>
              <Input
                id="b"
                type="number"
                min={0}
                max={255}
                value={b}
                onChange={(e) => setB(clamp255(Number(e.target.value)))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 text-base font-semibold">변환 결과</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">HEX</span>
              <span className="font-mono text-base font-semibold text-foreground">
                {hex}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">RGB</span>
              <span className="font-mono text-base font-semibold text-foreground">
                {r}, {g}, {b}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">CSS</span>
              <span className="font-mono text-base font-semibold text-foreground">
                {cssRgb}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <ShareButton
              title="색상 변환 결과"
              text={`${hex} = ${cssRgb}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
