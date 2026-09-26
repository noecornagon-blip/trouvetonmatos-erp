"use client";

import { EnumSelect } from "@/components/enum-select";
import type { RequestStatus, RequestPriority } from "@/generated/prisma/client";
import { updateRequestStatus, updateRequestPriority } from "./actions";

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "NOUVELLE", label: "Nouvelle" },
  { value: "EN_RECHERCHE", label: "En recherche" },
  { value: "PROPOSITION_ENVOYEE", label: "Proposition envoyée" },
  { value: "CONVERTIE", label: "Convertie" },
  { value: "ABANDONNEE", label: "Abandonnée" },
];

const PRIORITY_OPTIONS: { value: RequestPriority; label: string }[] = [
  { value: "BASSE", label: "Basse" },
  { value: "NORMALE", label: "Normale" },
  { value: "HAUTE", label: "Haute" },
  { value: "URGENTE", label: "Urgente" },
];

export function RequestControls({
  requestId,
  status,
  priority,
}: {
  requestId: string;
  status: RequestStatus;
  priority: RequestPriority;
}) {
  return (
    <div className="flex items-center gap-2">
      <EnumSelect
        value={status}
        options={STATUS_OPTIONS}
        onChange={updateRequestStatus.bind(null, requestId)}
      />
      <EnumSelect
        value={priority}
        options={PRIORITY_OPTIONS}
        onChange={updateRequestPriority.bind(null, requestId)}
      />
    </div>
  );
}
