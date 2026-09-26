import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ToggleRuleButton } from "./toggle-rule-button";

const ENTITY_LABEL: Record<string, string> = {
  invoice: "Facture",
  quote: "Devis",
};

export default async function AutomatisationsPage() {
  const rules = await prisma.automationRule.findMany({
    orderBy: { createdAt: "desc" },
    include: { logs: { orderBy: { createdAt: "desc" }, take: 3 } },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Automatisations"
        action={{ href: "/automatisations/new", label: "Nouvelle règle" }}
      />

      <div className="flex flex-col gap-3">
        {rules.map((rule) => {
          const condition = rule.conditions as { field: string; operator: string; value: string };
          const action = rule.actions as { title: string };
          return (
            <div key={rule.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{rule.name}</p>
                  <p className="text-xs text-zinc-500">
                    SI {ENTITY_LABEL[rule.triggerEntity] ?? rule.triggerEntity}.{condition.field}{" "}
                    {condition.operator === "eq" ? "=" : "≠"} {condition.value} ALORS créer la
                    tâche « {action.title} »
                  </p>
                </div>
                <ToggleRuleButton id={rule.id} active={rule.active} />
              </div>
              {rule.logs.length > 0 && (
                <p className="mt-2 text-xs text-zinc-400">
                  Dernier déclenchement : {rule.logs[0].createdAt.toLocaleString("fr-FR")}
                </p>
              )}
            </div>
          );
        })}
        {rules.length === 0 && (
          <p className="text-sm text-zinc-400">Aucune règle configurée pour le moment.</p>
        )}
      </div>
    </div>
  );
}
