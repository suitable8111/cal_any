"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { formatNumber } from "@/lib/utils";

/** 한글 등 비ASCII 문자를 2바이트로 계산 (자소서 접수 시스템 관례) */
function twoByteLength(text: string): number {
  let bytes = 0;
  for (const ch of text) {
    // eslint-disable-next-line no-control-regex
    bytes += /[\x00-\x7F]/.test(ch) ? 1 : 2;
  }
  return bytes;
}

function utf8Length(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function CharCounterCalculator() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const withSpaces = [...text].length;
    const withoutSpaces = [...text.replace(/\s/g, "")].length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const bytes2 = twoByteLength(text);
    const bytesUtf8 = utf8Length(text);
    // 원고지 1매 = 200자 (공백 포함)
    const manuscriptPages = withSpaces === 0 ? 0 : Math.ceil(withSpaces / 200);

    return {
      withSpaces,
      withoutSpaces,
      words,
      lines,
      bytes2,
      bytesUtf8,
      manuscriptPages,
    };
  }, [text]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="text">텍스트 입력</Label>
            {text.length > 0 && (
              <button
                type="button"
                onClick={() => setText("")}
                className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                지우기
              </button>
            )}
          </div>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="자기소개서, 리포트 등 글자수를 셀 텍스트를 붙여넣으세요."
            rows={10}
            className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
          <p className="text-right text-sm font-semibold">
            {formatNumber(stats.withSpaces)}자
            <span className="ml-2 font-normal text-muted-foreground">
              (공백 제외 {formatNumber(stats.withoutSpaces)}자)
            </span>
          </p>
        </CardContent>
      </Card>

      <AdFitBanner slot="inContent" width={300} height={250} />

      <ResultBox>
        <StatRow
          label="글자수 (공백 포함)"
          value={`${formatNumber(stats.withSpaces)} 자`}
          highlight
        />
        <StatRow
          label="글자수 (공백 제외)"
          value={`${formatNumber(stats.withoutSpaces)} 자`}
        />
        <StatRow
          label="바이트 (한글 2byte 기준)"
          value={`${formatNumber(stats.bytes2)} byte`}
          sub="대부분의 채용 사이트 기준"
        />
        <StatRow
          label="바이트 (UTF-8, 한글 3byte)"
          value={`${formatNumber(stats.bytesUtf8)} byte`}
        />
        <StatRow label="단어 수" value={`${formatNumber(stats.words)} 개`} />
        <StatRow label="줄 수" value={`${formatNumber(stats.lines)} 줄`} />
        <StatRow
          label="원고지 매수 (200자)"
          value={`약 ${formatNumber(stats.manuscriptPages)} 매`}
        />
      </ResultBox>

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            사용 안내
          </h2>
          <p>
            입력한 텍스트는 서버로 전송되지 않고{" "}
            <b className="text-foreground">브라우저 안에서만</b> 계산됩니다.
            채용 사이트마다 글자수 기준이 달라서, 잡코리아·사람인 등은 한글을
            2바이트로 세는 곳이 많고 일부는 공백 제외 글자수를 기준으로
            합니다. 지원하는 곳의 기준(글자수/바이트, 공백 포함 여부)을 먼저
            확인하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
