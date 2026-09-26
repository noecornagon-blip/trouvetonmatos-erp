"use client";

import { EnumSelect } from "@/components/enum-select";
import type { PurchaseOrderStatus } from "@/generated/prisma/client";
import { updatePurchaseOrderStatus } from "./actions";

const OPTIONS: { value: PurchaseOrderStatus; label: string }[] = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "COMMANDE", label: "Commandé" },
  { value: "RECU", label: "Reçu" },
  { value: "FACTURE", label: "Facturé" },
  { value: "ANNULE", label: "Annulé" },
];

export function PurchaseOrderStatusSelect({
  purchaseOrderId,
  value,
}: {
  purchaseOrderId: string;
  value: PurchaseOrderStatus;
}) {
  return (
    <EnumSelect
      value={value}
      options={OPTIONS}
      onChange={updatePurchaseOrderStatus.bind(null, purchaseOrderId)}
    />
  );
}
