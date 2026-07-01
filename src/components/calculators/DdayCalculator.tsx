"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { formatNumber } from "@/lib/utils";

type Mode = "target" | "since";
const DAY = 86400000;

function todayStr() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffDays(from: Date, to: Date): number {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY
  );
}

function fmtDate(d: Date): string {
  const week = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.toLocaleDateString("ko-KR")} (${week})`;
}

/** D-Day 라벨: 목표일 기준 (D-Day / D-n(미래) / D+n(과거)) */
function ddayLabel(daysUntil: number): string {
  if (daysUntil === 0) return "D-Day";
  return daysUntil > 0 ? `D-${daysUntil}` : `D+${Math.abs(daysUntil)}`;
}

interface Milestone {
  label: string;
  date: Date;
  daysFromStart: number;
  passed: boolean;
}

/** 시작일을 1일째로 세는 한국식 기념일(100일 = 시작일 + 99일) */
function buildMilestones(start: Date, base: Date): Milestone[] {
  const dayMarks = [100, 200, 300, 500, 1000, 2000];
  const yearMarks = [1, 2, 3, 5, 10];
  const items: { label: string; offset: number }[] = [
    ...dayMarks.map((n) => ({ label: `${n}일`, offset: n - 1 })),
    ...yearMarks.map((y) => ({ label: `${y}주년`, offset: -y })), // -y = y주년 표시용
  ];

  const result: Milestone[] = items.map(({ label, offset }) => {
    let date: Date;
    if (offset >= 0) {
      date = new Date(start.getTime() + offset * DAY);
    } else {
      const y = -offset;
      date = new Date(start.getFullYear() + y, start.getMonth(), start.getDate());
    }
    return {
      label,
      date,
      daysFromStart: diffDays(start, date) + 1,
      passed: startOfDay(date).getTime() < startOfDay(base).getTime(),
    };
  });

  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function DdayCalculator() {
  const [mode, setMode] = useState<Mode>("target");
  const [target, setTarget] = useState("");
  const [start, setStart] = useState("");
  const base = todayStr();

  const targetResult = useMemo(() => {
    const t = parseDate(target);
    const b = parseDate(base);
    if (!t || !b) return null;
    const daysUntil = diffDays(b, t);
    return {
      daysUntil,
      label: ddayLabel(daysUntil),
      weeks: Math.abs(daysUntil) / 7,
      date: t,
    };
  }, [target, base]);

  const sinceResult = useMemo(() => {
    const s = parseDate(start);
    const b = parseDate(base);
    if (!s || !b) return null;
    if (startOfDay(s).getTime() > startOfDay(b).getTime()) return null;
    const elapsed = diffDays(s, b); // 지난 일수 (오늘 - 시작일)
    const nthDay = elapsed + 1; // 한국식: 시작일을 1일째로
    return {
      elapsed,
      nthDay,
      weeks: elapsed / 7,
      milestones: buildMilestones(s, b),
      start: s,
    };
  }, [start, base]);

  const invalidSince =
    mode === "since" &&
    start &&
    parseDate(start) &&
    startOfDay(parseDate(start)!).getTime() > startOfDay(parseDate(base)!).getTime();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label>계산 방식</Label>
            <OptionGroup<Mode>
              options={[
                { label: "목표일까지 D-Day", value: "target" },
                { label: "시작일부터 지난 날", value: "since" },
              ]}
              value={mode}
              onChange={setMode}
            />
          </div>

          {mode === "target" ? (
            <div>
              <Label htmlFor="target">목표 날짜</Label>
              <Input
                id="target"
                type="date"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                시험일, 기념일, 마감일 등 목표 날짜를 입력하세요. (오늘: {base})
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="start">시작 날짜 (1일째)</Label>
              <Input
                id="start"
                type="date"
                value={start}
                max={base}
                onChange={(e) => setStart(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                사귄 날, 태어난 날, 입사일 등 기준 날짜를 입력하세요. (오늘:{" "}
                {base})
              </p>
              {invalidSince && (
                <p className="mt-1 text-sm text-danger">
                  시작 날짜는 오늘보다 이전이어야 합니다.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 입력 폼과 결과창 사이 콘텐츠 삽입형 배너 */}
      <AdFitBanner slot="inContent" width={300} height={250} />

      {mode === "target" && targetResult && (
        <ResultBox>
          <div className="mb-3 text-center">
            <span className="text-4xl font-bold tracking-tight text-primary">
              {targetResult.label}
            </span>
          </div>
          <StatRow label="목표일" value={fmtDate(targetResult.date)} />
          <StatRow
            label={targetResult.daysUntil >= 0 ? "남은 날" : "지난 날"}
            value={
              targetResult.daysUntil === 0
                ? "오늘 🎉"
                : `${formatNumber(Math.abs(targetResult.daysUntil))}일`
            }
            highlight
          />
          <StatRow
            label="주 단위"
            value={`약 ${formatNumber(targetResult.weeks, 1)}주`}
          />
        </ResultBox>
      )}

      {mode === "since" && sinceResult && (
        <>
          <ResultBox>
            <StatRow
              label="오늘은"
              value={`${formatNumber(sinceResult.nthDay)}일째`}
              highlight
              sub={`시작일 ${fmtDate(sinceResult.start)} 포함`}
            />
            <StatRow
              label="지난 날수"
              value={`${formatNumber(sinceResult.elapsed)}일`}
            />
            <StatRow
              label="주 단위"
              value={`약 ${formatNumber(sinceResult.weeks, 1)}주`}
            />
          </ResultBox>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-base font-semibold">
                주요 기념일
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">기념일</th>
                      <th className="py-2 pr-3 font-medium">날짜</th>
                      <th className="py-2 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {sinceResult.milestones.map((m) => (
                      <tr
                        key={m.label}
                        className="border-b border-border/50"
                      >
                        <td className="py-2 pr-3 font-medium">{m.label}</td>
                        <td className="py-2 pr-3">{fmtDate(m.date)}</td>
                        <td className="py-2">
                          {m.passed ? (
                            <span className="text-muted-foreground">
                              지남
                            </span>
                          ) : (
                            <span className="font-medium text-primary">
                              D-{diffDays(parseDate(base)!, m.date)}
                            </span>
                          )}
                        </td>
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
            D-Day 계산 안내
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <b className="text-foreground">목표일까지</b>: 목표일 당일은
              D-Day, 하루 전은 D-1, 하루 뒤는 D+1 로 표기합니다.
            </li>
            <li>
              <b className="text-foreground">시작일부터</b>: 한국식 관례에 따라
              시작일을 <b>1일째</b>로 세므로 100일은 시작일로부터 99일 뒤입니다.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
