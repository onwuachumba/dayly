import { NextRequest, NextResponse } from "next/server";
import { prisma, dbUrl } from "@/lib/db";
import { requireAppUser, toHttpError, isAuthConfigured } from "@/lib/auth";


function unavailable() {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: { code: "AUTH_NOT_CONFIGURED", message: "Authentication is not configured — see .env.example" } },
      { status: 503 },
    );
  }
  if (!dbUrl()) {
    return NextResponse.json(
      { error: { code: "DB_NOT_CONFIGURED", message: "DATABASE_URL is missing — see .env.example" } },
      { status: 503 },
    );
  }
  return null;
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = unavailable();
  if (blocked) return blocked;
  try {
    const user = await requireAppUser();
    const existing = await prisma.reminder.findFirst({ where: { id: params.id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Reminder not found" } }, { status: 404 });
    }
    await prisma.reminder.delete({ where: { id: existing.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
