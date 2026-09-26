"use client";

import { EnumSelect } from "@/components/enum-select";
import type { EquipmentStatus } from "@/generated/prisma/client";
import { updateEquipmentStatus } from "./actions";

const OPTIONS: { value: EquipmentStatus; label: string }[] = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "RESERVE", label: "Réservé" },
  { value: "VENDU", label: "Vendu" },
  { value: "ARCHIVE", label: "Archivé" },
];

export function EquipmentStatusSelect({
  equipmentId,
  value,
}: {
  equipmentId: string;
  value: EquipmentStatus;
}) {
  return (
    <EnumSelect
      value={value}
      options={OPTIONS}
      onChange={updateEquipmentStatus.bind(null, equipmentId)}
    />
  );
}
