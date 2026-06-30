export interface CalculatorMeta {
  /** URL 경로 (예: /age) */
  slug: string;
  /** 카드/헤더 제목 */
  title: string;
  /** 짧은 설명 */
  description: string;
  /** 검색용 키워드 (한/영) */
  keywords: string[];
  /** 카드 이모지 아이콘 */
  emoji: string;
  /** 카드 강조 색 (tailwind gradient from-to) */
  accent: string;
  /** SEO용 상세 설명 */
  seo: string;
}

export const calculators: CalculatorMeta[] = [
  {
    slug: "/age",
    title: "만 나이 계산기",
    description: "생년월일로 만 나이·연 나이·띠·다음 생일까지 남은 날을 계산",
    keywords: ["만나이", "나이계산", "연나이", "띠", "age", "생일", "birthday"],
    emoji: "🎂",
    accent: "from-pink-500/15 to-rose-500/10",
    seo: "생년월일과 기준일을 입력하면 만 나이, 연 나이, 띠, 다음 생일까지 남은 일수를 즉시 계산합니다. 2023년 시행된 만 나이 통일법 기준으로 정확하게 산정합니다.",
  },
  {
    slug: "/real-estate-tax",
    title: "부동산 취득세 계산기",
    description: "주택 수·취득가액·조정지역 여부로 취득세·교육세·농특세 자동 계산",
    keywords: [
      "부동산",
      "취득세",
      "지방교육세",
      "농어촌특별세",
      "주택세금",
      "real estate",
      "tax",
    ],
    emoji: "🏠",
    accent: "from-emerald-500/15 to-teal-500/10",
    seo: "주택 보유 수, 취득가액, 조정대상지역 여부, 전용면적을 입력하면 취득세, 지방교육세, 농어촌특별세를 자동으로 계산하고 요율표를 함께 제공합니다.",
  },
  {
    slug: "/traffic-fine",
    title: "교통 범칙금·과태료 계산기",
    description: "위반 항목·차종·보호구역 여부로 범칙금/과태료와 벌점을 조회",
    keywords: [
      "과태료",
      "범칙금",
      "벌점",
      "과속",
      "신호위반",
      "교통위반",
      "어린이보호구역",
      "traffic",
      "fine",
    ],
    emoji: "🚗",
    accent: "from-amber-500/15 to-orange-500/10",
    seo: "과속, 신호위반 등 위반 항목과 차종, 보호구역 여부를 선택하면 범칙금·과태료 금액과 벌점을 한눈에 확인할 수 있습니다.",
  },
  {
    slug: "/ev-charging",
    title: "전기차 충전요금 계산기",
    description: "배터리 용량·충전량·충전기 종류로 예상 충전 시간과 비용 계산",
    keywords: [
      "전기차",
      "충전요금",
      "충전비용",
      "급속충전",
      "완속충전",
      "EV",
      "charging",
      "배터리",
    ],
    emoji: "🔋",
    accent: "from-sky-500/15 to-indigo-500/10",
    seo: "전기차 배터리 용량, 현재 잔량, 목표 충전량, 충전기 종류와 계절·시간대를 선택하면 예상 충전 시간과 충전 비용을 계산합니다.",
  },
];

export function getCalculator(slug: string): CalculatorMeta | undefined {
  return calculators.find((c) => c.slug === slug);
}
