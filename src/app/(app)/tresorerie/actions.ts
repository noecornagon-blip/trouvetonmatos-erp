"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import type { BankTransactionType } from "@/generated/prisma/client";

export async function createBankAccount(formData: FormData): Promise<void> {
  const user = await requireWriteAccess("tresorerie");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.bankAccount.create({
    data: {
      name,
      openingBalance: Number(formData.get("openingBalance") || 0),
    },
  });

  await logActivity({
    userId: user.id,
    action: "bank_account.created",
    entityType: "bank_account",
    entityId: name,
  });

  revalidatePath("/tresorerie");
}

export async function createBankTransaction(formData: FormData): Promise<void> {
  const user = await requireWriteAccess("tresorerie");

  const bankAccountId = String(formData.get("bankAccountId") ?? "");
  const type = formData.get("type") as BankTransactionType;
  const amount = Number(formData.get("amount") || 0);
  const label = String(formData.get("label") ?? "");
  if (!bankAccountId || amount <= 0 || !label) return;

  const transaction = await prisma.bankTransaction.create({
    data: { bankAccountId, type, amount, label, createdBy: user.id },
  });

  await logActivity({
    userId: user.id,
    action: "bank_transaction.created",
    entityType: "bank_transaction",
    entityId: transaction.id,
  });

  revalidatePath("/tresorerie");
}
