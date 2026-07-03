import Link from "next/link";
import { calculators } from "@/lib/calculators";
import { ResponsiveAdFitBanner } from "@/components/ads/ResponsiveAdFitBanner";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* 푸터 광고 (데스크톱 728x90 / 모바일 단위 발급 시 활성화) */}
        <ResponsiveAdFitBanner
          desktop={{ slot: "footer", width: 728, height: 90 }}
          mobile={{ slot: "footerMobile", width: 320, height: 100 }}
          className="mb-8"
        />

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-base font-bold">
              만능<span className="text-primary">계산기</span>
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              생활에 꼭 필요한 계산을 빠르고 정확하게. 만 나이부터 부동산
              세금, 교통 범칙금, 전기차 충전요금까지 한 곳에서.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">계산기 바로가기</h3>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {calculators.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={c.slug}
                    className="transition-colors hover:text-foreground"
                  >
                    {c.emoji} {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            본 사이트의 계산 결과는 참고용이며 실제 세액·과태료 등 법적
            효력을 갖지 않습니다. 정확한 금액은 관련 기관에 확인하세요.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} 만능계산기. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
