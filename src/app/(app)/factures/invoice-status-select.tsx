"use client";

import { EnumSelect } from "@/components/enum-select";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { updateInvoiceStatus } from "./actions";

const OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "ENVOYEE", label: "Envoyée" },
  { value: "PAYEE", label: "Payée" },
  { value: "EN_RETARD", label: "En retard" },
  { value: "ANNULEE", label: "Annulée" },
];

export function InvoiceStatusSelect({ invoiceId, value }: { invoiceId: string; value: InvoiceStatus }) {
  return (
    <EnumSelect value={value} options={OPTIONS} onChange={updateInvoiceStatus.bind(null, invoiceId)} />
  );
}
