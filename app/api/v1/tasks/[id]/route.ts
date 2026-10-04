import { NextRequest, NextResponse } from "next/server";
import { prisma, dbUrl } from "@/lib/db";
import { requireAppUser, toHttpError, isAuthConfigured } from "@/lib/auth";

import { validate, taskUpdateSchema } from "@/lib/validation";

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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = unavailable();
  if (blocked) return blocked;
  try {
    const user = await requireAppUser();
    const item = await prisma.task.findFirst({ where: { id: params.id, userId: user.id } });
    if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Task not found" } }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = unavailable();
  if (blocked) return blocked;
  try {
    const user = await requireAppUser();
    const existing = await prisma.task.findFirst({ where: { id: params.id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Task not found" } }, { status: 404 });
    }
    const body = validate(taskUpdateSchema, await req.json());
    const item = await prisma.task.update({
      where: { id: existing.id },
      data: { ...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined },
    });
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
    const existing = await prisma.task.findFirst({ where: { id: params.id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Task not found" } }, { status: 404 });
    }
    await prisma.task.delete({ where: { id: existing.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
