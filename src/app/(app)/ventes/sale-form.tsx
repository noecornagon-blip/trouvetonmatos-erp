"use client";

import { useActionState } from "react";
import { LineItemsEditor } from "@/components/line-items-editor";
import { createSale } from "./actions";

export function SaleForm({
  customers,
  equipment,
}: {
  customers: { id: string; companyName: string }[];
  equipment: { id: string; name: string }[];
}) {
  const [message, formAction, isPending] = useActionState(createSale, undefined);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Client</label>
        <select
          name="customerId"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        >
          <option value="">Sélectionner…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.companyName}
            </option>
          ))}
        </select>
      </div>

      <LineItemsEditor equipment={equipment} showCost />

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? "Création…" : "Créer la vente"}
      </button>
    </form>
  );
}
