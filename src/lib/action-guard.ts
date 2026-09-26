import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canWrite, type Module } from "@/lib/permissions";
import type { Prisma } from "@/generated/prisma/client";

export class ForbiddenError extends Error {
  constructor(message = "Action non autorisée pour votre rôle.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Verifies the request has a valid session and write access to `module`.
 * Proxy already gates page access, but Server Functions are their own
 * routes (see Next 16 proxy docs) so every mutating action re-checks here.
 */
export async function requireWriteAccess(module: Module) {
  const session = await auth();
  if (!session?.user) {
    throw new ForbiddenError("Vous devez être connecté.");
  }
  if (!canWrite(session.user.role, module)) {
    throw new ForbiddenError();
  }
  return session.user;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new ForbiddenError("Vous devez être connecté.");
  }
  return session.user;
}

export async function logActivity(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Prisma.InputJsonValue;
}) {
  await prisma.activityLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      changes: params.changes,
    },
  });
}
