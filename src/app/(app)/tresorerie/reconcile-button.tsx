"use client";

import { useTransition } from "react";
import { reconcileTransaction } from "./import/actions";

export function ReconcileButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => reconcileTransaction(id))}
      className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs hover:bg-zinc-100 disabled:opacity-60"
    >
      Rapprocher
    </button>
  );
}
