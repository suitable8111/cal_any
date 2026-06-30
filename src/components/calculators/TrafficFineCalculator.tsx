"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { OptionGroup } from "@/components/ui/option-group";
import { ResultBox, StatRow } from "@/components/ui/result";
import { AdFitBanner } from "@/components/ads/AdFitBanner";
import { formatKRW } from "@/lib/utils";

type Penalty = { fine: number; ticket: number; point: number };
type VehicleType = "car" | "van";

interface Violation {
  id: string;
  label: string;
  car: Penalty; // 승용차
  van: Penalty; // 승합·화물차
  zone: boolean; // 보호구역 가중(2배) 적용 여부
}

/** 과태료(무인단속) / 범칙금(현장단속) / 벌점. 0 은 해당 없음. (2024 기준, 참고용) */
const VIOLATIONS: Violation[] = [
  {
    id: "speed1",
    label: "과속 20km/h 이하 초과",
    car: { fine: 40000, ticket: 30000, point: 0 },
    van: { fine: 40000, ticket: 30000, point: 0 },
    zone: true,
  },
  {
    id: "speed2",
    label: "과속 20~40km/h 초과",
    car: { fine: 70000, ticket: 60000, point: 15 },
    van: { fine: 80000, ticket: 70000, point: 15 },
    zone: true,
  },
  {
    id: "speed3",
    label: "과속 40~60km/h 초과",
    car: { fine: 100000, ticket: 90000, point: 30 },
    van: { fine: 110000, ticket: 100000, point: 30 },
    zone: true,
  },
  {
    id: "speed4",
    label: "과속 60km/h 초과",
    car: { fine: 130000, ticket: 120000, point: 60 },
    van: { fine: 140000, ticket: 130000, point: 60 },
    zone: true,
  },
  {
    id: "signal",
    label: "신호·지시 위반",
    car: { fine: 70000, ticket: 60000, point: 15 },
    van: { fine: 80000, ticket: 70000, point: 15 },
    zone: true,
  },
  {
    id: "crosswalk",
    label: "횡단보도 보행자 보호의무 위반",
    car: { fine: 70000, ticket: 60000, point: 10 },
    van: { fine: 80000, ticket: 70000, point: 10 },
    zone: true,
  },
  {
    id: "centerline",
    label: "중앙선 침범",
    car: { fine: 0, ticket: 60000, point: 30 },
    van: { fine: 0, ticket: 70000, point: 30 },
    zone: false,
  },
  {
    id: "parking",
    label: "정차·주차 위반",
    car: { fine: 40000, ticket: 0, point: 0 },
    van: { fine: 50000, ticket: 0, point: 0 },
    zone: true,
  },
  {
    id: "seatbelt",
    label: "안전띠 미착용",
    car: { fine: 0, ticket: 30000, point: 0 },
    van: { fine: 0, ticket: 30000, point: 0 },
    zone: false,
  },
];

export function TrafficFineCalculator() {
  const [violationId, setViolationId] = useState(VIOLATIONS[1].id);
  const [vehicle, setVehicle] = useState<VehicleType>("car");
  const [zone, setZone] = useState<"normal" | "zone">("normal");

  const result = useMemo(() => {
    const v = VIOLATIONS.find((x) => x.id === violationId)!;
    const base = vehicle === "car" ? v.car : v.van;
    const applyZone = zone === "zone" && v.zone;
    const mul = applyZone ? 2 : 1;
    return {
      violation: v,
      fine: base.fine * mul,
      ticket: base.ticket * mul,
      point: base.point * mul,
      zoneApplied: applyZone,
      zoneSelectedButNA: zone === "zone" && !v.zone,
    };
  }, [violationId, vehicle, zone]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <Label htmlFor="violation">위반 항목</Label>
            <Select
              id="violation"
              value={violationId}
              onChange={(e) => setViolationId(e.target.value)}
            >
              {VIOLATIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>차종</Label>
              <OptionGroup<VehicleType>
                options={[
                  { label: "승용차", value: "car" },
                  { label: "승합·화물", value: "van" },
                ]}
                value={vehicle}
                onChange={setVehicle}
              />
            </div>
            <div>
              <Label>도로 구분</Label>
              <OptionGroup<"normal" | "zone">
                options={[
                  { label: "일반도로", value: "normal" },
                  { label: "보호구역", value: "zone" },
                ]}
                value={zone}
                onChange={setZone}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            보호구역(어린이·노인·장애인) 위반 시 범칙금·과태료·벌점이 2배
            가중됩니다.
          </p>
        </CardContent>
      </Card>

      {/* 2. 입력 폼과 결과창 사이 콘텐츠 삽입형 배너 */}
      <AdFitBanner slot="inContent" width={300} height={250} />

      <ResultBox>
        {result.zoneApplied && (
          <p className="mb-3 rounded-md bg-warning/15 px-3 py-2 text-xs text-foreground">
            🚸 보호구역 2배 가중이 적용되었습니다.
          </p>
        )}
        {result.zoneSelectedButNA && (
          <p className="mb-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            해당 위반 항목은 보호구역 가중 대상이 아닙니다.
          </p>
        )}
        <StatRow
          label="과태료 (무인 단속)"
          value={result.fine > 0 ? `${formatKRW(result.fine)} 원` : "해당 없음"}
        />
        <StatRow
          label="범칙금 (현장 단속)"
          value={
            result.ticket > 0 ? `${formatKRW(result.ticket)} 원` : "해당 없음"
          }
          highlight
        />
        <StatRow
          label="벌점"
          value={result.point > 0 ? `${result.point}점` : "없음"}
        />
      </ResultBox>

      <Card>
        <CardContent className="p-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">
            과태료와 범칙금의 차이
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <b className="text-foreground">과태료</b>: 무인 단속 카메라 등으로
              적발되어 차량 명의자에게 부과. 벌점은 없습니다.
            </li>
            <li>
              <b className="text-foreground">범칙금</b>: 경찰관 현장 단속으로
              운전자에게 부과. 벌점이 함께 부과될 수 있습니다.
            </li>
          </ul>
          <p className="mt-3 text-xs">
            본 결과는 도로교통법 시행령 기준의 참고용 금액으로, 실제 부과액은
            위반 정황·시간대·상습 여부에 따라 달라질 수 있습니다. 정확한 내용은
            경찰청 이파인(eFINE)에서 확인하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
