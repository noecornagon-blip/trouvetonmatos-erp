"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import type { TaskStatus } from "@/generated/prisma/client";

const taskSchema = z.object({
  title: z.string().min(1, "Titre obligatoire"),
  description: z.string().optional(),
  priority: z.enum(["BASSE", "NORMALE", "HAUTE", "URGENTE"]),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function createTask(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("taches");
  const data = taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priority: formData.get("priority"),
    assigneeId: formData.get("assigneeId") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      assigneeId: data.assigneeId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      createdBy: user.id,
    },
  });

  await logActivity({
    userId: user.id,
    action: "task.created",
    entityType: "task",
    entityId: task.id,
  });

  revalidatePath("/taches");
  redirect("/taches");
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<void> {
  const user = await requireWriteAccess("taches");
  await prisma.task.update({ where: { id }, data: { status } });
  await logActivity({
    userId: user.id,
    action: "task.status_changed",
    entityType: "task",
    entityId: id,
    changes: { status },
  });
  revalidatePath("/taches");
}
