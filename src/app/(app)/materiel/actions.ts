"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import type { EquipmentStatus } from "@/generated/prisma/client";

const equipmentSchema = z.object({
  name: z.string().min(1, "Nom obligatoire"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().optional(),
  condition: z.enum(["NEUF", "OCCASION", "RECONDITIONNE"]),
  priceHt: z.coerce.number().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  supplierId: z.string().optional(),
  categoryId: z.string().optional(),
});

function parseForm(formData: FormData) {
  return equipmentSchema.parse({
    name: formData.get("name"),
    brand: formData.get("brand") || undefined,
    model: formData.get("model") || undefined,
    year: formData.get("year") || undefined,
    condition: formData.get("condition"),
    priceHt: formData.get("priceHt") || undefined,
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    supplierId: formData.get("supplierId") || undefined,
    categoryId: formData.get("categoryId") || undefined,
  });
}

export async function createEquipment(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("materiel");
  const data = parseForm(formData);

  const equipment = await prisma.equipment.create({
    data: { ...data, createdBy: user.id },
  });

  await logActivity({
    userId: user.id,
    action: "equipment.created",
    entityType: "equipment",
    entityId: equipment.id,
  });

  revalidatePath("/materiel");
  redirect(`/materiel/${equipment.id}`);
}

export async function updateEquipment(
  id: string,
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("materiel");
  const data = parseForm(formData);

  await prisma.equipment.update({ where: { id }, data });

  await logActivity({
    userId: user.id,
    action: "equipment.updated",
    entityType: "equipment",
    entityId: id,
  });

  revalidatePath("/materiel");
  revalidatePath(`/materiel/${id}`);
  return "Matériel mis à jour.";
}

export async function updateEquipmentStatus(
  id: string,
  status: EquipmentStatus
): Promise<void> {
  const user = await requireWriteAccess("materiel");
  await prisma.equipment.update({ where: { id }, data: { status } });
  await logActivity({
    userId: user.id,
    action: "equipment.status_changed",
    entityType: "equipment",
    entityId: id,
    changes: { status },
  });
  revalidatePath(`/materiel/${id}`);
  revalidatePath("/materiel");
}

export async function createCategory(formData: FormData): Promise<void> {
  await requireWriteAccess("materiel");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await prisma.equipmentCategory.create({ data: { name } });
  revalidatePath("/materiel");
  revalidatePath("/materiel/new");
}
