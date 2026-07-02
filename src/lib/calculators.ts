export type CalculatorCategory = "financial" | "lifestyle" | "health" | "dev";

export const CATEGORY_LABELS: Record<CalculatorCategory, string> = {
  financial: "금융 · 재테크",
  lifestyle: "일상 · 생활",
  health: "건강 · 운동",
  dev: "개발 · IT",
};

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
  /** 카테고리 분류 */
  category: CalculatorCategory;
}

export const calculators: CalculatorMeta[] = [
  {
    slug: "/savings-interest",
    title: "예적금 이자 계산기",
    description: "단리·복리, 일반과세·세금우대·비과세를 반영한 실제 수령액 계산",
    keywords: [
      "예금",
      "적금",
      "이자계산",
      "단리",
      "복리",
      "세금우대",
      "비과세",
      "이자소득세",
      "savings",
    ],
    emoji: "💰",
    accent: "from-yellow-500/15 to-amber-500/10",
    seo: "예금(거치식)과 적금(적립식)의 단리·복리 이자를 계산하고, 일반과세(15.4%)·세금우대(9.5%)·비과세 혜택을 반영한 실제 세후 수령액을 확인할 수 있습니다.",
    category: "financial",
  },
  {
    slug: "/loan-repayment",
    title: "대출 상환 계산기",
    description: "원리금균등·원금균등·만기일시 상환 방식별 월 상환액과 총이자 비교",
    keywords: [
      "대출",
      "이자계산",
      "원리금균등",
      "원금균등",
      "만기일시상환",
      "상환스케줄",
      "loan",
      "월상환액",
    ],
    emoji: "🏦",
    accent: "from-blue-500/15 to-cyan-500/10",
    seo: "대출 원금, 연이자율, 대출기간을 입력하면 원리금균등·원금균등·만기일시상환 방식별 월 상환액, 총 이자, 연차별 상환 스케줄을 비교할 수 있습니다.",
    category: "financial",
  },
  {
    slug: "/stock-average",
    title: "주식 평단가(물타기) 계산기",
    description: "보유 수량·평단가에 추가 매수를 더해 최종 평단가와 총 투자금액 계산",
    keywords: [
      "주식",
      "평단가",
      "물타기",
      "평균단가",
      "추가매수",
      "stock",
      "average price",
    ],
    emoji: "📈",
    accent: "from-red-500/15 to-rose-500/10",
    seo: "현재 보유 수량과 평단가에 추가 매수 수량·가격을 더해 최종 평균단가, 총 보유수량, 총 투자금액을 즉시 계산합니다.",
    category: "financial",
  },
  {
    slug: "/salary",
    title: "연봉 실수령액 계산기",
    description: "2026년 기준 4대보험과 근로소득세를 제외한 예상 월 실수령액 계산",
    keywords: [
      "연봉",
      "실수령액",
      "4대보험",
      "국민연금",
      "건강보험",
      "고용보험",
      "근로소득세",
      "월급",
      "salary",
    ],
    emoji: "💵",
    accent: "from-green-500/15 to-emerald-500/10",
    seo: "연봉과 부양가족 수를 입력하면 2026년 기준 국민연금·건강보험·장기요양보험·고용보험·근로소득세·지방소득세를 제외한 예상 월 실수령액과 1억 5천만원까지의 연봉별 실수령액 참고표를 계산합니다.",
    category: "financial",
  },
  {
    slug: "/age",
    title: "만 나이 계산기",
    description: "생년월일로 만 나이·연 나이·띠·다음 생일까지 남은 날을 계산",
    keywords: ["만나이", "나이계산", "연나이", "띠", "age", "생일", "birthday"],
    emoji: "🎂",
    accent: "from-pink-500/15 to-rose-500/10",
    seo: "생년월일과 기준일을 입력하면 만 나이, 연 나이, 띠, 다음 생일까지 남은 일수를 즉시 계산합니다. 2023년 시행된 만 나이 통일법 기준으로 정확하게 산정합니다.",
    category: "lifestyle",
  },
  {
    slug: "/dday",
    title: "디데이(D-Day) 계산기",
    description: "목표일까지 남은 날, 특정일로부터 지난 날·기념일(100일·1주년)을 계산",
    keywords: [
      "디데이",
      "dday",
      "d-day",
      "날짜계산",
      "기념일",
      "100일",
      "며칠",
      "날짜세기",
      "countdown",
    ],
    emoji: "📅",
    accent: "from-violet-500/15 to-purple-500/10",
    seo: "목표 날짜까지 남은 D-Day, 특정 시작일로부터 오늘까지 지난 일수, 100일·200일·1주년 등 주요 기념일 날짜를 한 번에 계산합니다.",
    category: "lifestyle",
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
    category: "financial",
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
    category: "lifestyle",
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
    category: "lifestyle",
  },
];

export function getCalculator(slug: string): CalculatorMeta | undefined {
  return calculators.find((c) => c.slug === slug);
}
