import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type Condition = { field: string; operator: "eq" | "neq" | "gt" | "lt"; value: string };
type Action =
  | { type: "create_task"; title: string; assigneeId?: string; priority?: string };

function getField(entity: Record<string, unknown>, field: string): unknown {
  return entity[field];
}

function matchesCondition(entity: Record<string, unknown>, condition: Condition): boolean {
  const actual = getField(entity, condition.field);
  const expected = condition.value;
  switch (condition.operator) {
    case "eq":
      return String(actual) === expected;
    case "neq":
      return String(actual) !== expected;
    case "gt":
      return Number(actual) > Number(expected);
    case "lt":
      return Number(actual) < Number(expected);
    default:
      return false;
  }
}

/**
 * Moteur de règles "si… alors" (§25/vague 4 du brief) : évalue les règles
 * actives pour un déclencheur donné et exécute leurs actions. Volontairement
 * simple (une condition, une action par règle) pour rester compréhensible
 * par les 3 associés qui les configureront eux-mêmes.
 */
export async function runAutomationRules(
  triggerEntity: string,
  triggerEvent: string,
  entity: Record<string, unknown> & { id: string }
) {
  const rules = await prisma.automationRule.findMany({
    where: { triggerEntity, triggerEvent, active: true },
  });

  for (const rule of rules) {
    const condition = rule.conditions as unknown as Condition;
    if (!matchesCondition(entity, condition)) continue;

    const action = rule.actions as unknown as Action;
    let result: Prisma.InputJsonValue = {};

    if (action.type === "create_task") {
      const task = await prisma.task.create({
        data: {
          title: action.title,
          priority: (action.priority as "BASSE" | "NORMALE" | "HAUTE" | "URGENTE") ?? "NORMALE",
          assigneeId: action.assigneeId || null,
          entityType: triggerEntity,
          entityId: entity.id,
        },
      });
      result = { taskId: task.id };
    }

    await prisma.automationLog.create({
      data: {
        ruleId: rule.id,
        entityType: triggerEntity,
        entityId: entity.id,
        result,
      },
    });
  }
}
