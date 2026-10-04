import { NextRequest, NextResponse } from "next/server";
import { prisma, dbUrl } from "@/lib/db";
import { requireAppUser, toHttpError, isAuthConfigured } from "@/lib/auth";

import { validate, goalUpdateSchema } from "@/lib/validation";

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = unavailable();
  if (blocked) return blocked;
  try {
    const user = await requireAppUser();
    const existing = await prisma.goal.findFirst({ where: { id: params.id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Goal not found" } }, { status: 404 });
    }
    const body = validate(goalUpdateSchema, await req.json());
    const item = await prisma.goal.update({ where: { id: existing.id }, data: body });
    return NextResponse.json({ item });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = unavailable();
  if (blocked) return blocked;
  try {
    const user = await requireAppUser();
    const existing = await prisma.goal.findFirst({ where: { id: params.id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Goal not found" } }, { status: 404 });
    }
    await prisma.goal.delete({ where: { id: existing.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
