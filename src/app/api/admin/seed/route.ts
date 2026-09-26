import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDemoData } from "@/lib/seed-data";

// Route temporaire de bootstrap : charge les données de démonstration en
// production quand l'environnement qui exécute la commande d'administration
// n'a pas d'accès réseau direct à la base. Protégée par un jeton à usage
// unique, à retirer après utilisation.
const ONE_TIME_TOKEN = "f2b412844375d8138c79d2b32a3707762a91170b5fa9c734";

async function handle(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== ONE_TIME_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await seedDemoData(prisma);
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
