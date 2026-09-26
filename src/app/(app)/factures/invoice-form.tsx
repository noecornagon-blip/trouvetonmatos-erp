"use client";

import { useActionState, useState } from "react";
import { LineItemsEditor, type LineItemRow } from "@/components/line-items-editor";
import { createInvoice } from "./actions";
import type { InvoiceType } from "@/generated/prisma/client";

export function InvoiceForm({
  customers,
  suppliers,
  defaultType = "CLIENT",
  defaultCustomerId,
  defaultSupplierId,
  defaultSaleId,
  defaultPurchaseOrderId,
  defaultItems,
}: {
  customers: { id: string; companyName: string }[];
  suppliers: { id: string; companyName: string }[];
  defaultType?: InvoiceType;
  defaultCustomerId?: string;
  defaultSupplierId?: string;
  defaultSaleId?: string;
  defaultPurchaseOrderId?: string;
  defaultItems?: LineItemRow[];
}) {
  const [message, formAction, isPending] = useActionState(createInvoice, undefined);
  const [type, setType] = useState<InvoiceType>(defaultType);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-4">
      {defaultSaleId && <input type="hidden" name="saleId" value={defaultSaleId} />}
      {defaultPurchaseOrderId && (
        <input type="hidden" name="purchaseOrderId" value={defaultPurchaseOrderId} />
      )}
      {defaultSaleId && defaultCustomerId && (
        <input type="hidden" name="customerId" value={defaultCustomerId} />
      )}
      {defaultPurchaseOrderId && defaultSupplierId && (
        <input type="hidden" name="supplierId" value={defaultSupplierId} />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Type</label>
          {(defaultSaleId || defaultPurchaseOrderId) && (
            <input type="hidden" name="type" value={type} />
          )}
          <select
            name={defaultSaleId || defaultPurchaseOrderId ? undefined : "type"}
            value={type}
            onChange={(e) => setType(e.target.value as InvoiceType)}
            disabled={!!defaultSaleId || !!defaultPurchaseOrderId}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          >
            <option value="CLIENT">Client</option>
            <option value="FOURNISSEUR">Fournisseur</option>
            <option value="AVOIR">Avoir</option>
            <option value="ACOMPTE">Acompte</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Échéance</label>
          <input
            name="dueDate"
            type="date"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      {type === "FOURNISSEUR" ? (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Fournisseur</label>
          <select
            name={defaultPurchaseOrderId ? undefined : "supplierId"}
            required={!defaultPurchaseOrderId}
            defaultValue={defaultSupplierId ?? ""}
            disabled={!!defaultPurchaseOrderId}
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
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Client</label>
          <select
            name={defaultSaleId ? undefined : "customerId"}
            required={!defaultSaleId}
            defaultValue={defaultCustomerId ?? ""}
            disabled={!!defaultSaleId}
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
      )}

      <LineItemsEditor equipment={[]} defaultItems={defaultItems} />

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? "Création…" : "Créer la facture"}
      </button>
    </form>
  );
}
