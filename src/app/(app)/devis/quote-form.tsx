"use client";

import { useActionState } from "react";
import { LineItemsEditor } from "@/components/line-items-editor";
import { createQuote } from "./actions";

export function QuoteForm({
  customers,
  requests,
  equipment,
}: {
  customers: { id: string; companyName: string }[];
  requests: { id: string; title: string; customerId: string }[];
  equipment: { id: string; name: string }[];
}) {
  const [message, formAction, isPending] = useActionState(createQuote, undefined);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
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
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">
            Demande liée (optionnel)
          </label>
          <select
            name="requestId"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          >
            <option value="">—</option>
            {requests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">
          Valide jusqu&apos;au
        </label>
        <input
          name="validUntil"
          type="date"
          className="w-fit rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      <LineItemsEditor equipment={equipment} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Notes</label>
        <textarea
          name="notes"
          rows={2}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? "Création…" : "Créer le devis"}
      </button>
    </form>
  );
}
