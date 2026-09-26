"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";

const supplierSchema = z.object({
  companyName: z.string().min(1, "Nom obligatoire"),
  siret: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

function parseForm(formData: FormData) {
  return supplierSchema.parse({
    companyName: formData.get("companyName"),
    siret: formData.get("siret") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createSupplier(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("fournisseurs");
  const data = parseForm(formData);

  const supplier = await prisma.supplier.create({
    data: { ...data, createdBy: user.id },
  });

  await logActivity({
    userId: user.id,
    action: "supplier.created",
    entityType: "supplier",
    entityId: supplier.id,
  });

  revalidatePath("/fournisseurs");
  redirect(`/fournisseurs/${supplier.id}`);
}

export async function updateSupplier(
  id: string,
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("fournisseurs");
  const data = parseForm(formData);

  await prisma.supplier.update({ where: { id }, data });

  await logActivity({
    userId: user.id,
    action: "supplier.updated",
    entityType: "supplier",
    entityId: id,
  });

  revalidatePath("/fournisseurs");
  revalidatePath(`/fournisseurs/${id}`);
  return "Fournisseur mis à jour.";
}

export async function addSupplierContact(
  supplierId: string,
  formData: FormData
): Promise<void> {
  const user = await requireWriteAccess("fournisseurs");

  await prisma.contact.create({
    data: {
      supplierId,
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      role: (formData.get("role") as string) || null,
    },
  });

  await logActivity({
    userId: user.id,
    action: "supplier.contact_added",
    entityType: "supplier",
    entityId: supplierId,
  });

  revalidatePath(`/fournisseurs/${supplierId}`);
  return undefined;
}
