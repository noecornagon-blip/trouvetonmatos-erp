"use client";

import { useActionState } from "react";
import { askAssistant } from "./actions";

export function AssistantForm() {
  const [answer, formAction, isPending] = useActionState(askAssistant, undefined);

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-2">
        <textarea
          name="question"
          rows={3}
          required
          placeholder="Ex : Quel est mon CA total ? Ai-je des factures en retard ?"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {isPending ? "Réflexion…" : "Demander"}
        </button>
      </form>

      {answer && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm whitespace-pre-wrap text-zinc-800">
          {answer}
        </div>
      )}
    </div>
  );
}
