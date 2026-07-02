"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";

type Unit = "sec" | "ms";

function fmtLocal(date: Date): string {
  const week = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )} (${week})`;
}

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function UnixTimestampCalculator() {
  const [tsStr, setTsStr] = useState("");
  const [unit, setUnit] = useState<Unit>("sec");
  const [dtStr, setDtStr] = useState("");

  const tsResult = useMemo(() => {
    const trimmed = tsStr.trim();
    if (!/^-?\d+$/.test(trimmed)) return null;
    const n = Number(trimmed);
    const ms = unit === "sec" ? n * 1000 : n;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return null;
    return { date, local: fmtLocal(date), iso: date.toISOString() };
  }, [tsStr, unit]);

  const dtResult = useMemo(() => {
    if (!dtStr) return null;
    const date = new Date(dtStr);
    if (Number.isNaN(date.getTime())) return null;
    return {
      seconds: Math.floor(date.getTime() / 1000),
      ms: date.getTime(),
      iso: date.toISOString(),
    };
  }, [dtStr]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="text-base font-semibold">타임스탬프 → 날짜/시간</h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="ts">Unix Timestamp</Label>
              <Input
                id="ts"
                inputMode="numeric"
                placeholder="예: 1735689600"
                value={tsStr}
                onChange={(e) => setTsStr(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() =>
                  setTsStr(
                    unit === "sec"
                      ? String(Math.floor(Date.now() / 1000))
                      : String(Date.now())
                  )
                }
                className="h-11 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                지금
              </button>
            </div>
          </div>
          <div>
            <Label>단위</Label>
            <OptionGroup<Unit>
              options={[
                { label: "초 (seconds)", value: "sec" },
                { label: "밀리초 (ms)", value: "ms" },
              ]}
              value={unit}
              onChange={setUnit}
            />
          </div>

          {tsResult ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">한국 시간(로컬)</span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {tsResult.local}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">ISO 8601 (UTC)</span>
                <span className="break-all font-mono text-sm font-semibold text-foreground">
                  {tsResult.iso}
                </span>
              </div>
              <ShareButton
                title="Unix Timestamp 변환 결과"
                text={`${tsStr} → ${tsResult.local}`}
              />
            </div>
          ) : (
            tsStr.trim() !== "" && (
              <p className="text-sm text-danger">유효한 타임스탬프를 입력하세요.</p>
            )
          )}
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="text-base font-semibold">날짜/시간 → 타임스탬프</h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="dt">날짜 및 시간 (로컬)</Label>
              <Input
                id="dt"
                type="datetime-local"
                value={dtStr}
                onChange={(e) => setDtStr(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setDtStr(toDatetimeLocalValue(new Date()))}
                className="h-11 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                지금
              </button>
            </div>
          </div>

          {dtResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">Unix Timestamp (초)</span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {dtResult.seconds}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Unix Timestamp (밀리초)
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {dtResult.ms}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">ISO 8601 (UTC)</span>
                <span className="break-all font-mono text-sm font-semibold text-foreground">
                  {dtResult.iso}
                </span>
              </div>
              <ShareButton
                title="Unix Timestamp 변환 결과"
                text={`${dtStr} → ${dtResult.seconds} (초)`}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
