"use client";

import { useTransition } from "react";
import { EnumSelect } from "@/components/enum-select";
import type { QuoteStatus } from "@/generated/prisma/client";
import { updateQuoteStatus, convertQuoteToSale } from "./actions";

const OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "ENVOYE", label: "Envoyé" },
  { value: "ACCEPTE", label: "Accepté" },
  { value: "REFUSE", label: "Refusé" },
  { value: "EXPIRE", label: "Expiré" },
];

export function QuoteControls({
  quoteId,
  status,
  hasSale,
}: {
  quoteId: string;
  status: QuoteStatus;
  hasSale: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <EnumSelect
        value={status}
        options={OPTIONS}
        onChange={updateQuoteStatus.bind(null, quoteId)}
      />
      {!hasSale && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => convertQuoteToSale(quoteId))}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          Convertir en vente
        </button>
      )}
    </div>
  );
}
