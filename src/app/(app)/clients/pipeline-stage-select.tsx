"use client";

import { useTransition } from "react";
import type { PipelineStage } from "@/generated/prisma/client";
import { updatePipelineStage } from "./actions";

const STAGES: { value: PipelineStage; label: string }[] = [
  { value: "PROSPECT", label: "Prospect" },
  { value: "CONTACT_ETABLI", label: "Contact établi" },
  { value: "BESOIN_IDENTIFIE", label: "Besoin identifié" },
  { value: "RECHERCHE_MATERIEL", label: "Recherche matériel" },
  { value: "PROPOSITION", label: "Proposition" },
  { value: "DEVIS", label: "Devis" },
  { value: "NEGOCIATION", label: "Négociation" },
  { value: "COMMANDE", label: "Commande" },
  { value: "LIVRAISON", label: "Livraison" },
  { value: "FACTURATION", label: "Facturation" },
  { value: "PAYE", label: "Payé" },
];

export function PipelineStageSelect({
  customerId,
  value,
}: {
  customerId: string;
  value: PipelineStage;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => {
          updatePipelineStage(customerId, e.target.value as PipelineStage);
        })
      }
      className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-900 disabled:opacity-60"
    >
      {STAGES.map((stage) => (
        <option key={stage.value} value={stage.value}>
          {stage.label}
        </option>
      ))}
    </select>
  );
}
