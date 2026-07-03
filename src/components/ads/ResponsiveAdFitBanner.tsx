"use client";

import { useEffect, useState } from "react";
import { AdFitBanner, type AdSlot } from "./AdFitBanner";

interface AdSpec {
  slot: AdSlot;
  width: number;
  height: number;
}

interface ResponsiveAdFitBannerProps {
  /** 데스크톱(md 이상)에서 사용할 광고 단위/크기 */
  desktop: AdSpec;
  /** 모바일에서 사용할 광고 단위/크기 */
  mobile: AdSpec;
  className?: string;
}

const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * 화면 폭에 따라 모바일/데스크톱 광고 단위를 선택하는 반응형 배너.
 *
 * 애드핏 광고 단위는 고정 사이즈라 뷰포트가 단위 폭보다 좁으면 송출되지
 * 않으므로, 마운트 시점에 한 번만 판별해 알맞은 단위 하나만 요청합니다.
 * (리사이즈 시 재요청하지 않음 — 중복 노출/무효 트래픽 방지)
 */
export function ResponsiveAdFitBanner({
  desktop,
  mobile,
  className,
}: ResponsiveAdFitBannerProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDesktop(window.matchMedia(DESKTOP_QUERY).matches);
  }, []);

  // 판별 전에는 모바일 기준 높이만큼 자리를 잡아 레이아웃 이동(CLS)을 줄임
  if (isDesktop === null) {
    return (
      <div
        className={className}
        style={{ minHeight: mobile.height }}
        aria-hidden
      />
    );
  }

  const spec = isDesktop ? desktop : mobile;
  return (
    <AdFitBanner
      slot={spec.slot}
      width={spec.width}
      height={spec.height}
      className={className}
    />
  );
}
