/** 사이트 전역 설정. 배포 도메인은 Vercel 환경변수로 덮어쓸 수 있습니다. */
export const siteConfig = {
  name: "만능계산기",
  title: "만능계산기 — 생활 밀착형 무료 계산기 모음",
  description:
    "만 나이, 부동산 취득세, 교통 범칙금·과태료, 전기차 충전요금까지. 자주 쓰는 생활 계산기를 빠르고 정확하게 무료로 이용하세요.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://cal-any.vercel.app",
  locale: "ko_KR",
};

export type SiteConfig = typeof siteConfig;
