"use server";

import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function uploadDocument(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("documents");

  const file = formData.get("file") as File | null;
  const entityType = (formData.get("entityType") as string) || "general";
  const entityId = (formData.get("entityId") as string) || "general";

  if (!file || file.size === 0) return "Sélectionnez un fichier.";
  if (file.size > 20 * 1024 * 1024) return "Fichier trop volumineux (max 20 Mo).";

  await mkdir(UPLOAD_DIR, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const storedName = `${randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  const document = await prisma.document.create({
    data: {
      entityType,
      entityId,
      filename: file.name,
      path: `/uploads/${storedName}`,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      createdBy: user.id,
    },
  });

  await logActivity({
    userId: user.id,
    action: "document.uploaded",
    entityType: "document",
    entityId: document.id,
  });

  revalidatePath("/documents");
  return undefined;
}
