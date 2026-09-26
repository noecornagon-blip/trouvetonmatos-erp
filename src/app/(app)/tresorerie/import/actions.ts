"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";

/**
 * Format CSV attendu : date,libellé,montant
 * Un montant positif est un encaissement, négatif un décaissement.
 * Pas de connexion bancaire directe en MVP — import manuel uniquement.
 */
export async function importBankCsv(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("tresorerie");

  const bankAccountId = String(formData.get("bankAccountId") ?? "");
  const file = formData.get("file") as File | null;
  if (!bankAccountId || !file || file.size === 0) {
    return "Sélectionnez un compte et un fichier CSV.";
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const batch = `import-${Date.now()}`;

  let imported = 0;
  for (const line of lines) {
    const [rawDate, rawLabel, rawAmount] = line.split(",").map((v) => v.trim());
    const date = new Date(rawDate);
    const amount = Number(rawAmount);
    if (isNaN(date.getTime()) || isNaN(amount) || amount === 0 || !rawLabel) {
      continue; // ligne d'en-tête ou invalide, ignorée
    }

    await prisma.bankTransaction.create({
      data: {
        bankAccountId,
        type: amount >= 0 ? "ENCAISSEMENT" : "DECAISSEMENT",
        amount: Math.abs(amount),
        label: rawLabel,
        transactionDate: date,
        importBatch: batch,
        createdBy: user.id,
      },
    });
    imported++;
  }

  await logActivity({
    userId: user.id,
    action: "bank_transaction.imported",
    entityType: "bank_account",
    entityId: bankAccountId,
    changes: { batch, imported },
  });

  revalidatePath("/tresorerie");
  redirect("/tresorerie");
}

export async function reconcileTransaction(id: string): Promise<void> {
  const user = await requireWriteAccess("tresorerie");
  await prisma.bankTransaction.update({ where: { id }, data: { reconciled: true } });
  await logActivity({
    userId: user.id,
    action: "bank_transaction.reconciled",
    entityType: "bank_transaction",
    entityId: id,
  });
  revalidatePath("/tresorerie");
}
