"use client";

import { useTransition } from "react";
import { validateVatRecord } from "./actions";

export function ValidateButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => validateVatRecord(id))}
      className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 disabled:opacity-60"
    >
      Valider
    </button>
  );
}
