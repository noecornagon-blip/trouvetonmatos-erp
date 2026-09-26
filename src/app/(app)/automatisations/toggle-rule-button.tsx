"use client";

import { useTransition } from "react";
import { toggleRule } from "./actions";

export function ToggleRuleButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleRule(id, !active))}
      className={`rounded-md border px-2 py-1 text-xs disabled:opacity-60 ${
        active ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50" : "border-zinc-300 text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      {active ? "Active" : "Désactivée"}
    </button>
  );
}
