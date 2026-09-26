"use client";

import { useActionState } from "react";
import { importBankCsv } from "./actions";

export function ImportForm({ accounts }: { accounts: { id: string; name: string }[] }) {
  const [message, formAction, isPending] = useActionState(importBankCsv, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Compte bancaire</label>
        <select
          name="bankAccountId"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">
          Fichier CSV (date,libellé,montant)
        </label>
        <input
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? "Import…" : "Importer"}
      </button>
    </form>
  );
}
