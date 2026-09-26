import { prisma } from "@/lib/prisma";
import type { AccountingSourceType } from "@/generated/prisma/client";

/**
 * Comptabilité assistée, pas autonome (§41 du brief) : une écriture
 * simplifiée par paiement/dépense, jamais saisie à la main.
 */
export async function recordAccountingEntry(params: {
  label: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  sourceType: AccountingSourceType;
  sourceId: string;
}) {
  if (params.amount <= 0) return;
  await prisma.accountingEntry.create({ data: params });
}
