"use client";

import { useActionState } from "react";
import { uploadDocument } from "./actions";

export function UploadForm() {
  const [message, formAction, isPending] = useActionState(uploadDocument, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-wrap items-end gap-2 rounded-md border border-dashed border-zinc-300 p-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Fichier</label>
        <input name="file" type="file" required className="rounded-md border border-zinc-300 px-2 py-1 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Catégorie (optionnel)</label>
        <input
          name="entityType"
          placeholder="general, client, fournisseur…"
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      {message && <p className="w-full text-sm text-red-600">{message}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? "Envoi…" : "Téléverser"}
      </button>
    </form>
  );
}
