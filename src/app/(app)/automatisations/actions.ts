"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";

export async function createRule(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("automatisations");

  const name = String(formData.get("name") ?? "").trim();
  const triggerEntity = String(formData.get("triggerEntity") ?? "");
  const triggerEvent = String(formData.get("triggerEvent") ?? "");
  const conditionField = String(formData.get("conditionField") ?? "");
  const conditionOperator = String(formData.get("conditionOperator") ?? "eq");
  const conditionValue = String(formData.get("conditionValue") ?? "");
  const actionTitle = String(formData.get("actionTitle") ?? "");
  const actionAssigneeId = (formData.get("actionAssigneeId") as string) || undefined;

  if (!name || !triggerEntity || !triggerEvent || !conditionField || !actionTitle) {
    return "Tous les champs sont obligatoires.";
  }

  const rule = await prisma.automationRule.create({
    data: {
      name,
      triggerEntity,
      triggerEvent,
      conditions: {
        field: conditionField,
        operator: conditionOperator,
        value: conditionValue,
      },
      actions: {
        type: "create_task",
        title: actionTitle,
        assigneeId: actionAssigneeId,
      },
      createdBy: user.id,
    },
  });

  await logActivity({
    userId: user.id,
    action: "automation_rule.created",
    entityType: "automation_rule",
    entityId: rule.id,
  });

  revalidatePath("/automatisations");
  redirect("/automatisations");
}

export async function toggleRule(id: string, active: boolean): Promise<void> {
  const user = await requireWriteAccess("automatisations");
  await prisma.automationRule.update({ where: { id }, data: { active } });
  await logActivity({
    userId: user.id,
    action: "automation_rule.toggled",
    entityType: "automation_rule",
    entityId: id,
    changes: { active },
  });
  revalidatePath("/automatisations");
}
