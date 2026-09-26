"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import { nextDocumentNumber } from "@/lib/numbering";
import { parseLineItems, computeTotals } from "@/lib/line-items";
import type { InvoiceStatus, InvoiceType, PaymentMethod } from "@/generated/prisma/client";

const PAYMENT_METHODS: PaymentMethod[] = ["VIREMENT", "CHEQUE", "CB", "ESPECES", "AUTRE"];

export async function createInvoice(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("factures");

  const type = formData.get("type") as InvoiceType;
  const customerId = (formData.get("customerId") as string) || null;
  const supplierId = (formData.get("supplierId") as string) || null;
  const saleId = (formData.get("saleId") as string) || null;
  const purchaseOrderId = (formData.get("purchaseOrderId") as string) || null;
  const dueDate = formData.get("dueDate") as string | null;

  if (type === "CLIENT" || type === "AVOIR" || type === "ACOMPTE") {
    if (!customerId) return "Client obligatoire pour ce type de facture.";
  }
  if (type === "FOURNISSEUR") {
    if (!supplierId) return "Fournisseur obligatoire pour une facture fournisseur.";
  }

  const items = parseLineItems(formData);
  if (items.length === 0) return "Ajoutez au moins une ligne.";
  const totals = computeTotals(items);

  const number = await nextDocumentNumber(
    type === "FOURNISSEUR" ? "invoiceSupplier" : "invoiceClient"
  );

  const invoice = await prisma.invoice.create({
    data: {
      number,
      type,
      dueDate: dueDate ? new Date(dueDate) : null,
      customerId: type === "FOURNISSEUR" ? null : customerId,
      supplierId: type === "FOURNISSEUR" ? supplierId : null,
      saleId,
      purchaseOrderId,
      totalHt: totals.totalHt,
      totalTva: totals.totalTva,
      totalTtc: totals.totalTtc,
      createdBy: user.id,
      items: {
        create: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceHt: item.unitPriceHt,
          vatRate: item.vatRate,
        })),
      },
    },
  });

  await logActivity({
    userId: user.id,
    action: "invoice.created",
    entityType: "invoice",
    entityId: invoice.id,
  });

  revalidatePath("/factures");
  redirect(`/factures/${invoice.id}`);
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<void> {
  const user = await requireWriteAccess("factures");
  await prisma.invoice.update({ where: { id }, data: { status } });
  await logActivity({
    userId: user.id,
    action: "invoice.status_changed",
    entityType: "invoice",
    entityId: id,
    changes: { status },
  });
  revalidatePath(`/factures/${id}`);
  revalidatePath("/factures");
}

export async function addPayment(
  invoiceId: string,
  formData: FormData
): Promise<void> {
  const user = await requireWriteAccess("factures");

  const amount = Number(formData.get("amount") || 0);
  const methodInput = String(formData.get("method") ?? "");
  const reference = (formData.get("reference") as string) || null;
  if (amount <= 0) return;
  if (!PAYMENT_METHODS.includes(methodInput as PaymentMethod)) return;
  const method = methodInput as PaymentMethod;

  await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      method,
      reference,
      createdBy: user.id,
    },
  });

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (invoice) {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (totalPaid >= Number(invoice.totalTtc) && invoice.status !== "PAYEE") {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAYEE" },
      });

      if (invoice.type === "CLIENT" && invoice.customerId) {
        await prisma.customer.update({
          where: { id: invoice.customerId },
          data: { pipelineStage: "PAYE" },
        });
      }
    }
  }

  await logActivity({
    userId: user.id,
    action: "invoice.payment_added",
    entityType: "invoice",
    entityId: invoiceId,
    changes: { amount },
  });

  revalidatePath(`/factures/${invoiceId}`);
  revalidatePath("/tresorerie");
}
