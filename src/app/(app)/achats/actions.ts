"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import { nextDocumentNumber } from "@/lib/numbering";
import { parseLineItems, computeTotals } from "@/lib/line-items";
import type { PurchaseOrderStatus } from "@/generated/prisma/client";

export async function createPurchaseOrder(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("achats");

  const supplierId = String(formData.get("supplierId") ?? "");
  if (!supplierId) return "Fournisseur obligatoire.";

  const transportCost = Number(formData.get("transportCost") || 0);
  const otherFees = Number(formData.get("otherFees") || 0);

  const items = parseLineItems(formData);
  if (items.length === 0) return "Ajoutez au moins une ligne.";
  const totals = computeTotals(items);

  const number = await nextDocumentNumber("purchaseOrder");

  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      number,
      supplierId,
      transportCost,
      otherFees,
      totalHt: totals.totalHt,
      totalTva: totals.totalTva,
      totalTtc: totals.totalTtc,
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

  await logActivity({
    userId: user.id,
    action: "purchase_order.created",
    entityType: "purchase_order",
    entityId: purchaseOrder.id,
  });

  revalidatePath("/achats");
  redirect(`/achats/${purchaseOrder.id}`);
}

export async function updatePurchaseOrderStatus(
  id: string,
  status: PurchaseOrderStatus
): Promise<void> {
  const user = await requireWriteAccess("achats");

  await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status,
      receivedDate: status === "RECU" ? new Date() : undefined,
    },
  });

  if (status === "RECU") {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    const equipmentIds = po?.items
      .map((i) => i.equipmentId)
      .filter((id): id is string => !!id);
    if (equipmentIds && equipmentIds.length > 0) {
      await prisma.equipment.updateMany({
        where: { id: { in: equipmentIds }, status: "RESERVE" },
        data: { status: "DISPONIBLE" },
      });
    }
  }

  await logActivity({
    userId: user.id,
    action: "purchase_order.status_changed",
    entityType: "purchase_order",
    entityId: id,
    changes: { status },
  });
  revalidatePath(`/achats/${id}`);
  revalidatePath("/achats");
}
