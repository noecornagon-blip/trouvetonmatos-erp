import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ONE_TIME_TOKEN = "f2b412844375d8138c79d2b32a3707762a91170b5fa9c734";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== ONE_TIME_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let dbReachable = false;
  let dbError: string | null = null;
  let userCount = 0;
  try {
    userCount = await prisma.user.count();
    dbReachable = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "unknown",
    env: process.env.VERCEL_ENV ?? "unknown",
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasAuthSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    dbReachable,
    dbError,
    userCount,
  });
}
