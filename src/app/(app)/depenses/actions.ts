"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import { recordAccountingEntry } from "@/lib/accounting";

export async function createExpense(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("tresorerie");

  const label = String(formData.get("label") ?? "").trim();
  const amount = Number(formData.get("amount") || 0);
  const vatAmount = Number(formData.get("vatAmount") || 0);
  const category = (formData.get("category") as string) || null;
  const expenseDate = formData.get("expenseDate") as string | null;

  if (!label || amount <= 0) return "Libellé et montant obligatoires.";

  const expense = await prisma.expense.create({
    data: {
      label,
      amount,
      vatAmount,
      category,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      createdBy: user.id,
    },
  });

  await recordAccountingEntry({
    label: `Dépense : ${label}`,
    debitAccount: "6 - Charges",
    creditAccount: "512 - Banque",
    amount,
    sourceType: "EXPENSE",
    sourceId: expense.id,
  });

  await logActivity({
    userId: user.id,
    action: "expense.created",
    entityType: "expense",
    entityId: expense.id,
  });

  revalidatePath("/depenses");
  redirect("/depenses");
}
