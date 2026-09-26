"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, logActivity } from "@/lib/action-guard";
import type { SocialPostStatus, SocialPlatform } from "@/generated/prisma/client";

const PLATFORMS: SocialPlatform[] = ["LINKEDIN", "FACEBOOK", "INSTAGRAM", "AUTRE"];

export async function createSocialPost(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const user = await requireWriteAccess("reseaux_sociaux");

  const platformInput = String(formData.get("platform") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const scheduledAt = formData.get("scheduledAt") as string | null;

  if (!content) return "Le contenu est obligatoire.";
  if (!PLATFORMS.includes(platformInput as SocialPlatform)) return "Plateforme invalide.";
  const platform = platformInput as SocialPlatform;

  const post = await prisma.socialPost.create({
    data: {
      platform,
      content,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? "PLANIFIE" : "BROUILLON",
      createdBy: user.id,
    },
  });

  await logActivity({
    userId: user.id,
    action: "social_post.created",
    entityType: "social_post",
    entityId: post.id,
  });

  revalidatePath("/reseaux-sociaux");
  redirect("/reseaux-sociaux");
}

export async function updateSocialPostStatus(
  id: string,
  status: SocialPostStatus
): Promise<void> {
  const user = await requireWriteAccess("reseaux_sociaux");
  await prisma.socialPost.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLIE" ? new Date() : undefined,
    },
  });
  await logActivity({
    userId: user.id,
    action: "social_post.status_changed",
    entityType: "social_post",
    entityId: id,
    changes: { status },
  });
  revalidatePath("/reseaux-sociaux");
}
