# 만능계산기 (cal_any)

생활 밀착형 무료 계산기 모음 사이트. Next.js(App Router) + TypeScript + Tailwind CSS v4 기반이며, Vercel 배포와 카카오 애드핏(Kakao AdFit) 광고 수익화를 고려해 설계했습니다.

## 주요 기능

- 🎂 **만 나이 계산기** — 만 나이/연 나이/띠/다음 생일까지 남은 날
- 🏠 **부동산 취득세 계산기** — 주택 수·취득가액·조정지역·면적 기반 취득세/지방교육세/농특세
- 🚗 **교통 범칙금·과태료 계산기** — 위반 항목·차종·보호구역 가중 반영
- 🔋 **전기차 충전요금 계산기** — 배터리 용량·충전기 종류·시간대별 비용/시간
- 🔎 메인 페이지 실시간 검색, 다크/라이트 모드, 반응형, SEO(메타데이터·sitemap·robots·JSON-LD)

## 폴더 구조

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (메타데이터/헤더/푸터/테마 초기화)
│   ├── page.tsx                # 메인 (검색 + 카드 그리드 + JSON-LD)
│   ├── globals.css             # Tailwind v4 토큰 + 다크모드
│   ├── sitemap.ts / robots.ts  # SEO
│   ├── age/                    # 만 나이 계산기
│   ├── real-estate-tax/        # 부동산 취득세 계산기
│   ├── traffic-fine/           # 교통 범칙금·과태료 계산기
│   └── ev-charging/            # 전기차 충전요금 계산기
├── components/
│   ├── ads/AdFitBanner.tsx     # 카카오 애드핏 공통 배너
│   ├── layout/                 # Header / Footer / ThemeToggle
│   ├── calculators/            # 각 계산기 로직 컴포넌트
│   ├── CalculatorGrid.tsx      # 실시간 검색 그리드
│   ├── CalculatorShell.tsx     # 계산기 공통 셸(광고 배치 포함)
│   └── ui/                     # Button/Card/Input/Select/Label/OptionGroup/Result
└── lib/
    ├── calculators.ts          # 계산기 메타데이터 레지스트리
    ├── site.ts                 # 사이트 전역 설정
    └── utils.ts                # cn, 통화/숫자 포맷 유틸
```

## 광고(카카오 애드핏) 설정

광고 단위 ID는 환경변수로 주입합니다. 값이 없으면 자리표시자가 표시됩니다.

1. `.env.example` → `.env.local` 로 복사
2. 애드핏 승인 후 발급받은 `DAN-xxxxxxxx` 값을 채움
3. Vercel 배포 시 **Project Settings → Environment Variables** 에 동일하게 등록

| 환경변수 | 배치 | 권장 사이즈 |
| --- | --- | --- |
| `NEXT_PUBLIC_ADFIT_UNIT_HEADER` | 헤더 아래 가로 배너 | 728×90 |
| `NEXT_PUBLIC_ADFIT_UNIT_INCONTENT` | 입력 폼·결과 사이 | 300×250 |
| `NEXT_PUBLIC_ADFIT_UNIT_SIDEBAR` | 데스크톱 사이드바 | 250×250 |
| `NEXT_PUBLIC_ADFIT_UNIT_FOOTER` | 푸터 위 | 728×90 |

`NEXT_PUBLIC_SITE_URL` 에는 배포 도메인을 넣어 SEO/sitemap 의 정규 주소를 맞춥니다.

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
```

## 배포 (Vercel)

GitHub 저장소를 Vercel 에 연결하면 push 시 자동 배포됩니다. Framework Preset 은 Next.js 가 자동 인식됩니다.

> ⚠️ 모든 계산 결과는 참고용이며 법적 효력이 없습니다. 정확한 금액은 관련 기관에 확인하세요.
