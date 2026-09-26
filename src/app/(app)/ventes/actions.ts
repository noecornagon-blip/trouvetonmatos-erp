"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import { nextDocumentNumber } from "@/lib/numbering";
import { parseLineItems, computeTotals } from "@/lib/line-items";
import type { SaleStatus } from "@/generated/prisma/client";

export async function createSale(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("ventes");

  const customerId = String(formData.get("customerId") ?? "");
  if (!customerId) return "Client obligatoire.";

  const items = parseLineItems(formData);
  if (items.length === 0) return "Ajoutez au moins une ligne.";
  const totals = computeTotals(items);

  const number = await nextDocumentNumber("sale");

  const sale = await prisma.sale.create({
    data: {
      number,
      customerId,
      totalHt: totals.totalHt,
      totalTva: totals.totalTva,
      totalTtc: totals.totalTtc,
      totalCostHt: totals.totalCostHt,
      marginHt: totals.marginHt,
      items: {
        create: items.map((item) => ({
          equipmentId: item.equipmentId,
          description: item.description,
          quantity: item.quantity,
          unitPriceHt: item.unitPriceHt,
          unitCostHt: item.unitCostHt,
          vatRate: item.vatRate,
        })),
      },
    },
  });

  await logActivity({
    userId: user.id,
    action: "sale.created",
    entityType: "sale",
    entityId: sale.id,
  });

  revalidatePath("/ventes");
  redirect(`/ventes/${sale.id}`);
}

export async function updateSaleStatus(id: string, status: SaleStatus): Promise<void> {
  const user = await requireWriteAccess("ventes");
  await prisma.sale.update({ where: { id }, data: { status } });

  if (status === "PAYEE" || status === "FACTUREE") {
    const sale = await prisma.sale.findUnique({ where: { id } });
    if (sale) {
      await prisma.customer.update({
        where: { id: sale.customerId },
        data: { pipelineStage: status === "PAYEE" ? "PAYE" : "FACTURATION" },
      });
    }
  }

  await logActivity({
    userId: user.id,
    action: "sale.status_changed",
    entityType: "sale",
    entityId: id,
    changes: { status },
  });
  revalidatePath(`/ventes/${id}`);
  revalidatePath("/ventes");
}
