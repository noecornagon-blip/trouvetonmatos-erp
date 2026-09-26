"use client";

import { useActionState } from "react";
import { LineItemsEditor } from "@/components/line-items-editor";
import { createPurchaseOrder } from "./actions";

export function PurchaseOrderForm({
  suppliers,
  equipment,
}: {
  suppliers: { id: string; companyName: string }[];
  equipment: { id: string; name: string }[];
}) {
  const [message, formAction, isPending] = useActionState(
    createPurchaseOrder,
    undefined
  );

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Fournisseur</label>
        <select
          name="supplierId"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        >
          <option value="">Sélectionner…</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.companyName}
            </option>
          ))}
        </select>
      </div>

      <LineItemsEditor equipment={equipment} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">
            Frais de transport (€)
          </label>
          <input
            name="transportCost"
            type="number"
            step="0.01"
            defaultValue={0}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">
            Autres frais (€)
          </label>
          <input
            name="otherFees"
            type="number"
            step="0.01"
            defaultValue={0}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? "Création…" : "Créer le bon de commande"}
      </button>
    </form>
  );
}
