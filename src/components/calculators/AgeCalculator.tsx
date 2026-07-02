"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { ShareButton } from "@/components/ui/share-button";
import { formatNumber } from "@/lib/utils";

const ZODIAC = [
  "원숭이",
  "닭",
  "개",
  "돼지",
  "쥐",
  "소",
  "호랑이",
  "토끼",
  "용",
  "뱀",
  "말",
  "양",
];

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

interface AgeResult {
  manAge: number;
  yearAge: number;
  zodiac: string;
  daysToBirthday: number;
  daysLived: number;
  nextBirthday: Date;
}

function calcAge(birth: Date, base: Date): AgeResult {
  // 만 나이: 기준일 연도 - 출생 연도, 생일이 안 지났으면 -1
  let manAge = base.getFullYear() - birth.getFullYear();
  const hadBirthday =
    base.getMonth() > birth.getMonth() ||
    (base.getMonth() === birth.getMonth() &&
      base.getDate() >= birth.getDate());
  if (!hadBirthday) manAge -= 1;

  const yearAge = base.getFullYear() - birth.getFullYear();
  const zodiac = ZODIAC[((birth.getFullYear() % 12) + 12) % 12];

  // 다음 생일 (윤년 2/29 → 평년이면 3/1 로 처리)
  function birthdayInYear(year: number): Date {
    if (birth.getMonth() === 1 && birth.getDate() === 29) {
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      return isLeap ? new Date(year, 1, 29) : new Date(year, 2, 1);
    }
    return new Date(year, birth.getMonth(), birth.getDate());
  }
  let next = birthdayInYear(base.getFullYear());
  if (next.getTime() < startOfDay(base).getTime()) {
    next = birthdayInYear(base.getFullYear() + 1);
  }
  const DAY = 86400000;
  const daysToBirthday = Math.round(
    (startOfDay(next).getTime() - startOfDay(base).getTime()) / DAY
  );
  const daysLived = Math.floor(
    (startOfDay(base).getTime() - startOfDay(birth).getTime()) / DAY
  );

  return { manAge, yearAge, zodiac, daysToBirthday, daysLived, nextBirthday: next };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function AgeCalculator() {
  const [birth, setBirth] = useState("");
  const [base, setBase] = useState(todayStr());

  const result = useMemo<AgeResult | null>(() => {
    const b = parseDate(birth);
    const t = parseDate(base);
    if (!b || !t) return null;
    if (b.getTime() > t.getTime()) return null;
    return calcAge(b, t);
  }, [birth, base]);

  const invalidOrder =
    birth && base && parseDate(birth)! > parseDate(base)!;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="birth">생년월일</Label>
              <Input
                id="birth"
                type="date"
                value={birth}
                max={base}
                onChange={(e) => setBirth(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="base">기준일</Label>
              <Input
                id="base"
                type="date"
                value={base}
                onChange={(e) => setBase(e.target.value)}
              />
            </div>
          </div>
          {invalidOrder && (
            <p className="text-sm text-danger">
              생년월일은 기준일보다 이전이어야 합니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 2. 입력 폼과 결과창 사이 콘텐츠 삽입형 배너 */}
      <AdFitBanner slot="inContent" width={300} height={250} />

      {result && (
        <ResultBox>
          <StatRow
            label="만 나이"
            value={`만 ${result.manAge}세`}
            highlight
          />
          <StatRow label="연 나이 (출생연도 기준)" value={`${result.yearAge}세`} />
          <StatRow label="띠" value={`${result.zodiac}띠`} />
          <StatRow
            label="다음 생일까지"
            value={
              result.daysToBirthday === 0
                ? "오늘 🎉"
                : `${formatNumber(result.daysToBirthday)}일`
            }
            sub={
              result.daysToBirthday === 0
                ? undefined
                : result.nextBirthday.toLocaleDateString("ko-KR")
            }
          />
          <StatRow
            label="태어난 지"
            value={`${formatNumber(result.daysLived)}일`}
          />
          <div className="mt-4">
            <ShareButton
              title="만 나이 계산 결과"
              text={`만 나이 ${result.manAge}세 (${result.zodiac}띠), 태어난 지 ${formatNumber(result.daysLived)}일째!`}
            />
          </div>
        </ResultBox>
      )}

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            만 나이란?
          </h2>
          <p>
            2023년 6월 28일부터 시행된 「만 나이 통일법」에 따라 법령·계약·문서
            등에서 별도 표기가 없으면 모두 만 나이를 사용합니다. 만 나이는
            출생일을 기준으로 0세부터 시작해 생일마다 한 살씩 증가합니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
