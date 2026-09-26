"use client";

import { EnumSelect } from "@/components/enum-select";
import type { SaleStatus } from "@/generated/prisma/client";
import { updateSaleStatus } from "./actions";

const OPTIONS: { value: SaleStatus; label: string }[] = [
  { value: "COMMANDE", label: "Commande" },
  { value: "LIVRAISON", label: "Livraison" },
  { value: "FACTUREE", label: "Facturée" },
  { value: "PAYEE", label: "Payée" },
  { value: "ANNULEE", label: "Annulée" },
];

export function SaleStatusSelect({ saleId, value }: { saleId: string; value: SaleStatus }) {
  return (
    <EnumSelect value={value} options={OPTIONS} onChange={updateSaleStatus.bind(null, saleId)} />
  );
}
