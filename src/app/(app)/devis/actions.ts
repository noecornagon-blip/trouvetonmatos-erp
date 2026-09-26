"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import { nextDocumentNumber } from "@/lib/numbering";
import { parseLineItems, computeTotals } from "@/lib/line-items";
import type { QuoteStatus } from "@/generated/prisma/client";

export async function createQuote(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("devis");

  const customerId = String(formData.get("customerId") ?? "");
  const requestId = (formData.get("requestId") as string) || null;
  const validUntil = formData.get("validUntil") as string | null;
  const notes = (formData.get("notes") as string) || null;

  if (!customerId) return "Client obligatoire.";

  const items = parseLineItems(formData);
  if (items.length === 0) return "Ajoutez au moins une ligne.";
  const totals = computeTotals(items);

  const number = await nextDocumentNumber("quote");

  const quote = await prisma.quote.create({
    data: {
      number,
      customerId,
      validUntil: validUntil ? new Date(validUntil) : null,
      notes,
      totalHt: totals.totalHt,
      totalTva: totals.totalTva,
      totalTtc: totals.totalTtc,
      createdBy: user.id,
      items: {
        create: items.map((item) => ({
          equipmentId: item.equipmentId,
          description: item.description,
          quantity: item.quantity,
          unitPriceHt: item.unitPriceHt,
          vatRate: item.vatRate,
        })),
      },
    },
  });

  if (requestId) {
    await prisma.request.update({
      where: { id: requestId },
      data: { status: "PROPOSITION_ENVOYEE" },
    });
  }

  await logActivity({
    userId: user.id,
    action: "quote.created",
    entityType: "quote",
    entityId: quote.id,
  });

  revalidatePath("/devis");
  redirect(`/devis/${quote.id}`);
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus
): Promise<void> {
  const user = await requireWriteAccess("devis");
  await prisma.quote.update({ where: { id }, data: { status } });
  await logActivity({
    userId: user.id,
    action: "quote.status_changed",
    entityType: "quote",
    entityId: id,
    changes: { status },
  });
  revalidatePath(`/devis/${id}`);
  revalidatePath("/devis");
}

export async function convertQuoteToSale(quoteId: string): Promise<void> {
  const user = await requireWriteAccess("ventes");

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { items: true, sale: true },
  });
  if (!quote || quote.sale) return;

  const number = await nextDocumentNumber("sale");

  const sale = await prisma.sale.create({
    data: {
      number,
      customerId: quote.customerId,
      quoteId: quote.id,
      totalHt: quote.totalHt,
      totalTva: quote.totalTva,
      totalTtc: quote.totalTtc,
      items: {
        create: quote.items.map((item) => ({
          equipmentId: item.equipmentId,
          description: item.description,
          quantity: item.quantity,
          unitPriceHt: item.unitPriceHt,
          vatRate: item.vatRate,
        })),
      },
    },
  });

  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: "ACCEPTE" },
  });

  await prisma.customer.update({
    where: { id: quote.customerId },
    data: { pipelineStage: "COMMANDE" },
  });

  await logActivity({
    userId: user.id,
    action: "quote.converted_to_sale",
    entityType: "quote",
    entityId: quoteId,
    changes: { saleId: sale.id },
  });

  revalidatePath(`/devis/${quoteId}`);
  revalidatePath("/ventes");
}
