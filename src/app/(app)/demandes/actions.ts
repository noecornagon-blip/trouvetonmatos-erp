"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import type { RequestStatus, RequestPriority } from "@/generated/prisma/client";

const requestSchema = z.object({
  customerId: z.string().min(1, "Client obligatoire"),
  title: z.string().min(1, "Titre obligatoire"),
  description: z.string().optional(),
  priority: z.enum(["BASSE", "NORMALE", "HAUTE", "URGENTE"]),
  criteriaNotes: z.string().optional(),
});

export async function createRequest(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("demandes");
  const data = requestSchema.parse({
    customerId: formData.get("customerId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priority: formData.get("priority"),
    criteriaNotes: formData.get("criteriaNotes") || undefined,
  });

  const request = await prisma.request.create({
    data: {
      customerId: data.customerId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      criteria: data.criteriaNotes ? { notes: data.criteriaNotes } : undefined,
      createdBy: user.id,
    },
  });

  await logActivity({
    userId: user.id,
    action: "request.created",
    entityType: "request",
    entityId: request.id,
  });

  // Automatisation §25 : créer une tâche de recherche pour le responsable
  await prisma.task.create({
    data: {
      title: `Rechercher du matériel pour : ${request.title}`,
      priority: data.priority,
      requestId: request.id,
      assigneeId: user.id,
      createdBy: user.id,
    },
  });

  revalidatePath("/demandes");
  redirect(`/demandes/${request.id}`);
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus
): Promise<void> {
  const user = await requireWriteAccess("demandes");
  await prisma.request.update({ where: { id }, data: { status } });
  await logActivity({
    userId: user.id,
    action: "request.status_changed",
    entityType: "request",
    entityId: id,
    changes: { status },
  });
  revalidatePath(`/demandes/${id}`);
  revalidatePath("/demandes");
}

export async function createMatch(
  requestId: string,
  formData: FormData
): Promise<void> {
  const user = await requireWriteAccess("demandes");
  const equipmentId = String(formData.get("equipmentId") ?? "");
  const matchScore = Number(formData.get("matchScore") ?? 0);
  if (!equipmentId) return;

  await prisma.equipmentMatch.upsert({
    where: { requestId_equipmentId: { requestId, equipmentId } },
    update: { matchScore },
    create: { requestId, equipmentId, matchScore },
  });

  await logActivity({
    userId: user.id,
    action: "request.match_added",
    entityType: "request",
    entityId: requestId,
    changes: { equipmentId, matchScore },
  });

  revalidatePath(`/demandes/${requestId}`);
}

export async function updateRequestPriority(
  id: string,
  priority: RequestPriority
): Promise<void> {
  const user = await requireWriteAccess("demandes");
  await prisma.request.update({ where: { id }, data: { priority } });
  await logActivity({
    userId: user.id,
    action: "request.priority_changed",
    entityType: "request",
    entityId: id,
    changes: { priority },
  });
  revalidatePath(`/demandes/${id}`);
}
