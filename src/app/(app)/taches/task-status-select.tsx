"use client";

import { EnumSelect } from "@/components/enum-select";
import type { TaskStatus } from "@/generated/prisma/client";
import { updateTaskStatus } from "./actions";

const OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "A_FAIRE", label: "À faire" },
  { value: "EN_COURS", label: "En cours" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "TERMINEE", label: "Terminée" },
];

export function TaskStatusSelect({
  taskId,
  value,
}: {
  taskId: string;
  value: TaskStatus;
}) {
  return (
    <EnumSelect
      value={value}
      options={OPTIONS}
      onChange={updateTaskStatus.bind(null, taskId)}
    />
  );
}
