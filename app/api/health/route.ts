import { NextResponse } from "next/server";
import { prisma, dbUrl } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let db: "up" | "down" | "not-configured" = "not-configured";
  if (dbUrl()) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = "up";
    } catch {
      db = "down";
    }
  }
  const ok = db !== "down";
  return NextResponse.json(
    { ok, app: "dayly-web", version: "0.1.0", db },
    { status: ok ? 200 : 500 },
  );
}
