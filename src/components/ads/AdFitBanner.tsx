"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * 카카오 애드핏(Kakao AdFit) 광고 단위 ID는 환경변수로 주입합니다.
 * 광고 승인 후 .env(또는 Vercel 환경변수)에 실제 DAN-xxxx 값을 채우면
 * 별도 코드 수정 없이 모든 배너가 활성화됩니다.
 *
 * Next.js 는 `process.env.NEXT_PUBLIC_*` 를 빌드 시 정적으로 인라인하므로
 * 반드시 아래처럼 키를 명시적으로 참조해야 합니다.
 */
export const AD_UNITS = {
  header:
    process.env.NEXT_PUBLIC_ADFIT_UNIT_HEADER || "DAN-X2960oC9n2QqltY4",
  headerMobile:
    process.env.NEXT_PUBLIC_ADFIT_UNIT_HEADER_MOBILE || "DAN-x7fozam0o5w9eyCZ",
  inContent:
    process.env.NEXT_PUBLIC_ADFIT_UNIT_INCONTENT || "DAN-l5Pbd8v43l5ycB2Q",
  sidebar:
    process.env.NEXT_PUBLIC_ADFIT_UNIT_SIDEBAR || "DAN-YLnUp8hh3dzmo33G",
  footer:
    process.env.NEXT_PUBLIC_ADFIT_UNIT_FOOTER || "DAN-Kcjez3RhWBg7dxnx",
  // 푸터 모바일용 단위 미발급 — 단위 추가 후 env 또는 기본값을 채우면 활성화
  footerMobile: process.env.NEXT_PUBLIC_ADFIT_UNIT_FOOTER_MOBILE || "",
} as const;

export type AdSlot = keyof typeof AD_UNITS;

interface AdFitBannerProps {
  /** 미리 정의된 배치 슬롯 (header/inContent/sidebar/footer) */
  slot?: AdSlot;
  /** 슬롯 대신 직접 DAN-xxxx 광고 단위 ID 지정 */
  unit?: string;
  width: number;
  height: number;
  /** 광고 위 "광고" 라벨 표시 여부 */
  label?: boolean;
  className?: string;
}

const ADFIT_SCRIPT_SRC = "//t1.daumcdn.net/kas/static/ba.min.js";

/**
 * 공통 카카오 애드핏 배너 컴포넌트.
 *
 * 동작 방식:
 * - 마운트 시 `<ins class="kakao_ad_area">` 와 ba.min.js 스크립트를 컨테이너에
 *   주입해, App Router 의 클라이언트 사이드 페이지 이동 후에도 광고가 새로
 *   렌더링되도록 보장합니다.
 * - 광고 단위 ID가 없으면(미승인/개발 단계) 자리만 잡는 플레이스홀더를 노출합니다.
 */
export function AdFitBanner({
  slot,
  unit,
  width,
  height,
  label = true,
  className,
}: AdFitBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolved = unit ?? (slot ? AD_UNITS[slot] : undefined);
  const adUnit = resolved && resolved.length > 0 ? resolved : undefined;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !adUnit) return;

    // 재마운트 시 중복 방지
    el.innerHTML = "";

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.style.width = "100%";
    ins.setAttribute("data-ad-unit", adUnit);
    ins.setAttribute("data-ad-width", String(width));
    ins.setAttribute("data-ad-height", String(height));

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = ADFIT_SCRIPT_SRC;

    el.appendChild(ins);
    el.appendChild(script);

    return () => {
      el.innerHTML = "";
    };
  }, [adUnit, width, height]);

  // 광고 단위가 없으면 프로덕션에서는 아무것도 렌더링하지 않음(빈 자리표시자 숨김)
  if (!adUnit && process.env.NODE_ENV === "production") return null;

  return (
    <div
      className={cn(
        "my-4 flex w-full flex-col items-center justify-center",
        className
      )}
      aria-label="광고"
    >
      {label && (
        <span className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          AD
        </span>
      )}
      {adUnit ? (
        <div
          ref={containerRef}
          style={{ minHeight: height, maxWidth: width, width: "100%" }}
        />
      ) : (
        // 광고 ID 미설정(승인 전) 시 자리표시자
        <div
          className="flex w-full items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground"
          style={{ minHeight: height, maxWidth: width }}
        >
          광고 영역 ({width}×{height})
        </div>
      )}
    </div>
  );
}
