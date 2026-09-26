"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import type { PipelineStage } from "@/generated/prisma/client";

const customerSchema = z.object({
  companyName: z.string().min(1, "Nom obligatoire"),
  type: z.enum(["PROSPECT", "CUSTOMER"]),
  siret: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

function parseForm(formData: FormData) {
  return customerSchema.parse({
    companyName: formData.get("companyName"),
    type: formData.get("type"),
    siret: formData.get("siret") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createCustomer(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("clients");
  const data = parseForm(formData);

  const customer = await prisma.customer.create({
    data: { ...data, createdBy: user.id },
  });

  await logActivity({
    userId: user.id,
    action: "customer.created",
    entityType: "customer",
    entityId: customer.id,
  });

  revalidatePath("/clients");
  redirect(`/clients/${customer.id}`);
}

export async function updateCustomer(
  id: string,
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("clients");
  const data = parseForm(formData);

  await prisma.customer.update({ where: { id }, data });

  await logActivity({
    userId: user.id,
    action: "customer.updated",
    entityType: "customer",
    entityId: id,
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return "Client mis à jour.";
}

export async function updatePipelineStage(
  id: string,
  stage: PipelineStage
): Promise<void> {
  const user = await requireWriteAccess("clients");

  await prisma.customer.update({
    where: { id },
    data: { pipelineStage: stage },
  });

  await logActivity({
    userId: user.id,
    action: "customer.pipeline_stage_changed",
    entityType: "customer",
    entityId: id,
    changes: { pipelineStage: stage },
  });

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
}

export async function addCustomerContact(
  customerId: string,
  formData: FormData
): Promise<void> {
  const user = await requireWriteAccess("clients");

  await prisma.contact.create({
    data: {
      customerId,
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      role: (formData.get("role") as string) || null,
    },
  });

  await logActivity({
    userId: user.id,
    action: "customer.contact_added",
    entityType: "customer",
    entityId: customerId,
  });

  revalidatePath(`/clients/${customerId}`);
}
