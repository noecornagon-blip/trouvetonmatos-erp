"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";

export async function createVatRecord(formData: FormData): Promise<void> {
  const user = await requireWriteAccess("tresorerie");

  const periodStart = new Date(String(formData.get("periodStart")));
  const periodEnd = new Date(String(formData.get("periodEnd")));
  if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) return;

  const [clientInvoices, supplierInvoices, expenses] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        type: "CLIENT",
        issueDate: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.invoice.findMany({
      where: {
        type: "FOURNISSEUR",
        issueDate: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.expense.findMany({
      where: { expenseDate: { gte: periodStart, lte: periodEnd } },
    }),
  ]);

  const vatCollected = clientInvoices.reduce((sum, i) => sum + Number(i.totalTva), 0);
  const vatDeductible =
    supplierInvoices.reduce((sum, i) => sum + Number(i.totalTva), 0) +
    expenses.reduce((sum, e) => sum + Number(e.vatAmount), 0);

  const record = await prisma.vatRecord.create({
    data: { periodStart, periodEnd, vatCollected, vatDeductible },
  });

  await logActivity({
    userId: user.id,
    action: "vat_record.created",
    entityType: "vat_record",
    entityId: record.id,
  });

  revalidatePath("/tva");
}

export async function validateVatRecord(id: string): Promise<void> {
  const user = await requireWriteAccess("tresorerie");
  await prisma.vatRecord.update({ where: { id }, data: { status: "VALIDE" } });
  await logActivity({
    userId: user.id,
    action: "vat_record.validated",
    entityType: "vat_record",
    entityId: id,
  });
  revalidatePath("/tva");
}
